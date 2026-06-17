-- =============================================================================
-- 037_merchant_rep_link.sql
-- Turn merchants.assigned_rep (free text) into a real reference to a team
-- member's profile. The text column is kept as a display fallback for any
-- legacy rows we can't auto-match.
-- =============================================================================

ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS assigned_rep_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_merchants_assigned_rep_id ON public.merchants (assigned_rep_id);

-- Best-effort backfill: match the existing free-text rep name to a team
-- member's full_name (case/whitespace-insensitive).
UPDATE public.merchants m
SET assigned_rep_id = p.id
FROM public.profiles p
WHERE p.role IN ('admin', 'super_admin')
  AND m.assigned_rep_id IS NULL
  AND m.assigned_rep IS NOT NULL
  AND lower(trim(p.full_name)) = lower(trim(m.assigned_rep));
