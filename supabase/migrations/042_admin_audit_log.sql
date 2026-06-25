-- =============================================================================
-- 042_admin_audit_log.sql
-- Append-only audit trail for admin-panel actions.
--   - Records who (actor) did what (action) to which record (target), when.
--   - Written by service-role API routes via logAdminAction() — see src/lib/adminAudit.ts.
--   - Readable only by super admins (direct client access); service role bypasses RLS.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role  TEXT,                                  -- 'admin' | 'super_admin' at time of action
  action      TEXT NOT NULL,                         -- e.g. 'user.delete', 'recipe.update', 'donation_flag.block'
  module      TEXT,                                  -- merchants|users|kitchen|hub|rewards|support
  target_type TEXT,                                  -- 'user' | 'recipe' | 'post' | 'merchant' | ...
  target_id   TEXT,                                  -- id of the affected record (text — ids vary)
  summary     TEXT,                                  -- human-readable one-liner for the log view
  metadata    JSONB,                                 -- structured extras: before/after, reason, counts
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor   ON public.admin_audit_log (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_module  ON public.admin_audit_log (module);
CREATE INDEX IF NOT EXISTS idx_audit_target  ON public.admin_audit_log (target_type, target_id);

-- =============================================================================
-- RLS: super admins may read the log; nobody writes through the client.
-- (Service-role API routes bypass RLS to insert; the log is append-only by design.)
-- =============================================================================
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins read audit log"
  ON public.admin_audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));
