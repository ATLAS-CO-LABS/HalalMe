-- =============================================================================
-- 033_merchant_dashboard.sql
-- Merchant self-serve dashboard: link merchants to auth accounts + document vault
--
-- Security model:
--   • Merchants get READ-ONLY (SELECT) access to their own merchant row + documents.
--   • ALL merchant writes (contact edits, document uploads) go through service-role
--     route handlers with an explicit column allowlist — so a merchant can never
--     self-set status/commission or self-approve a document, even via the browser
--     client. Service role bypasses RLS.
--   • Admins get full access (mirrors existing admin RLS pattern across the app).
-- =============================================================================

-- ── 1. Link merchant records to an auth account ──────────────────────────────
alter table public.merchants
  add column if not exists user_id        uuid references auth.users(id) on delete set null,
  add column if not exists business_email text;   -- restaurant contact email (distinct from login email)

-- Backfill: existing rows have no account yet; business_email = current email
update public.merchants set business_email = email where business_email is null;

create index if not exists idx_merchants_user_id on public.merchants (user_id);

-- ── 2. Replace the deny-all policy with precise owner + admin policies ────────
-- merchants already has RLS enabled (028) + a "No public access" deny-all policy.
-- Permissive policies are OR-combined, so we drop the deny-all and add explicit ones.
drop policy if exists "No public access" on public.merchants;

create policy "Merchant owner can read own record"
  on public.merchants for select
  using (user_id = auth.uid());

create policy "Admins manage all merchants"
  on public.merchants for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- NOTE: no owner UPDATE/INSERT policy by design — merchant edits are server-mediated
-- via /api/merchant/me (service role + column allowlist).

-- ── 3. Document vault ────────────────────────────────────────────────────────
-- doc_type values (UK halal food business):
--   food_hygiene        Food Hygiene Rating / local-authority registration
--   halal_certificate   HMC / HFA / supplier halal certification
--   food_business_reg   Local council food business registration
--   public_liability    Public liability insurance certificate
--   business_proof      Companies House / proof of ownership   (optional)
--   owner_id            Photo ID of owner                       (optional)
create table if not exists public.merchant_documents (
  id                   uuid        primary key default gen_random_uuid(),
  merchant_id          uuid        not null references public.merchants(id) on delete cascade,
  doc_type             text        not null,
  status               text        not null default 'uploaded'
                         check (status in ('uploaded','under_review','approved','rejected')),
  cloudinary_public_id text        not null,
  resource_type        text        not null default 'image',   -- 'image' | 'raw' (PDFs)
  format               text,                                    -- pdf, jpg, png…
  file_name            text,
  rejection_reason     text,
  expires_at           date,                                    -- cert/rating expiry (renewal reminders)
  uploaded_at          timestamptz not null default now(),
  reviewed_at          timestamptz,
  reviewed_by          uuid        references auth.users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_merchant_documents_merchant on public.merchant_documents (merchant_id);

create trigger merchant_documents_updated_at
  before update on public.merchant_documents
  for each row execute function public.update_updated_at();

-- ── 4. RLS: merchant_documents (read-only for owner, full for admin) ──────────
alter table public.merchant_documents enable row level security;

create policy "Merchant owner reads own documents"
  on public.merchant_documents for select
  using (exists (
    select 1 from public.merchants m
    where m.id = merchant_documents.merchant_id and m.user_id = auth.uid()
  ));

create policy "Admins manage all documents"
  on public.merchant_documents for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- NOTE: no owner INSERT/UPDATE policy by design — document uploads go through
-- /api/merchant/documents (service role), which forces status = 'uploaded'.
