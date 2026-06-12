"use client";

import { useCallback, useEffect, useState } from "react";
import { display } from "../../_fonts";
import {
  Coins,
  Loader2,
  Check,
  Ban,
  ArrowLeftRight,
  Eye,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface AdminCommission {
  qualification_score: number | null;
  score_breakdown: { label: string; points: number }[] | null;
  recommended_commission: number | null;
  lane: "auto" | "review" | null;
  requested_commission: number | null;
  review_reason: string | null;
  review_status: "none" | "pending" | "approved" | "rejected" | "countered";
  countered_commission: number | null;
  final_commission: number | null;
  accepted_at: string | null;
  contract_signed_at: string | null;
  existing_commission_band: string | null;
}

interface DocLite {
  doc_type: string;
  url: string;
  file_name: string | null;
}

const REASON_LABELS: Record<string, string> = {
  existing_provider: "On cheaper terms elsewhere",
  expansion: "Expansion plans",
  strategic: "Strategic opportunity",
  other: "Other",
};

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : `${Number.isInteger(n) ? n : n.toFixed(1)}%`;

const PROTECTED_THRESHOLD = 22;

/**
 * Admin Commission Review card. Shows the engine output + review trail and lets
 * any admin Approve / Counter / Reject a pending review. Tier colours are labels
 * only (no roles enforced yet). Lives on the merchant detail page.
 */
export default function AdminCommissionCard({
  merchantId,
  documents,
  onDecision,
}: {
  merchantId: string;
  documents: DocLite[];
  onDecision: () => void;
}) {
  const [row, setRow] = useState<AdminCommission | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [counter, setCounter] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}/commission`);
      if (!res.ok) return;
      const { commission } = await res.json() as { commission: AdminCommission | null };
      setRow(commission);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => { load(); }, [load]);

  async function decide(action: "approve" | "reject" | "counter", commission?: number) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}/commission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, commission }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not save the decision.");
        return;
      }
      setShowCounter(false);
      setCounter("");
      await load();
      onDecision(); // refresh the merchant (status may have moved to "agreed")
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const evidence = documents.find((d) => d.doc_type === "competitor_evidence");
  const signed = documents.find((d) => d.doc_type === "signed_agreement");

  return (
    <div className="bg-white rounded-none border border-[#102C26]/12 border-l-4 border-l-[#102C26]">
      <div className="px-4 sm:px-6 py-4 border-b border-[#102C26]/8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Coins size={15} className="text-[#102C26]" />
          <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26]`}>
            Commission Review
          </h2>
        </div>
        {row && <ReviewBadge status={row.review_status} lane={row.lane} />}
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-5">
        {loading ? (
          <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
        ) : !row ? (
          <p className="text-sm text-gray-400 italic">The merchant hasn&apos;t started the commission review yet.</p>
        ) : (
          <>
            {/* Numbers grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Stat label="Opening" value="30%" />
              <Stat label="Qualification score" value={row.qualification_score?.toString() ?? "—"} />
              <Stat label="Recommended" value={fmt(row.recommended_commission)} />
              <Stat
                label="Merchant asked for"
                value={fmt(row.requested_commission)}
                highlight={row.requested_commission != null}
              />
            </div>

            {/* Below-threshold warning (label only — any admin may still approve) */}
            {row.requested_commission != null && row.requested_commission < PROTECTED_THRESHOLD && (
              <div className="flex items-start gap-2 rounded-none bg-red-50 border border-red-200 px-3 py-2 mb-4">
                <ShieldAlert size={14} className="text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">
                  Below the {PROTECTED_THRESHOLD}% protected threshold — owner-tier review.
                  {evidence ? " Competitor evidence is attached (Price Promise)." : " No evidence attached."}
                </p>
              </div>
            )}

            {/* Reason + breakdown */}
            {row.review_reason && (
              <p className="text-sm text-gray-700 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason: </span>
                {REASON_LABELS[row.review_reason] ?? row.review_reason}
              </p>
            )}

            {row.score_breakdown && row.score_breakdown.length > 0 && (
              <div className="mb-4 rounded-none bg-gray-50 border border-[#102C26]/8 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1.5">
                  <Sparkles size={11} /> Score breakdown
                </p>
                <div className="space-y-1">
                  {row.score_breakdown.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{b.label}</span>
                      <span className="font-mono font-semibold text-[#102C26]">+{b.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached docs */}
            {(evidence || signed) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {evidence && <DocLink label="Competitor evidence" url={evidence.url} />}
                {signed && <DocLink label="Signed agreement" url={signed.url} />}
              </div>
            )}

            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

            {/* Decision controls */}
            {row.review_status === "pending" ? (
              showCounter ? (
                <div className="rounded-none bg-gray-50 border border-[#102C26]/12 p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Counter-offer rate</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={counter}
                      onChange={(e) => setCounter(e.target.value)}
                      placeholder="e.g. 24"
                      className="w-28 text-sm border border-gray-300 rounded-none px-3 py-2 focus:outline-none focus:border-[#102C26]"
                    />
                    <button
                      onClick={() => decide("counter", Number(counter))}
                      disabled={!counter || busy === "counter"}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#102C26] rounded-none px-3 py-2 disabled:opacity-50"
                    >
                      {busy === "counter" ? <Loader2 size={12} className="animate-spin" /> : <ArrowLeftRight size={12} />}
                      Send counter
                    </button>
                    <button onClick={() => setShowCounter(false)} className="text-xs text-gray-500 hover:text-gray-800 px-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => decide("approve")}
                    disabled={!!busy}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-none px-3.5 py-2 disabled:opacity-50"
                  >
                    {busy === "approve" ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                    Approve {fmt(row.requested_commission ?? row.recommended_commission)}
                  </button>
                  <button
                    onClick={() => setShowCounter(true)}
                    disabled={!!busy}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#102C26] border border-[#102C26]/20 rounded-none px-3.5 py-2 hover:bg-[#102C26]/5 disabled:opacity-50"
                  >
                    <ArrowLeftRight size={13} /> Counter
                  </button>
                  <button
                    onClick={() => decide("reject")}
                    disabled={!!busy}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-none px-3.5 py-2 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busy === "reject" ? <Loader2 size={12} className="animate-spin" /> : <Ban size={13} />}
                    Reject
                  </button>
                </div>
              )
            ) : (
              <ResolvedNote row={row} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── bits ────────────────────────────────────────────────────────────────────

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-none border p-3 ${highlight ? "border-amber-200 bg-amber-50/50" : "border-[#102C26]/12 bg-white"}`}>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className={`${display.className} text-lg font-bold text-[#102C26] mt-0.5`}>{value}</p>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#102C26] border border-gray-200 rounded-none px-3 py-1.5 hover:bg-gray-50"
    >
      <Eye size={13} /> {label}
    </a>
  );
}

function ReviewBadge({ status, lane }: { status: AdminCommission["review_status"]; lane: AdminCommission["lane"] }) {
  const cfg =
    status === "pending"   ? { label: "Pending review", cls: "bg-amber-50 text-amber-700" }
    : status === "approved" ? { label: "Approved", cls: "bg-green-50 text-green-700" }
    : status === "rejected" ? { label: "Rejected", cls: "bg-red-50 text-red-700" }
    : status === "countered" ? { label: "Countered", cls: "bg-blue-50 text-blue-700" }
    : lane === "auto"       ? { label: "Auto lane", cls: "bg-gray-100 text-gray-600" }
    : { label: "—", cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ResolvedNote({ row }: { row: AdminCommission }) {
  if (row.final_commission != null) {
    return (
      <div className="flex items-center gap-2 rounded-none bg-green-50 border border-green-200 px-3 py-2.5 text-sm font-semibold text-green-700">
        <Check size={15} />
        Locked at {fmt(row.final_commission)}
        {row.contract_signed_at ? " · agreement signed" : row.accepted_at ? " · accepted by merchant" : ""}
      </div>
    );
  }
  if (row.review_status === "rejected") {
    return <p className="text-sm text-gray-500">Review rejected — merchant keeps their standard offer of {fmt(row.recommended_commission)}.</p>;
  }
  if (row.review_status === "countered") {
    return <p className="text-sm text-blue-700">Counter-offer of {fmt(row.countered_commission)} sent — awaiting the merchant&apos;s acceptance.</p>;
  }
  if (row.lane === "auto") {
    return <p className="text-sm text-gray-500">Auto lane — the merchant can accept {fmt(row.recommended_commission)} themselves; no action needed.</p>;
  }
  return <p className="text-sm text-gray-400 italic">No action needed yet.</p>;
}
