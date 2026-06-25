-- 043_support_internal_notes.sql
-- Internal (staff-only) notes on support conversations + keep them invisible to
-- the requester.
--
--   - support_messages.is_internal marks a message as a private staff note.
--   - The requester's RLS policy is re-created to EXCLUDE internal notes, so a
--     customer can never read a note even though it lives in their conversation.
--   - The conversation-sync trigger ignores internal notes (a note isn't a reply,
--     so it must not flip status to 'pending' or bump last_message_at).

alter table public.support_messages
  add column if not exists is_internal boolean not null default false;

-- Requester policy: same ownership rule, but internal notes are filtered out.
-- (Admins use the service role in API routes and still see everything.)
drop policy if exists "Users read/send own messages" on public.support_messages;
create policy "Users read/send own messages"
  on public.support_messages for all
  using (
    is_internal = false
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  )
  with check (
    is_internal = false
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- Internal notes don't change the conversation's customer-facing state.
create or replace function sync_support_conversation_on_message()
returns trigger language plpgsql as $$
begin
  if new.is_internal then
    return new;
  end if;
  update public.support_conversations
  set last_message_at = new.created_at,
      status = case
        when new.sender_role = 'admin' then 'pending'
        else 'open'
      end,
      assigned_to = case
        when new.sender_role = 'admin' and assigned_to is null then new.sender_id
        else assigned_to
      end
  where id = new.conversation_id;
  return new;
end;
$$;
