create table if not exists public.merchants (
  id                   uuid        primary key default gen_random_uuid(),
  hyperzod_merchant_id text,
  name                 text        not null,
  email                text        not null,
  phone                text        not null,
  address              text,
  city                 text,
  state                text,
  post_code            text,
  country              text        not null default 'United Kingdom',
  country_code         text        not null default 'GB',
  category_ids         text[],
  order_types          text[],
  status               text        not null default 'pending',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create unique index merchants_email_idx on public.merchants (email);

alter table public.merchants enable row level security;

-- Only service role can access — no public reads
create policy "No public access" on public.merchants
  using (false)
  with check (false);

create or replace function public.handle_merchants_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger merchants_updated_at
  before update on public.merchants
  for each row execute function public.handle_merchants_updated_at();
