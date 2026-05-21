alter table public.merchants
  add column if not exists owner_name          text,
  add column if not exists notes               text,
  add column if not exists contacted_at        timestamptz,
  add column if not exists activated_at        timestamptz,
  add column if not exists invited_at          timestamptz,
  add column if not exists commission_percentage numeric(5,2),
  add column if not exists commission_fixed    numeric(10,2),
  add column if not exists hyperzod_sync_failed boolean not null default false,
  add column if not exists website             text;
