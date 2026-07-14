import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, type AdminModule } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// POST /api/admin/exports
//   { resource: "users" | "merchants" | "analytics", count?: number, scope?: string }
// Records a CSV export in the admin audit log. Exports include PII (e.g. emails),
// so who-exported-what-when must be traceable. The actual file is still built
// client-side; this is the accountability beacon called alongside the download.
const RESOURCE_MODULE: Record<string, AdminModule> = {
  users: "users",
  merchants: "merchants",
  analytics: "analytics",
};

export async function POST(req: NextRequest) {
  let body: { resource?: string; count?: number; scope?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const resource = body.resource ?? "";
  const mod = RESOURCE_MODULE[resource];
  if (!mod) return NextResponse.json({ error: "Unknown export resource" }, { status: 400 });

  // Viewing-level access on the owning module is enough to export it.
  const gate = await requireAdmin(mod, "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const count = Number.isFinite(body.count) ? Number(body.count) : null;
  const scope = typeof body.scope === "string" ? body.scope : null;

  logAdminAction(gate, {
    action: `${resource}.export`,
    module: mod,
    targetType: resource,
    summary: `Exported ${count ?? "?"} ${resource} record${count === 1 ? "" : "s"} to CSV${scope ? ` (${scope})` : ""}`,
    metadata: { count, scope },
  });

  return NextResponse.json({ ok: true });
}
