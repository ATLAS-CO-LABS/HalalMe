"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Flag, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  submitReport,
  REPORT_REASONS,
  type ReportContentType,
  type ReportReason,
} from "@/services/reportService";

const CREAM = "#F7E7CE";

// Reusable "Report this content" dialog for the public app (posts, comments,
// recipes). Auth-gate the opener — by the time this renders the user is signed
// in. Dark-themed to match the Hub/Kitchen surfaces.
//
// Rendered via a portal to document.body: callers (e.g. PostCard) render this
// inside a Framer Motion card that gains an inline `transform` while hovered,
// which creates a new containing block for `position: fixed` descendants —
// without the portal the dialog gets trapped and clipped inside that
// (often short, overflow-hidden) card instead of centering in the viewport.
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

  return createPortal(
    <div
      className="fixed inset-0 z-80 bg-black/70 flex items-center justify-center p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#111418", borderColor: `${CREAM}12` }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: `${CREAM}10` }}>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
              <Flag className="w-4 h-4 text-red-400" />
            </span>
            <h2 id="report-title" className="font-extrabold uppercase tracking-tight text-base" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
              Report {contentLabel}
            </h2>
          </div>
          <button
            onClick={() => !busy && onClose()}
            aria-label="Close"
            className="p-1.5 transition-colors"
            style={{ color: `${CREAM}45` }}
            onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}45`)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result === "ok" || result === "duplicate" ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="font-semibold" style={{ color: CREAM }}>
              {result === "ok" ? "Thanks for letting us know" : "You've already reported this"}
            </p>
            <p className="text-sm mt-1" style={{ color: `${CREAM}45` }}>
              {result === "ok"
                ? "Our team will review this content shortly."
                : "We're already looking into it."}
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-5 py-2.5 text-sm font-semibold transition-colors border"
              style={{ backgroundColor: "transparent", color: CREAM, borderColor: `${CREAM}20` }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm" style={{ color: `${CREAM}55` }}>Why are you reporting this?</p>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setReason(r.value)}
                    className="w-full text-left px-4 py-2.5 border text-sm font-medium transition-colors"
                    style={
                      reason === r.value
                        ? { borderColor: "#EF4444", backgroundColor: "rgba(239,68,68,0.1)", color: CREAM }
                        : { borderColor: `${CREAM}12`, color: `${CREAM}70` }
                    }
                    onMouseEnter={(e) => { if (reason !== r.value) e.currentTarget.style.borderColor = `${CREAM}25`; }}
                    onMouseLeave={(e) => { if (reason !== r.value) e.currentTarget.style.borderColor = `${CREAM}12`; }}
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
                className="w-full px-3.5 py-2.5 text-sm border focus:outline-none resize-none"
                style={{ color: CREAM, backgroundColor: "#0B0D0F", borderColor: `${CREAM}12` }}
              />
              {result === "error" && (
                <p className="flex items-center gap-1.5 text-sm text-red-400"><AlertCircle className="w-4 h-4" /> Couldn&apos;t submit your report. Please try again.</p>
              )}
            </div>
            <div className="px-5 py-4 border-t flex items-center justify-end gap-2" style={{ borderColor: `${CREAM}10` }}>
              <button
                onClick={() => !busy && onClose()}
                className="px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{ color: `${CREAM}55` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}55`)}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason || busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />} Submit report
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
