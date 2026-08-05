-- Records when a merchant's commission was agreed.
--
-- The invite (Hyperzod dashboard access) is sent AFTER commission is agreed, via
-- a manual batch step. Without a timestamp for entering "agreed" there is nothing
-- to measure against, so a merchant whose invite batch is forgotten sits in the
-- pipeline with no follow-up alert. This column gives the follow-up rules in
-- src/lib/followUps.ts something to count from.

alter table public.merchants
  add column if not exists agreed_at timestamptz;

comment on column public.merchants.agreed_at is
  'When the merchant reached status=agreed. Drives the "agreed but not yet invited" follow-up alert.';

-- Backfill existing merchants who are already past the agreed stage so they do
-- not all light up as stale on first load. updated_at is the closest signal we
-- have for when they moved.
update public.merchants
set agreed_at = coalesce(invited_at, activated_at, updated_at)
where agreed_at is null
  and status in ('agreed', 'invited', 'live');

-- Partial index: the follow-up sweep only ever scans merchants sitting at agreed.
create index if not exists merchants_agreed_at_idx
  on public.merchants (agreed_at)
  where status = 'agreed';
