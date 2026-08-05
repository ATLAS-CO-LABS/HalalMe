import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import {
  createHyperzodCustomer,
  findHyperzodCustomerByMobile,
  findHyperzodCustomerById,
  HYPERZOD_QUICK_SCAN_PAGES,
} from "@/services/hyperzodService";
import * as Sentry from "@sentry/nextjs";

/**
 * Link the signed-in user to their Hyperzod customer record.
 *
 * Order matters: we LOOK UP by mobile before creating. Hyperzod identifies
 * customers by phone number, and a user may already exist there from ordering
 * on delivery.halalme.co.uk before joining HalalMe. Blindly calling "create"
 * (the previous behaviour) left the same person with two customer records, and
 * we stored the wrong one.
 *
 * Also self-repairing: if the stored id points at a deleted customer — which is
 * what happens when someone is removed on the Hyperzod side — we drop it and
 * re-link rather than leaving a dead pointer that silently breaks order points.
 *
 * Safe to call repeatedly. Callers should retry on `retryable: true` rather
 * than fire-and-forget, otherwise a transient Hyperzod outage leaves the user
 * permanently unlinked.
 */
export async function POST() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("full_name, phone, hyperzod_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const saveLink = (id: string | null) =>
      serviceClient
        .from("profiles")
        .update({ hyperzod_customer_id: id })
        .eq("id", user.id);

    // 1. Already linked? Confirm the target still exists before trusting it.
    if (profile.hyperzod_customer_id) {
      const existing = await findHyperzodCustomerById(profile.hyperzod_customer_id);

      if (existing && !existing.deleted_at) {
        return NextResponse.json({ already_linked: true, hyperzod_id: existing.id });
      }

      // Gone or soft-deleted — clear it and fall through to re-link below.
      console.warn(
        "[hyperzod] stale customer link cleared",
        { user_id: user.id, stale_id: profile.hyperzod_customer_id, reason: existing ? "deleted" : "not_found" }
      );
      await saveLink(null);
    }

    // Phone is the join key on Hyperzod's side; without it we can neither find
    // nor create. Not an error — they simply haven't finished their profile.
    if (!profile.phone) {
      return NextResponse.json({ skipped: "no_phone" });
    }

    // 2. Quick check against recent customers. Someone who ordered on delivery
    //    lately is near the top of the list, so this is one request.
    const recent = await findHyperzodCustomerByMobile(profile.phone, HYPERZOD_QUICK_SCAN_PAGES);
    if (recent) {
      await saveLink(recent.id);
      return NextResponse.json({ success: true, hyperzod_id: recent.id, matched: "existing" });
    }

    // 3. Looks new — create them.
    const result = await createHyperzodCustomer({
      full_name: profile.full_name,
      email: user.email ?? "",
      phone: profile.phone,
    });

    if (!result) {
      // Two very different causes land here: a genuine outage, or Hyperzod
      // refusing the mobile because a long-dormant customer already owns it
      // (their identity key is the phone number). Pay for the exhaustive scan
      // now — it's the one moment where it's justified.
      const older = await findHyperzodCustomerByMobile(profile.phone);
      if (older) {
        await saveLink(older.id);
        return NextResponse.json({ success: true, hyperzod_id: older.id, matched: "existing_deep" });
      }

      // Transient. Leave the link NULL so a later attempt can still succeed,
      // and tell the caller it's worth retrying.
      Sentry.captureMessage("hyperzod provision-customer failed", {
        level: "warning",
        extra: { user_id: user.id },
      });
      return NextResponse.json(
        { error: "hyperzod_api_failed", retryable: true },
        { status: 502 }
      );
    }

    // A create that returns no id means we can't link them. Previously this
    // stored the literal string "provisioned", which looks linked but matches
    // no customer — worse than being unlinked. Re-read by mobile instead.
    const id = result.id ?? (await findHyperzodCustomerByMobile(profile.phone))?.id ?? null;

    if (!id) {
      Sentry.captureMessage("hyperzod created customer but no id resolved", {
        level: "warning",
        extra: { user_id: user.id },
      });
      return NextResponse.json({ error: "no_customer_id", retryable: true }, { status: 502 });
    }

    await saveLink(id);
    return NextResponse.json({ success: true, hyperzod_id: id, matched: "created" });
  } catch (err) {
    console.error("[hyperzod] provision-customer error", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Internal error", retryable: true }, { status: 500 });
  }
}
