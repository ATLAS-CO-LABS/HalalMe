-- =============================================================================
-- 034_merchant_welcome.sql
-- Track when the merchant welcome email was sent, so it fires exactly once —
-- AFTER the merchant verifies (reaches their dashboard), not at form submit.
-- =============================================================================

alter table public.merchants
  add column if not exists welcome_sent_at timestamptz;
