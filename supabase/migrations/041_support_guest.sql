-- 041_support_guest.sql
-- Allow support conversations from guests (not-logged-in contact-form submitters).
-- A guest has no profile, so user_id / message sender_id become optional and we
-- store the requester's typed name + email on the conversation instead.

alter table public.support_conversations
  alter column user_id drop not null;

alter table public.support_conversations
  add column if not exists requester_email text,
  add column if not exists requester_name  text;

-- Every conversation must be reachable: either a logged-in owner or a guest email.
alter table public.support_conversations
  drop constraint if exists support_conversations_requester_check;
alter table public.support_conversations
  add constraint support_conversations_requester_check
  check (user_id is not null or requester_email is not null);

-- Guest messages have no profile author; sender_role still distinguishes sides.
alter table public.support_messages
  alter column sender_id drop not null;
