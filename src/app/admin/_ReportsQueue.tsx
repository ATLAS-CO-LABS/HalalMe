"use client";
import { adminFetch, adminRequest, errorMessage } from "./_fetch";
import { adminKeys } from "./_query";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Flag, EyeOff, Trash2, Check, Loader2, ShieldCheck } from "lucide-react";
import { fmtDateTime, useToast, ToastView, TableSkeleton, EmptyState, Badge, LoadError } from "./_ui";

type ContentType = "post" | "comment" | "recipe";

interface ReportItem {
  contentType: ContentType;
  contentId: string;
  reportCount: number;
  reasons: string[];
  lastReportedAt: string;
  status: string;
  preview: { text: string; author: string | null; isPublished?: boolean; postId?: string };
  deleted: boolean;
}

interface ReportsPayload {
  items: ReportItem[];
  canManage: boolean;
}

const NO_ITEMS: ReportItem[] = [];

const REASON_LABEL: Record<string, string> = {
  spam: "Spam", offensive: "Offensive", not_halal: "Not halal",
  misinformation: "Misinfo", harassment: "Harassment", other: "Other",
};

// Reusable "Reported" moderation queue. `type` scopes it to posts, comments or
// recipes. Actions call the existing moderation endpoints, then mark the reports
// resolved so the item leaves the open queue.
export default function ReportsQueue({ type }: { type: ContentType }) {
  const { toast, flash } = useToast();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const noun = type === "recipe" ? "recipe" : type;

  // Mounted twice on the Social page (posts + comments) and once on Kitchen.
  // Keying by `type` keeps those independent instead of fighting over one cache
  // entry, while the shared ['admin','reports'] prefix lets the page-level
  // Refresh button invalidate all of them at once.
  const query = useQuery({
    queryKey: [...adminKeys.module("reports"), type] as const,
    queryFn: () => adminFetch<ReportsPayload>(`/api/admin/reports?type=${type}&status=open`),
  });

  const items = query.data?.items ?? NO_ITEMS;
  const canManage = !!query.data?.canManage;
  const loading = query.isLoading;
  const error = query.isError ? errorMessage(query.error, "Could not load the report queue. Try refreshing.") : null;

  // A moderation action here changes the underlying post/comment/recipe too, so
  // refresh the owning module alongside the queue.
  function invalidateAfterAction() {
    void queryClient.invalidateQueries({ queryKey: adminKeys.module("reports") });
    void queryClient.invalidateQueries({ queryKey: adminKeys.module(type === "recipe" ? "kitchen" : "hub") });
  }

  // Endpoints for the actual content action, per type.
  function contentEndpoint(id: string) {
    if (type === "post") return `/api/admin/hub/posts/${id}`;
    if (type === "comment") return `/api/admin/hub/comments/${id}`;
    return `/api/admin/recipes/${id}`;
  }

  async function resolveReports(contentId: string, action: "dismiss" | "reviewed") {
    await adminRequest("/api/admin/reports", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: type, contentId, action }),
    });
  }

  async function act(item: ReportItem, kind: "hide" | "delete" | "dismiss") {
    setBusyId(item.contentId);
    try {
      if (kind === "dismiss") {
        await resolveReports(item.contentId, "dismiss");
        flash("ok", "Reports dismissed.");
      } else if (kind === "delete") {
        const res = await adminRequest(contentEndpoint(item.contentId), { method: "DELETE" });
        if (!res.ok) throw new Error();
        await resolveReports(item.contentId, "reviewed");
        flash("ok", `${noun[0].toUpperCase()}${noun.slice(1)} deleted.`);
      } else {
        // hide = unpublish (posts & recipes only)
        const res = await adminRequest(contentEndpoint(item.contentId), {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_published: false }),
        });
        if (!res.ok) throw new Error();
        await resolveReports(item.contentId, "reviewed");
        flash("ok", "Hidden from the public.");
      }
      invalidateAfterAction();
    } catch {
      flash("err", "Action failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <ToastView toast={toast} />
      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#102C26] flex items-center gap-2">
            <Flag size={15} className="text-red-500" /> Reported {noun}s
            {items.length > 0 && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{items.length}</span>}
          </p>
          <button onClick={() => void query.refetch()} title="Refresh"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors">
            <RefreshCw size={13} className={query.isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {error ? (
          <LoadError message={error} onRetry={() => void query.refetch()} compact />
        ) : loading ? <TableSkeleton /> : items.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Nothing reported" hint={`User reports about ${noun}s will appear here for review.`} />
        ) : (
          <div className="divide-y divide-[#102C26]/8">
            {items.map((item) => (
              <div key={item.contentId} className="px-4 sm:px-5 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <Badge label={`${item.reportCount} report${item.reportCount !== 1 ? "s" : ""}`} tone="red" />
                      {item.reasons.map((r) => <Badge key={r} label={REASON_LABEL[r] ?? r} tone="amber" />)}
                      {item.preview.isPublished === false && <Badge label="Hidden" tone="gray" />}
                      {item.deleted && <Badge label="Already removed" tone="gray" />}
                    </div>
                    <p className="text-sm text-gray-900 line-clamp-2">{item.preview.text || <span className="italic text-gray-400">(no text)</span>}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.preview.author ?? "Unknown"} · last reported {fmtDateTime(item.lastReportedAt)}
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2 shrink-0">
                      {!item.deleted && type !== "comment" && item.preview.isPublished !== false && (
                        <button onClick={() => act(item, "hide")} disabled={busyId === item.contentId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-none hover:bg-gray-50 disabled:opacity-50">
                          <EyeOff size={13} /> Hide
                        </button>
                      )}
                      {!item.deleted && (
                        <button onClick={() => act(item, "delete")} disabled={busyId === item.contentId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-none hover:bg-red-700 disabled:opacity-50">
                          {busyId === item.contentId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                        </button>
                      )}
                      <button onClick={() => act(item, "dismiss")} disabled={busyId === item.contentId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-none hover:bg-gray-50 disabled:opacity-50">
                        <Check size={13} /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
