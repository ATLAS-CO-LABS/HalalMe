"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/authService";
import { startCooldown } from "@/lib/otpCooldown";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface FormData {
  // Step 1 - Business
  name: string;
  category_ids: string[];
  order_types: string[];
  // Step 2 - Address
  address: string;
  city: string;
  state: string;
  post_code: string;
  country: string;
  country_code: string;
  // Step 3 - Contact
  owner_name: string;
  phone: string;
  phone_country_code: string;
  email: string;
}

const COUNTRY_OPTIONS = [
  { label: "United Kingdom", value: "United Kingdom", code: "GB", dial: "+44" },
  { label: "Pakistan", value: "Pakistan", code: "PK", dial: "+92" },
  { label: "United Arab Emirates", value: "United Arab Emirates", code: "AE", dial: "+971" },
  { label: "United States", value: "United States", code: "US", dial: "+1" },
  { label: "Canada", value: "Canada", code: "CA", dial: "+1" },
  { label: "Bangladesh", value: "Bangladesh", code: "BD", dial: "+880" },
  { label: "India", value: "India", code: "IN", dial: "+91" },
  { label: "Malaysia", value: "Malaysia", code: "MY", dial: "+60" },
];

const ORDER_TYPE_OPTIONS = [
  { value: "delivery", label: "Delivery" },
  { value: "pickup", label: "Pickup" },
];

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

