"use client";

import { useEffect, useState } from "react";
import { Flag, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  submitReport,
  REPORT_REASONS,
  type ReportContentType,
  type ReportReason,
} from "@/services/reportService";

// Reusable "Report this content" dialog for the public app (posts, comments,
// recipes). Auth-gate the opener — by the time this renders the user is signed
// in. Dark-themed to match the Hub/Kitchen surfaces.
//
// The thin wrapper unmounts the body when closed, so the inner component's state
// initialises fresh on every open (no reset effect needed).
export default function ReportModal(props: {
  open: boolean;
  onClose: () => void;
  contentType: ReportContentType;
  contentId: string;
  contentLabel?: string;
}) {
  if (!props.open) return null;
  return <ReportDialog {...props} />;
}

function ReportDialog({
  onClose,
  contentType,
  contentId,
  contentLabel = "this",
}: {
  onClose: () => void;
  contentType: ReportContentType;
  contentId: string;
  contentLabel?: string;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | "ok" | "duplicate" | "error">(null);

  // Escape to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function handleSubmit() {
    if (!reason) return;
    setBusy(true);
    const res = await submitReport({ contentType, contentId, reason, details });
    setBusy(false);
    if (res === "ok") setResult("ok");
    else if (res === "duplicate") setResult("duplicate");
    else if (res === "unauthenticated") { onClose(); }
    else setResult("error");
  }

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111418] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
              <Flag className="w-4 h-4 text-red-400" />
            </span>
            <h2 id="report-title" className="text-white font-semibold text-base">Report {contentLabel}</h2>
          </div>
          <button onClick={() => !busy && onClose()} aria-label="Close" className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result === "ok" || result === "duplicate" ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-white font-semibold">
              {result === "ok" ? "Thanks for letting us know" : "You've already reported this"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {result === "ok"
                ? "Our team will review this content shortly."
                : "We're already looking into it."}
            </p>
            <button onClick={onClose} className="mt-5 px-5 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 space-y-3">
              <p className="text-gray-400 text-sm">Why are you reporting this?</p>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setReason(r.value)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      reason === r.value
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/40"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Add any details (optional)…"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#0B0D0F] border border-gray-800 rounded-xl focus:outline-none focus:border-gray-600 placeholder:text-gray-600 resize-none"
              />
              {result === "error" && (
                <p className="flex items-center gap-1.5 text-sm text-red-400"><AlertCircle className="w-4 h-4" /> Couldn&apos;t submit your report. Please try again.</p>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-end gap-2">
              <button onClick={() => !busy && onClose()} className="px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!reason || busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />} Submit report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
