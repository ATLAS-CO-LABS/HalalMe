-- 044_content_reports.sql
-- User-submitted reports of posts, comments and recipes — the intake that feeds
-- the admin "Reported" moderation queue.
--
--   - One row per (content, reporter): a user can't spam-report the same item.
--   - Users may create and read their OWN reports; only admins read all of them.
--   - Admins resolve via the service role in API routes (status open→reviewed/dismissed).

create table if not exists public.content_reports (
  id           uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('post','comment','recipe')),
  content_id   uuid not null,
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  reason       text not null check (reason in ('spam','offensive','not_halal','misinformation','harassment','other')),
  details      text,
  status       text not null default 'open' check (status in ('open','reviewed','dismissed')),
  reviewed_by  uuid references public.profiles(id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (content_type, content_id, reporter_id)
);

create index if not exists idx_reports_status  on public.content_reports(status);
create index if not exists idx_reports_content on public.content_reports(content_type, content_id);
create index if not exists idx_reports_open    on public.content_reports(content_type, content_id) where status = 'open';

alter table public.content_reports enable row level security;

-- A logged-in user may file a report as themselves.
drop policy if exists "Users create own reports" on public.content_reports;
create policy "Users create own reports"
  on public.content_reports for insert
  with check (reporter_id = auth.uid());

-- A user can see the reports they filed (e.g. to avoid re-reporting); not others'.
drop policy if exists "Users read own reports" on public.content_reports;
create policy "Users read own reports"
  on public.content_reports for select
  using (reporter_id = auth.uid());

-- Admins manage everything (the admin API uses the service role, which bypasses
-- RLS; this protects direct client access too).
drop policy if exists "Admins manage reports" on public.content_reports;
create policy "Admins manage reports"
  on public.content_reports for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')));