export default function MerchantSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    category_ids: [],
    order_types: [],
    address: "",
    city: "",
    state: "",
    post_code: "",
    country: "United Kingdom",
    country_code: "GB",
    owner_name: "",
    phone: "",
    phone_country_code: "+44",
    email: "",
  });

  useEffect(() => {
    fetch("/api/hyperzod/merchant-categories")
      .then((r) => r.json())
      .then((json) => {
        const raw = (json?.data ?? json?.categories ?? []) as Category[];
        setCategories(raw);
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
    setError(null);
  }

  function toggleOrderType(value: string) {
    setForm((prev) => ({
      ...prev,
      order_types: prev.order_types.includes(value)
        ? prev.order_types.filter((t) => t !== value)
        : [...prev.order_types, value],
    }));
    setError(null);
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.name.trim()) return "Restaurant name is required";
      if (form.name.trim().length < 2) return "Restaurant name is too short";
      if (form.category_ids.length === 0) return "Select at least one category";
      if (form.order_types.length === 0) return "Select at least one order type";
    }
    if (step === 1) {
      if (!form.address.trim()) return "Address is required";
      if (!form.city.trim()) return "City is required";
      if (!form.post_code.trim()) return "Post code is required";
    }
    if (step === 2) {
      if (!form.owner_name.trim()) return "Owner / contact name is required";
      if (form.owner_name.trim().length < 2) return "Owner name is too short";
      if (!form.phone.trim()) return "Phone number is required";
      if (form.phone.replace(/\D/g, "").length < 6) return "Enter a valid phone number";
      if (!form.email.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address";
    }
    return null;
  }

  function goNext() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
    setError(null);
  }

  async function handleSubmit() {
    const err = validateStep();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError(null);

    const selectedCountry = COUNTRY_OPTIONS.find((c) => c.value === form.country);
    const fullPhone = `${form.phone_country_code}${form.phone.replace(/^0+/, "")}`;
    const emailLower = form.email.trim().toLowerCase();

    try {
      const res = await fetch("/api/hyperzod/provision-merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          owner_name: form.owner_name.trim(),
          email: emailLower,
          phone: fullPhone,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          post_code: form.post_code.trim(),
          country: form.country,
          country_code: selectedCountry?.code ?? "GB",
          merchant_category_ids: form.category_ids,
          accepted_order_types: form.order_types,
        }),
      });

      const json = await res.json() as { error?: string; success?: boolean; requiresLogin?: boolean };

      if (!res.ok) {
        if (json.error === "email_already_registered") {
          setError("This email is already registered. Contact support if you need help.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      // Already signed in (existing user becoming a merchant) → straight to dashboard.
      if (!json.requiresLogin) {
        router.push("/merchant");
        return;
      }

      // New merchant → send a passwordless login code, then the OTP screen.
      try {
        await authService.sendMerchantLoginOtp(emailLower);
        startCooldown(emailLower, "merchant");
      } catch {
        // Even if the code send hiccups, the OTP page lets them resend.
      }
      router.push(
        `/verify-otp?email=${encodeURIComponent(emailLower)}&type=merchant&redirect=${encodeURIComponent("/merchant")}`,
      );
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#102C26] relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #F7E7CE 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-8 sm:py-10 max-w-lg">
        {/* Back to select-role */}
        <Link
          href="/select-role"
          className="inline-flex items-center gap-1.5 text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 transition-colors text-xs font-bold uppercase tracking-widest mb-6"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="relative inline-flex w-6.5 h-6.5 shrink-0">
              <span className="absolute inset-0 bg-white/92 rounded-full" />
              <Image
                src="/logo/logo.png"
                alt="HalalMe"
                width={26}
                height={26}
                className="object-contain relative z-10"
              />
            </span>
            <span
              className="text-lg font-black text-[#F7E7CE] tracking-tight"
              style={{ fontFamily: "var(--font-logo)" }}
            >
              HalalMe
            </span>
          </Link>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">
              Partner Registration
            </span>
            <div className="w-8 h-px bg-[#F59E0B]" />
          </div>

          <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-[#F7E7CE]">
            Register Your Restaurant
          </h1>
          <p className="mt-2 text-sm text-[#F7E7CE]/45">
            Join the HalalMe Delivery network
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  i === step
                    ? "text-[#F7E7CE] bg-[#F7E7CE]/10 border border-[#F7E7CE]/20"
                    : i < step
                    ? "text-emerald-400"
                    : "text-[#F7E7CE]/25"
                }`}
              >
                {i < step ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <s.Icon className="w-3 h-3" />
                )}
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-6 h-px transition-colors ${
                    i < step ? "bg-emerald-400/50" : "bg-[#F7E7CE]/15"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-6 overflow-hidden">
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
              {/* ── Step 0: Business Info ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Spice Garden"
                      className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-2">
                      Cuisine Categories * <span className="normal-case font-normal text-[#F7E7CE]/30">(select all that apply)</span>
                    </label>
                    {categoriesLoading ? (
                      <div className="flex items-center gap-2 text-[#F7E7CE]/35 text-xs py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading categories...
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
                        {categories.map((cat) => {
                          const selected = form.category_ids.includes(cat._id);
                          return (
                            <button
                              key={cat._id}
                              type="button"
                              onClick={() => toggleCategory(cat._id)}
                              className={`px-3 py-1.5 text-[11px] font-semibold border transition-colors ${
                                selected
                                  ? "bg-[#F7E7CE] text-[#102C26] border-[#F7E7CE]"
                                  : "bg-transparent text-[#F7E7CE]/55 border-[#F7E7CE]/15 hover:border-[#F7E7CE]/35 hover:text-[#F7E7CE]/75"
                              }`}
                            >
                              {selected && <Check className="inline w-3 h-3 mr-1" />}
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-2">
                      Order Types *
                    </label>
                    <div className="flex gap-3">
                      {ORDER_TYPE_OPTIONS.map((opt) => {
                        const selected = form.order_types.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleOrderType(opt.value)}
                            className={`flex-1 h-11 text-xs font-bold uppercase tracking-wider border transition-colors flex items-center justify-center gap-2 ${
                              selected
                                ? "bg-[#F7E7CE] text-[#102C26] border-[#F7E7CE]"
                                : "bg-transparent text-[#F7E7CE]/55 border-[#F7E7CE]/15 hover:border-[#F7E7CE]/35"
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5" />}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Address ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="e.g. 12 High Street"
                      className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                        placeholder="e.g. London"
                        className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                        Post Code *
                      </label>
                      <input
                        type="text"
                        value={form.post_code}
                        onChange={(e) => set("post_code", e.target.value)}
                        placeholder="e.g. SW1A 1AA"
                        className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                      State / County
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      placeholder="e.g. Greater London (optional)"
                      className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                      Country *
                    </label>
                    <select
                      value={form.country}
                      onChange={(e) => {
                        const opt = COUNTRY_OPTIONS.find((c) => c.value === e.target.value);
                        setForm((prev) => ({
                          ...prev,
                          country: e.target.value,
                          country_code: opt?.code ?? "GB",
                          phone_country_code: opt?.dial ?? "+44",
                        }));
                      }}
                      className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.value} className="bg-[#102C26]">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ── Step 2: Contact ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                      Owner / Contact Name *
                    </label>
                    <input
                      type="text"
                      value={form.owner_name}
                      onChange={(e) => set("owner_name", e.target.value)}
                      placeholder="e.g. Ahmed Khan"
                      className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                      Contact Phone *
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-[#102C26] border border-r-0 border-[#F7E7CE]/12 text-sm text-[#F7E7CE]/60 shrink-0">
                        {form.phone_country_code}
                      </div>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="7911 123456"
                        className="flex-1 h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[#F7E7CE]/25">
                      Business / owner contact number
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">
                      Contact Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F7E7CE]/25" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="you@restaurant.com"
                        className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 pl-9 pr-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[#F7E7CE]/25">
                      Your merchant portal invite will be sent here
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="mt-2 p-3 bg-[#102C26] border border-[#F7E7CE]/8 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/35 mb-2">Summary</p>
                    <SummaryRow label="Restaurant" value={form.name} />
                    <SummaryRow label="Location" value={`${form.city}, ${form.post_code}`} />
                    <SummaryRow label="Order types" value={form.order_types.join(" & ")} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="h-11 px-4 border border-[#F7E7CE]/15 text-[#F7E7CE]/55 text-xs font-bold uppercase tracking-wider hover:border-[#F7E7CE]/30 hover:text-[#F7E7CE]/75 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 h-11 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-xs flex items-center justify-center gap-2 hover:bg-[#F7E7CE]/90 transition-colors"
              >
                Continue
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-11 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-xs flex items-center justify-center gap-2 hover:bg-[#F7E7CE]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#F7E7CE]/25">
          Want to order instead?{" "}
          <Link href="/signup" className="text-[#F7E7CE]/45 hover:text-[#F7E7CE]/70 transition-colors font-semibold">
            Customer signup
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] text-[#F7E7CE]/35 uppercase tracking-wider">{label}</span>
      <span className="text-[11px] text-[#F7E7CE]/65 font-medium text-right">{value}</span>
    </div>
  );
}
