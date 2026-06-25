// Admin audit trail — records every mutating admin action to admin_audit_log
// (migration 042). Call logAdminAction(gate, { ... }) after a successful mutation.
//
// Design notes:
//   - Fire-and-forget: it never throws. A failed audit write must not fail the
//     user's action, but it is logged to the server console so we notice gaps.
//   - The `gate` argument is the success result of requireAdmin(): it carries the
//     service client (bypasses RLS to insert), the actor's id and role.
//   - `action` is a stable dotted key ("user.delete", "merchant.publish", …) so
//     the log can be filtered/aggregated; `summary` is the human-readable line.

import type { createServiceClient } from "@/lib/supabase-server";

type ServiceClient = ReturnType<typeof createServiceClient>;

export interface AuditActor {
  serviceClient: ServiceClient;
  userId: string;
  role: string;
}

export interface AuditEntry {
  action: string;
  module?: string;
  targetType?: string;
  targetId?: string | null;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(actor: AuditActor, entry: AuditEntry): Promise<void> {
  try {
    await actor.serviceClient.from("admin_audit_log").insert({
      actor_id: actor.userId,
      actor_role: actor.role,
      action: entry.action,
      module: entry.module ?? null,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      summary: entry.summary ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    // Never block the action on an audit failure — just surface it server-side.
    console.error("[adminAudit] failed to write audit entry", entry.action, err);
  }
}
