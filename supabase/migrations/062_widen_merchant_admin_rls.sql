-- 062_widen_merchant_admin_rls.sql
--
-- "Admins manage all merchants/documents/commission" policies only checked
-- role = 'admin', excluding 'super_admin'. Currently masked because all real
-- admin writes go through service-role routes (which bypass RLS entirely),
-- but a super_admin session using the RLS-respecting client directly would
-- be silently blocked. Widen to match the pattern already used elsewhere
-- (e.g. 037_merchant_rep_link.sql's role IN ('admin','super_admin')).

drop policy if exists "Admins manage all merchants" on public.merchants;
create policy "Admins manage all merchants"
  on public.merchants for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')));

drop policy if exists "Admins manage all documents" on public.merchant_documents;
create policy "Admins manage all documents"
  on public.merchant_documents for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')));

drop policy if exists "Admins manage all commission" on public.merchant_commission;
create policy "Admins manage all commission"
  on public.merchant_commission for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')));
