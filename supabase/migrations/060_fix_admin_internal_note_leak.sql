-- 060_fix_admin_internal_note_leak.sql
--
-- Migration 043 correctly hid internal (staff-only) support notes from the
-- requester's own "Users read/send own messages" policy, but never touched
-- the separate "Admins manage all messages" policy from 039 — which grants
-- any admin/super_admin blanket access to every row in support_messages,
-- with no is_internal exception.
--
-- RLS combines multiple permissive policies with OR, so an admin/super_admin
-- account viewing the regular customer-facing "My Messages" page (which uses
-- the RLS-respecting client, not service-role) could see internal notes on
-- their own conversations via this second policy — even though the first
-- policy correctly hides them.
--
-- The actual admin panel (/admin/chat) is unaffected by this change: it goes
-- through requireAdmin() + the service-role client, which bypasses RLS
-- entirely, so admins still see internal notes there exactly as intended.

drop policy if exists "Admins manage all messages" on public.support_messages;
create policy "Admins manage all messages"
  on public.support_messages for all
  using (
    is_internal = false
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  )
  with check (
    is_internal = false
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );
