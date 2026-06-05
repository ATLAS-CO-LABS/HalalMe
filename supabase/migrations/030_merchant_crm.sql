ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS source_attribution  TEXT,
  ADD COLUMN IF NOT EXISTS assigned_rep        TEXT,
  ADD COLUMN IF NOT EXISTS readiness_checklist JSONB DEFAULT '{
    "invite_accepted": false,
    "commission_agreed": false,
    "notes_completed": false,
    "onboarding_verified": false
  }'::jsonb;

COMMENT ON COLUMN public.merchants.source_attribution  IS 'Lead origin: website | qr | referral | instagram | other';
COMMENT ON COLUMN public.merchants.assigned_rep        IS 'Name or user ID of the sales rep owning this merchant';
COMMENT ON COLUMN public.merchants.readiness_checklist IS 'All four flags must be true before Approve & Publish is unlocked';
