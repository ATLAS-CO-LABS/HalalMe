"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, FlaskConical, Loader2, MapPin, Phone, Store } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { BUSINESS_TYPES, VENDOR_CATEGORIES } from "@/lib/vendorOnboarding";
import type { VendorRegistration } from "@/types/marketplaceVendor";

// Mirrors /partner/merchant (the restaurant signup) so both partner paths feel
// like one family: same dark card, same three-step rhythm.

const STEPS = [
  { label: "Business", Icon: Store },
  { label: "Address", Icon: MapPin },
  { label: "Contact", Icon: Phone },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/60 mb-1.5";
const inputClass =
  "w-full h-11 bg-[#102C26] border border-[#F7E7CE]/15 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/30 focus:outline-none focus:border-[#F7E7CE]/50 transition-colors";

function TextField({
  label,
  value,
  onChange,
  ...rest
}: { label: string; value: string; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}

export default function VendorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState<VendorRegistration>({
    tradingName: "",
    businessType: "sole_trader",
    categories: [],
    address: "",
    city: "",
    postCode: "",
    ownerName: "",
    email: "",
    phone: "",
  });

  function set<K extends keyof VendorRegistration>(key: K, value: VendorRegistration[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.tradingName.trim()) return "Enter your business or brand name.";
      if (form.categories.length === 0) return "Choose at least one category.";
    }
    if (step === 1) {
      if (!form.address.trim() || !form.city.trim() || !form.postCode.trim()) return "Enter your full business address.";
    }
    if (step === 2) {
      if (!form.ownerName.trim()) return "Enter your full name.";
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
      if (form.phone.replace(/\D/g, "").length < 10) return "Enter a valid phone number.";
      if (!agreed) return "Please confirm you agree to the seller terms.";
    }
    return null;
  }

  function goNext() {
    const problem = validateStep();
    if (problem) return setError(problem);
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setError(null);
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    const problem = validateStep();
    if (problem) return setError(problem);
    setSubmitting(true);
    try {
      // PREVIEW: this creates a sample vendor in the browser only. The real
      // flow will create the account and send an email code first, exactly as
      // /partner/merchant does through authService.
      await vendorService.register(form);
      router.push("/vendor");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function continueAsSample() {
    vendorService.demoSignInAs("noor-and-co");
    router.push("/vendor");
  }

  return (
    <div className="min-h-screen bg-[#102C26] relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #F7E7CE 1px, transparent 0)", backgroundSize: "32px 32px" }}
      />

      <div className="relative z-10 mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="relative inline-flex w-7 h-7">
              <span className="absolute inset-0 bg-white/90 rounded-full" />
              <Image src="/logo/logo.png" alt="" width={28} height={28} className="object-contain relative z-10" />
            </span>
            <span className="text-xl font-black text-[#F7E7CE] tracking-tight" style={{ fontFamily: "var(--font-logo)" }}>
              HalalMe
            </span>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">Marketplace</span>
            <div className="w-6 h-px bg-[#F59E0B]" />
          </div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-[#F7E7CE]">Apply to Sell</h1>
          <p className="mt-2 text-sm text-[#F7E7CE]/60">Start your application. It takes about two minutes.</p>
        </div>

        {/* Step indicators */}
        <ol className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex items-center">
              <span
                aria-current={i === step ? "step" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  i === step ? "text-[#F7E7CE] bg-[#F7E7CE]/10 border border-[#F7E7CE]/20" : i < step ? "text-emerald-400" : "text-[#F7E7CE]/35"
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : <s.Icon className="w-3 h-3" />}
                {s.label}
              </span>
              {i < STEPS.length - 1 && <span className={`w-6 h-px ${i < step ? "bg-emerald-400/50" : "bg-[#F7E7CE]/15"}`} />}
            </li>
          ))}
        </ol>

        <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 p-5 sm:p-7 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {step === 0 && (
                <div className="space-y-5">
                  <TextField label="Business or brand name" value={form.tradingName} onChange={(v) => set("tradingName", v)} placeholder="e.g. Noor & Co" autoComplete="organization" />
                  <label className="block">
                    <span className={labelClass}>Business type</span>
                    <select value={form.businessType} onChange={(e) => set("businessType", e.target.value as VendorRegistration["businessType"])} className={inputClass}>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <span className={labelClass}>What do you sell?</span>
                    <div className="flex flex-wrap gap-2">
                      {VENDOR_CATEGORIES.map((c) => {
                        const active = form.categories.includes(c.handle);
                        return (
                          <button
                            key={c.handle}
                            type="button"
                            aria-pressed={active}
                            onClick={() => set("categories", active ? form.categories.filter((x) => x !== c.handle) : [...form.categories, c.handle])}
                            className={`px-3 py-2 text-xs font-semibold border transition-colors ${
                              active ? "bg-[#F7E7CE] text-[#102C26] border-[#F7E7CE]" : "text-[#F7E7CE]/70 border-[#F7E7CE]/20 hover:border-[#F7E7CE]/45"
                            }`}
                          >
                            {c.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <TextField label="Business address" value={form.address} onChange={(v) => set("address", v)} placeholder="Street address" autoComplete="street-address" />
                  <div className="grid grid-cols-2 gap-4">
                    <TextField label="Town or city" value={form.city} onChange={(v) => set("city", v)} autoComplete="address-level2" />
                    <TextField label="Postcode" value={form.postCode} onChange={(v) => set("postCode", v)} autoComplete="postal-code" />
                  </div>
                  <p className="text-xs text-[#F7E7CE]/50">Marketplace is open to UK-based businesses at launch.</p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <TextField label="Your full name" value={form.ownerName} onChange={(v) => set("ownerName", v)} autoComplete="name" />
                  <TextField label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@yourbusiness.co.uk" autoComplete="email" />
                  <TextField label="Phone" type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="07700 900000" autoComplete="tel" />
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setError(null); }} className="mt-0.5 w-4 h-4 accent-[#F59E0B]" />
                    <span className="text-xs text-[#F7E7CE]/70 leading-relaxed">
                      I agree to the HalalMe{" "}
                      <Link href="/terms" className="underline text-[#F7E7CE]">
                        seller terms
                      </Link>{" "}
                      and understand my business will be checked before I can sell.
                    </span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p role="alert" className="mt-5 text-xs text-red-300 bg-red-400/10 border border-red-400/25 px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="h-11 px-4 border border-[#F7E7CE]/20 text-[#F7E7CE]/75 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 hover:border-[#F7E7CE]/45 hover:text-[#F7E7CE] transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 h-11 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm flex items-center justify-center gap-2 hover:bg-[#F7E7CE]/90 transition-colors"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-11 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm flex items-center justify-center gap-2 hover:bg-[#F7E7CE]/90 transition-colors disabled:opacity-60"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating your account</> : <>Start application <ChevronRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[#F7E7CE]/60 mt-6">
          Already selling with us?{" "}
          <Link href="/login?redirect=/vendor" className="font-bold text-[#F7E7CE] underline">
            Log in
          </Link>
        </p>
        <p className="text-center text-sm text-[#F7E7CE]/60 mt-2">
          Run a restaurant instead?{" "}
          <Link href="/partner/merchant" className="font-bold text-[#F7E7CE] underline">
            Register your restaurant
          </Link>
        </p>

        {/* Preview-only shortcut. Remove with the mock store. */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#F59E0B]/35 bg-[#F59E0B]/10 px-4 py-3">
          <p className="flex items-start gap-2 text-xs text-[#F7E7CE]/80">
            <FlaskConical className="w-4 h-4 shrink-0 text-[#F59E0B]" />
            Preview build. Applications are saved in this browser only and no account is created.
          </p>
          <button
            type="button"
            onClick={continueAsSample}
            className="shrink-0 h-8 px-3 text-[11px] font-bold uppercase tracking-wide text-[#F59E0B] border border-[#F59E0B]/50 hover:bg-[#F59E0B]/15 transition-colors"
          >
            Open sample store
          </button>
        </div>
      </div>
    </div>
  );
}
