"use client";

import { useState } from "react";
import {
  merchantService,
  type MerchantCommission,
} from "@/services/merchantService";
import {
  COMMISSION_QUESTIONS,
  COMMISSION_OPENING,
  type CommissionAnswers,
} from "@/lib/merchantStages";
import {
  Bot,
  Loader2,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

const REVIEW_REASONS: { value: string; label: string }[] = [
  { value: "existing_provider", label: "I'm on cheaper terms elsewhere" },
  { value: "expansion", label: "I have expansion plans" },
  { value: "strategic", label: "Strategic opportunity" },
  { value: "other", label: "Other" },
];

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : `${Number.isInteger(n) ? n : n.toFixed(1)}%`;

/**
 * The Commission stage's dedicated section. Looks conversational; the rate is
 * decided by the deterministic engine on the server. `commission` is the current
 * record (null before the merchant has answered). `onUpdate` is called with the
 * fresh record after any action so the parent can re-evaluate the stage.
 */
export default function CommissionReview({
  commission,
  onUpdate,
}: {
  commission: MerchantCommission | null;
  onUpdate: (c: MerchantCommission) => void;
}) {
  // ── Questionnaire state (only used before a record exists) ──────────────────
  const [answers, setAnswers] = useState<Partial<CommissionAnswers>>({});
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(key: keyof CommissionAnswers, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < COMMISSION_QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    // Last answer → submit to the server, which scores it.
    setBusy(true);
    setError(null);
    try {
      const result = await merchantService.submitCommission(next as CommissionAnswers);
      onUpdate(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <Bot className="w-4 h-4 text-[#F59E0B]" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#F7E7CE]">Commission review</h2>
      </div>

      {/* The record drives which view we show. */}
      {!commission ? (
        <Questionnaire
          step={step}
          busy={busy}
          error={error}
          answers={answers}
          onChoose={choose}
        />
      ) : (
        <Result commission={commission} onUpdate={onUpdate} />
      )}
    </section>
  );
}

// ── The tap-only questionnaire ─────────────────────────────────────────────────

function Questionnaire({
  step,
  busy,
  error,
  answers,
  onChoose,
}: {
  step: number;
  busy: boolean;
  error: string | null;
  answers: Partial<CommissionAnswers>;
  onChoose: (key: keyof CommissionAnswers, value: string) => void;
}) {
  const total = COMMISSION_QUESTIONS.length;
  const q = COMMISSION_QUESTIONS[step];

  if (busy) {
    return (
      <div className="py-10 flex flex-col items-center text-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#F59E0B]" />
        <p className="text-sm text-[#F7E7CE]/60">Reviewing your answers…</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-[#F7E7CE]/40 mb-4">
        Every merchant starts at {COMMISSION_OPENING}%. Answer a few questions and we&apos;ll
        check whether you qualify for a better rate.
      </p>

      {/* progress */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-1.5 flex-1 bg-[#F7E7CE]/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] rounded-full transition-all duration-300"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#F7E7CE]/40 shrink-0">
          {step + 1}/{total}
        </span>
      </div>

      {/* the question (chat bubble) */}
      <div className="flex gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
          <Bot className="w-3.5 h-3.5 text-[#F59E0B]" />
        </div>
        <div className="bg-[#102C26] border border-[#F7E7CE]/8 px-3.5 py-3 rounded-r-lg rounded-bl-lg">
          <p className="text-sm text-[#F7E7CE]/85 leading-relaxed">{q.prompt}</p>
          {q.hint && <p className="text-xs text-[#F7E7CE]/35 mt-1">{q.hint}</p>}
        </div>
      </div>

      {/* tap options */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt) => {
          const selected = answers[q.key] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChoose(q.key, opt.value)}
              className={`h-11 px-3 text-sm font-semibold border transition-colors ${
                selected
                  ? "bg-[#F59E0B] border-[#F59E0B] text-[#102C26]"
                  : "bg-[#102C26] border-[#F7E7CE]/12 text-[#F7E7CE]/80 hover:border-[#F59E0B]/50 hover:text-[#F7E7CE]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
    </div>
  );
}

// ── The result view (state machine on the commission record) ───────────────────

function Result({
  commission,
  onUpdate,
}: {
  commission: MerchantCommission;
  onUpdate: (c: MerchantCommission) => void;
}) {
  const [busy, setBusy] = useState<"accept" | "review" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [reason, setReason] = useState("");
  const [requested, setRequested] = useState("");
  const [evidenceName, setEvidenceName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function accept() {
    setBusy("accept");
    setError(null);
    try {
      onUpdate(await merchantService.acceptCommission());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not accept.");
    } finally {
      setBusy(null);
    }
  }

  async function uploadEvidence(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await merchantService.uploadDocument(file, "competitor_evidence");
      setEvidenceName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submitReview() {
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }
    // Proof is only required when they're countering because they're on cheaper
    // terms elsewhere — that's the Price-Promise case we need to verify.
    if (reason === "existing_provider" && !evidenceName) {
      setError("Please attach proof of your cheaper rate so we can match it.");
      return;
    }
    setBusy("review");
    setError(null);
    try {
      const num = requested ? Number(requested) : undefined;
      onUpdate(await merchantService.requestCommissionReview(reason, num));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit.");
    } finally {
      setBusy(null);
    }
  }

  // ── Terminal/status states first ────────────────────────────────────────────

  if (commission.review_status === "pending") {
    return (
      <StatusNote
        icon={<Clock className="w-5 h-5 text-amber-400" />}
        title="Pending commercial review"
        body="Thanks — our team is reviewing your request and will be in touch shortly. You'll get an email when there's an update."
      />
    );
  }

  if (commission.review_status === "rejected") {
    return (
      <StatusNote
        icon={<MessageSquare className="w-5 h-5 text-[#F7E7CE]/60" />}
        title="Let's talk it through"
        body={`We couldn't approve that rate automatically. Your standard offer of ${fmt(
          commission.recommended_commission,
        )} still stands — or reach out via support and we'll find the right fit.`}
      />
    );
  }

  if (commission.review_status === "countered" && commission.countered_commission != null) {
    return (
      <div>
        <ResultHeader
          rate={commission.countered_commission}
          caption="Our counter-offer"
          breakdown={commission.score_breakdown}
        />
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={accept}
            disabled={busy === "accept"}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 bg-[#F59E0B] text-[#102C26] text-xs font-extrabold uppercase tracking-tighter hover:bg-[#F59E0B]/90 disabled:opacity-60 transition-colors"
          >
            {busy === "accept" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Accept {fmt(commission.countered_commission)}
          </button>
        </div>
      </div>
    );
  }

  // ── Active decision states ────────────────────────────────────────────────────

  const isReviewLane = commission.lane === "review";
  const rate = commission.recommended_commission;
  // Whenever the engine produced a fixed rate (25/27.5/30) the merchant may
  // simply accept it — even on the review lane, where review is the *optional*
  // path to a lower Price-Promise match. Only "Review Required" (score ≥ 36,
  // no fixed rate) hides Accept.
  const canAccept = rate != null;

  return (
    <div>
      <ResultHeader
        rate={rate}
        caption={canAccept ? "Your recommended commission" : "Your rate needs a quick review"}
        breakdown={commission.score_breakdown}
      />

      {isReviewLane && (
        <div className="flex items-start gap-2.5 bg-[#F59E0B]/8 border border-[#F59E0B]/20 px-3.5 py-3 mt-4">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
          <p className="text-xs text-[#F7E7CE]/70 leading-relaxed">
            {canAccept
              ? <>You can accept this rate now — or, if you&apos;re on cheaper terms elsewhere, request a review and attach proof so our Price Promise can match it.</>
              : <>Your answers qualify you for a tailored commercial rate. Tell us a little more and our team will confirm it (attach proof if you&apos;re on cheaper terms elsewhere — our Price Promise can match it).</>}
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

      {!showReview ? (
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          {canAccept && (
            <button
              onClick={accept}
              disabled={busy === "accept"}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 bg-[#F59E0B] text-[#102C26] text-xs font-extrabold uppercase tracking-tighter hover:bg-[#F59E0B]/90 disabled:opacity-60 transition-colors"
            >
              {busy === "accept" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Accept {fmt(rate)}
            </button>
          )}
          <button
            onClick={() => setShowReview(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 border border-[#F7E7CE]/15 text-[#F7E7CE]/70 text-xs font-bold uppercase tracking-wide hover:border-[#F7E7CE]/30 hover:text-[#F7E7CE] transition-colors"
          >
            {canAccept ? "Request review" : <>Continue <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/40 mb-1.5">
              Reason for review
            </label>
            <div className="grid gap-2">
              {REVIEW_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`h-10 px-3 text-left text-sm font-medium border transition-colors ${
                    reason === r.value
                      ? "bg-[#F59E0B] border-[#F59E0B] text-[#102C26]"
                      : "bg-[#102C26] border-[#F7E7CE]/12 text-[#F7E7CE]/75 hover:border-[#F59E0B]/50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/40 mb-1.5">
              Rate you&apos;re hoping for (optional)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={requested}
              onChange={(e) => setRequested(e.target.value)}
              placeholder="e.g. 22"
              className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40"
            />
          </div>

          {/* Proof is only asked for when the reason is "cheaper elsewhere" —
              every other reason just needs the reason itself (Sami's rule). */}
          {reason === "existing_provider" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/40 mb-1.5">
                Proof of your cheaper rate (required for Price Promise)
              </label>
              <label className="inline-flex items-center gap-2 h-10 px-3.5 border border-[#F7E7CE]/15 text-[#F7E7CE]/70 text-xs font-bold uppercase tracking-wide hover:border-[#F7E7CE]/30 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => { uploadEvidence(e.target.files?.[0]); e.target.value = ""; }}
                />
                {uploading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                  : evidenceName
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {evidenceName}</>
                  : <><Upload className="w-3.5 h-3.5" /> Upload proof</>}
              </label>
              <p className="text-[11px] text-[#F7E7CE]/30 mt-1.5">
                A contract or statement showing your current rate with UberEats, Deliveroo or JustEat.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={submitReview}
              disabled={busy === "review"}
              className="h-11 px-5 bg-[#F59E0B] text-[#102C26] text-xs font-extrabold uppercase tracking-tighter hover:bg-[#F59E0B]/90 disabled:opacity-60 transition-colors inline-flex items-center gap-2"
            >
              {busy === "review" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Submit for review
            </button>
            <button
              onClick={() => { setShowReview(false); setError(null); }}
              className="h-11 px-4 text-xs font-bold uppercase tracking-wide text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small presentational helpers ────────────────────────────────────────────────

function ResultHeader({
  rate,
  caption,
  breakdown,
}: {
  rate: number | null;
  caption: string;
  breakdown: { label: string; points: number }[] | null;
}) {
  return (
    <div className="bg-[#102C26] border border-[#F59E0B]/20 px-4 py-5 mt-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F7E7CE]/40">{caption}</p>
      <div className="flex items-center justify-center gap-2 mt-1">
        <Sparkles className="w-5 h-5 text-[#F59E0B]" />
        <span className="text-4xl font-extrabold text-[#F7E7CE] tracking-tight">{fmt(rate)}</span>
      </div>
      {breakdown && breakdown.length > 0 && (
        <div className="mt-3 inline-flex flex-col items-start gap-1">
          {breakdown.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs text-[#F7E7CE]/55">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" /> {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusNote({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 bg-[#102C26] border border-[#F7E7CE]/8 px-4 py-4 mt-4">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-bold text-[#F7E7CE] mb-1">{title}</p>
        <p className="text-sm text-[#F7E7CE]/55 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
