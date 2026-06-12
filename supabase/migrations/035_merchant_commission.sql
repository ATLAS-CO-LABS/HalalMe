-- =============================================================================
-- 035_merchant_commission.sql
-- Phase 1 — Commission Qualification Engine
--
-- One child row per merchant holding the commission "story": the Section A
-- answers, the calculated score + recommended rate, which lane it took, the
-- review trail (if any), and the final agreed rate. Kept in its own table (not
-- columns on `merchants`) so Phase 2 re-reviews can append history later.
--
-- Security model mirrors merchant_documents (033):
--   • Merchant owner gets READ-ONLY access to their own row.
--   • All writes go through service-role route handlers (/api/merchant/commission
--     and /api/admin/...), never the browser client — so a merchant can never
--     self-set their score, rate, or review decision.
--   • Admins get full access.
--
-- Evidence + signed-contract uploads reuse merchant_documents with new
-- free-text doc_type values ('competitor_evidence', 'signed_agreement') — no
-- schema change needed there (doc_type is unconstrained text).
-- =============================================================================

create table if not exists public.merchant_commission (
  merchant_id            uuid        primary key references public.merchants(id) on delete cascade,

  -- ── Section A answers (instant qualification) ──────────────────────────────
  store_count              int,                  -- 1 | 2 | 3..5 (stored as 3) | 6
  monthly_volume_band      text,                 -- 'lt200' | '200_500' | '500_1000' | 'gt1000'
  on_other_platform        boolean,
  existing_commission_band text,                 -- '30plus' | '25_29' | '22_2499' | 'lt22'
  exclusivity              boolean,
  launch_ready_7d          boolean,
  menu_ready               boolean,
  referral_source          text,                 -- 'organic' | 'existing_merchant' | 'strategic'

  -- ── Engine output ──────────────────────────────────────────────────────────
  qualification_score      int,
  score_breakdown          jsonb,                -- [{ label, points }] for the admin "why" panel
  recommended_commission   numeric(5,2),         -- 30 | 27.5 | 25  (null when "Review Required")
  lane                     text,                 -- 'auto' | 'review'

  -- ── Review path (only used when lane = 'review') ───────────────────────────
  requested_commission     numeric(5,2),         -- the merchant's ask (Request Review)
  review_reason            text,                 -- 'existing_provider' | 'expansion' | 'strategic' | 'other'
  review_status            text        not null default 'none'
                             check (review_status in ('none','pending','approved','rejected','countered')),
  countered_commission     numeric(5,2),         -- admin counter-offer
  decided_at               timestamptz,
  decided_by               uuid        references auth.users(id),

  -- ── Result ──────────────────────────────────────────────────────────────────
  final_commission         numeric(5,2),         -- the locked rate once accepted/approved
  accepted_at              timestamptz,          -- when the merchant accepted the rate
  contract_signed_at       timestamptz,          -- Agreed-stage tick + timestamp

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create trigger merchant_commission_updated_at
  before update on public.merchant_commission
  for each row execute function public.update_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.merchant_commission enable row level security;

create policy "Merchant owner reads own commission"
  on public.merchant_commission for select
  using (exists (
    select 1 from public.merchants m
    where m.id = merchant_commission.merchant_id and m.user_id = auth.uid()
  ));

create policy "Admins manage all commission"
  on public.merchant_commission for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- NOTE: no owner INSERT/UPDATE policy by design — all merchant writes go through
-- /api/merchant/commission (service role).
