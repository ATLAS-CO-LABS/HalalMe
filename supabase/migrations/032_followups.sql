-- Follow-up system: track when we last nudged a merchant so we never spam them.
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS last_followup_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS followup_count   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_followup_on DATE;

COMMENT ON COLUMN public.merchants.last_followup_at IS 'Last time an automated follow-up (chase email / digest) fired for this merchant';
COMMENT ON COLUMN public.merchants.followup_count   IS 'How many automated follow-ups have been sent';
COMMENT ON COLUMN public.merchants.next_followup_on IS 'Optional manual reminder date set by the rep';
