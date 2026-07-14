-- 039_support_chat.sql
-- Support ticketing system (Day 5: Overview / Analytics / Support).
-- In-app support conversations for logged-in users and merchants, plus the
-- 'support' admin permission module.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.support_conversations (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  merchant_id        uuid references public.merchants(id) on delete set null,
  subject            text not null,
  status             text not null default 'open'
                       check (status in ('open','pending','resolved','closed')),
  priority           text not null default 'normal'
                       check (priority in ('low','normal','high')),
  assigned_to        uuid references public.profiles(id) on delete set null,
  delivery_reference text,  -- Evermile order ref for delivery escalations (P1: deep-link only)
  last_message_at    timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.support_messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  sender_role     text not null check (sender_role in ('user','admin')),
  body            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_support_conv_user        on public.support_conversations(user_id);
create index if not exists idx_support_conv_status      on public.support_conversations(status);
create index if not exists idx_support_conv_assigned    on public.support_conversations(assigned_to);
create index if not exists idx_support_msg_conversation on public.support_messages(conversation_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists support_conversations_updated_at on public.support_conversations;
create trigger support_conversations_updated_at
  before update on public.support_conversations
  for each row execute function update_updated_at();

-- Keep last_message_at + status in sync when a message is inserted.
create or replace function sync_support_conversation_on_message()
returns trigger language plpgsql as $$
begin
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

drop trigger if exists support_messages_sync on public.support_messages;
create trigger support_messages_sync
  after insert on public.support_messages
  for each row execute function sync_support_conversation_on_message();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "Users manage own conversations" on public.support_conversations;
create policy "Users manage own conversations"
  on public.support_conversations for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Admins manage all conversations" on public.support_conversations;
create policy "Admins manage all conversations"
  on public.support_conversations for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')));

drop policy if exists "Users read/send own messages" on public.support_messages;
create policy "Users read/send own messages"
  on public.support_messages for all
  using (exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = auth.uid()));

drop policy if exists "Admins manage all messages" on public.support_messages;
create policy "Admins manage all messages"
  on public.support_messages for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')));

-- ---------------------------------------------------------------------------
-- Permission model: add the 'support' module
-- ---------------------------------------------------------------------------

alter table public.admin_permissions drop constraint if exists admin_permissions_module_check;
alter table public.admin_permissions add constraint admin_permissions_module_check
  check (module in ('merchants','users','kitchen','hub','rewards','analytics','support'));

-- Grandfather existing admins (same pattern as 036_admin_roles.sql).
insert into public.admin_permissions (user_id, module, access)
select id, 'support', 'manage' from public.profiles where role = 'admin'
on conflict (user_id, module) do nothing;
