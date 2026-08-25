import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { deleteAssets } from "@/lib/cloudinary";
import * as Sentry from "@sentry/nextjs";

/**
 * Retries Cloudinary deletions that the inline attempt could not complete.
 *
 * Every delete path queues its public_ids into pending_asset_deletions before
 * touching the database, then tries Cloudinary immediately. That inline attempt
 * can fail for reasons that have nothing to do with the request: a Cloudinary
 * outage, a network blip, the serverless function being torn down mid-call.
 * Before this existed the cleanup was a fire-and-forget fetch with
 * `.catch(() => {})`, so any of those silently orphaned the files.
 *
 * Idempotent by design. Cloudinary returns "not found" for an id that is already
 * gone, which is treated as success, so a row can be retried safely.
 */

// Bounded so one run cannot exceed the function timeout on a large backlog.
const BATCH_LIMIT = 200;
const CLOUDINARY_BATCH = 100;
const MAX_ATTEMPTS = 10;

type Row = {
  id: string;
  public_id: string;
  resource_type: "image" | "video" | "raw";
  delivery_type: "upload" | "authenticated";
  attempts: number;
};

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = createServiceClient();

  const { data: rows, error } = await db
    .from("pending_asset_deletions")
    .select("id, public_id, resource_type, delivery_type, attempts")
    .is("deleted_at", null)
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (error) {
    console.error("[cron/asset-sweeper] fetch failed:", error.message);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
  if (!rows?.length) return NextResponse.json({ swept: 0, failed: 0, remaining: 0 });

  // Cloudinary takes one resource_type and one delivery type per call.
  const groups = new Map<string, Row[]>();
  for (const row of rows as Row[]) {
    const key = `${row.resource_type}|${row.delivery_type}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  const doneIds: string[] = [];
  const failed: { id: string; attempts: number; message: string }[] = [];

  for (const [key, group] of groups) {
    const [resourceType, deliveryType] = key.split("|") as
      [Row["resource_type"], Row["delivery_type"]];

    for (let i = 0; i < group.length; i += CLOUDINARY_BATCH) {
      const batch = group.slice(i, i + CLOUDINARY_BATCH);
      try {
        await deleteAssets(batch.map((r) => r.public_id), {
          resource_type: resourceType,
          type: deliveryType,
        });
        doneIds.push(...batch.map((r) => r.id));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failed.push(...batch.map((r) => ({ id: r.id, attempts: r.attempts, message })));
      }
    }
  }

  if (doneIds.length) {
    await db.from("pending_asset_deletions")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", doneIds);
  }

  // Bump attempts individually so each row ages out on its own schedule and one
  // permanently broken id cannot stall the queue behind it.
  for (const f of failed) {
    await db.from("pending_asset_deletions")
      .update({ attempts: f.attempts + 1, last_error: f.message.slice(0, 500) })
      .eq("id", f.id);
  }

  // A row hitting the attempt ceiling stops being retried, so it needs to be
  // visible somewhere rather than just going quiet.
  const exhausted = failed.filter((f) => f.attempts + 1 >= MAX_ATTEMPTS);
  if (exhausted.length) {
    Sentry.captureMessage(
      `[asset-sweeper] ${exhausted.length} asset(s) hit the retry ceiling and will no longer be retried`,
      "warning",
    );
  }

  // Completed rows are kept for a while as a cleanup audit trail, but the
  // sweeper only ever queries outstanding work, so without pruning they would
  // accumulate forever. 30 days is long enough to investigate a report of a
  // file that should have gone.
  const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
  await db.from("pending_asset_deletions")
    .delete()
    .not("deleted_at", "is", null)
    .lt("deleted_at", cutoff);

  const { count: remaining } = await db
    .from("pending_asset_deletions")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null)
    .lt("attempts", MAX_ATTEMPTS);

  return NextResponse.json({
    swept: doneIds.length,
    failed: failed.length,
    exhausted: exhausted.length,
    remaining: remaining ?? 0,
  });
}
