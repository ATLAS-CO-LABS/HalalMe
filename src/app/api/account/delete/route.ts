import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";
import { collectUserAssets, queueAssets, flushAssets } from "@/lib/assetCleanup";
import * as Sentry from "@sentry/nextjs";

// Deleting an account is irreversible, so the limiter only exists to stop a
// script hammering the endpoint, not to pace legitimate use.
const limiter = createRateLimiter("account-delete", 5, "1 h");

/**
 * DELETE /api/account/delete — a user erasing their own account.
 *
 * This route did not exist before. The profile page had a Delete Account button
 * with no handler at all, so the UI promised an erasure the platform could not
 * perform, which is a UK GDPR Article 17 problem for a registered UK entity.
 *
 * Order is the whole design:
 *   1. Collect Cloudinary ids while the rows still exist.
 *   2. Queue them, so they outlive the cascade.
 *   3. Scrub the identifying columns on records that must legally survive.
 *   4. Delete the auth user, which cascades the other 25 tables.
 *   5. Try Cloudinary, leaving anything that fails for the sweeper.
 *
 * Doing (4) first, which is what the admin route used to do, destroys the
 * public_id references and orphans every file permanently.
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { success, reset } = await limiter.limit(user.id);
  if (!success) return rateLimitResponse(reset);

  // Typing the exact confirmation phrase is the guard against a mis-click or a
  // CSRF-style cross-origin POST, since this is unrecoverable.
  let confirm = "";
  try {
    const body = await req.json();
    confirm = String(body.confirm ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (confirm !== "DELETE") {
    return NextResponse.json(
      { error: "Type DELETE to confirm account deletion." },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  // Staff accounts are excluded for the same reason the admin route excludes
  // them: an admin removing themselves can strand permissions and audit trails.
  const { data: profile } = await service
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin" || profile?.role === "super_admin") {
    return NextResponse.json(
      { error: "Staff accounts cannot be self-deleted. Contact a super admin." },
      { status: 403 },
    );
  }

  // ── 1 + 2. Collect and park, before anything is destroyed ────────────────
  // Queueing has to complete BEFORE the cascade, not alongside the Cloudinary
  // call afterwards. If the queue write happened after the delete and the
  // process died in between, the ids would be gone from both the rows and the
  // queue, which is the exact orphan this pipeline exists to prevent.
  let assets: Awaited<ReturnType<typeof collectUserAssets>> = [];
  try {
    assets = await collectUserAssets(service, user.id);
    await queueAssets(service, assets, "user_delete");
  } catch (err) {
    // A failure here means we cannot guarantee cleanup, so stop rather than
    // delete the account and strand the files with no way to find them.
    console.error("[api/account/delete] asset collection failed:", err);
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "Could not prepare your data for deletion. Please try again." },
      { status: 500 },
    );
  }

  // ── 3. Scrub what has to legally survive ─────────────────────────────────
  // donations.user_id is now SET NULL (migration 073) so the financial record
  // is retained for the 6-year UK tax obligation. The FK nulls the donor link
  // on its own; ip_address and user_agent are the remaining directly
  // identifying fields and are cleared here so retention does not quietly
  // preserve personal data the user asked us to erase.
  const { error: scrubError } = await service
    .from("donations")
    .update({ ip_address: null, user_agent: null })
    .eq("user_id", user.id);
  if (scrubError) {
    console.error("[api/account/delete] donation scrub failed:", scrubError.message);
    Sentry.captureException(new Error(`donation scrub failed: ${scrubError.message}`));
    return NextResponse.json(
      { error: "Could not complete deletion. Please try again." },
      { status: 500 },
    );
  }

  // ── 4. Delete the auth user, cascading the rest ──────────────────────────
  const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("[api/account/delete] auth delete failed:", deleteError.message);
    Sentry.captureException(new Error(`account delete failed: ${deleteError.message}`));
    return NextResponse.json(
      { error: "Could not delete your account. Please contact support." },
      { status: 500 },
    );
  }

  // ── 5. Cloudinary, best effort ───────────────────────────────────────────
  // Past this point the account is gone, so a Cloudinary failure must not turn
  // into an error response. Whatever does not clear stays queued.
  let result = { deleted: 0, deferred: assets.length };
  try {
    result = await flushAssets(service, assets);
  } catch (err) {
    console.error("[api/account/delete] asset purge failed:", err);
    Sentry.captureException(err);
  }

  return NextResponse.json({ ok: true, assets: result });
}
