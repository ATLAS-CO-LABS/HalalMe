"use client";

import { useState } from "react";
import {
  merchantService,
  type MerchantCommission,
} from "@/services/merchantService";
import { buildMerchantAgreement } from "@/lib/merchantAgreement";
import { FileSignature, Loader2, Check, CheckCircle2 } from "lucide-react";

const fmt = (n: number | null | undefined) =>
  n == null ? "your agreed rate" : `${Number.isInteger(n) ? n : n.toFixed(1)}%`;

/**
 * Agreed-stage section. The commission number is already locked; here the
 * merchant reads the full agreement inline and signs it (tick + timestamp). On
 * signing we email them a copy. An admin then reviews and flips them to Live.
 */
export default function AgreedSection({
  commission,
  restaurantName,
  ownerName,
  onUpdate,
}: {
  commission: MerchantCommission | null;
  restaurantName: string;
  ownerName: string | null;
  onUpdate: (c: MerchantCommission) => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signed = !!commission?.contract_signed_at;
  const rate = commission?.final_commission ?? null;

  const agreement = buildMerchantAgreement({
    restaurantName,
    ownerName,
    commission: rate ?? 0,
  });

  async function sign() {
    setBusy(true);
    setError(null);
    try {
      onUpdate(await merchantService.signContract());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record your signature.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <FileSignature className="w-4 h-4 text-[#F59E0B]" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#F7E7CE]">Your agreement</h2>
      </div>

      {/* locked rate */}
      <div className="flex items-center gap-2.5 bg-[#102C26] border border-emerald-500/20 px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-[#F7E7CE]/80">
          Your commission rate is locked at{" "}
          <strong className="text-[#F7E7CE]">{fmt(rate)}</strong>.
        </p>
      </div>

      {signed ? (
        <div className="flex items-start gap-3 bg-[#102C26] border border-[#F7E7CE]/8 px-4 py-4 mt-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#F7E7CE] mb-1">Agreement signed</p>
            <p className="text-sm text-[#F7E7CE]/55 leading-relaxed">
              Thank you — we&apos;ve emailed you a copy for your records. Our team is
              completing the final checks and you&apos;ll be live on HalalMe very soon.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {/* The actual agreement — scrollable so it's clearly "the document". */}
          <div className="border border-[#F7E7CE]/10 bg-[#102C26]">
            <div className="px-4 py-3 border-b border-[#F7E7CE]/8">
              <p className="text-sm font-bold text-[#F7E7CE]">{agreement.title}</p>
              <p className="text-[11px] text-[#F7E7CE]/40 mt-0.5">
                Version {agreement.version} · {agreement.effectiveDate}
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3">
              <p className="text-xs text-[#F7E7CE]/55 leading-relaxed">{agreement.parties}</p>
              <p className="text-xs text-[#F7E7CE]/55 leading-relaxed">{agreement.intro}</p>
              {agreement.clauses.map((c) => (
                <div key={c.heading}>
                  <p className="text-xs font-bold text-[#F7E7CE]/80">{c.heading}</p>
                  <p className="text-xs text-[#F7E7CE]/50 leading-relaxed mt-0.5">{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* tick + sign */}
          <label className="flex items-start gap-2.5 cursor-pointer my-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#F59E0B]"
            />
            <span className="text-sm text-[#F7E7CE]/70 leading-relaxed">
              I have read and agree to the HalalMe Merchant Agreement above at {fmt(rate)} commission.
            </span>
          </label>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          <button
            onClick={sign}
            disabled={!agreed || busy}
            className="w-full sm:w-auto h-11 px-6 bg-[#F59E0B] text-[#102C26] text-xs font-extrabold uppercase tracking-tighter hover:bg-[#F59E0B]/90 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Sign &amp; submit
          </button>
          <p className="text-[11px] text-[#F7E7CE]/30 mt-2.5">
            We&apos;ll email you a copy of this agreement for your records once you sign.
          </p>
        </div>
      )}
    </section>
  );
}
