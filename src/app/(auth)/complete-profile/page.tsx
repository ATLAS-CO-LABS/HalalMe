"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/profileService";
import { CheckCircle2, XCircle, Loader2, Camera, ArrowRight, Phone } from "lucide-react";

const COUNTRY_CODES = [
  { code: "GB", label: "🇬🇧 +44" },
  { code: "PK", label: "🇵🇰 +92" },
  { code: "IN", label: "🇮🇳 +91" },
  { code: "BD", label: "🇧🇩 +880" },
  { code: "AE", label: "🇦🇪 +971" },
  { code: "SA", label: "🇸🇦 +966" },
  { code: "US", label: "🇺🇸 +1" },
  { code: "CA", label: "🇨🇦 +1" },
];

function validateUsername(value: string): string | null {
  if (value.length < 3) return "At least 3 characters";
  if (value.length > 20) return "Max 20 characters";
  if (!/^[a-z0-9_]+$/.test(value)) return "Lowercase, numbers, underscores only";
  return null;
}

type AvailState = "idle" | "checking" | "available" | "taken" | "error";

export default function CompleteProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user?.username && !submitting) router.replace("/dashboard");
  }, [user, authLoading, router, submitting]);

  const [username, setUsername] = useState("");
  const [availState, setAvailState] = useState<AvailState>("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("GB");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback(async (value: string) => {
    const err = validateUsername(value);
    setUsernameError(err);
    if (err) { setAvailState("idle"); return; }
    setAvailState("checking");
    try {
      const ok = await profileService.isUsernameAvailable(value, user?.id);
      setAvailState(ok ? "available" : "taken");
    } catch {
      setAvailState("error");
    }
  }, [user?.id]);

  const handleUsernameChange = (raw: string) => {
    const value = raw.toLowerCase().replace(/\s/g, "_");
    setUsername(value);
    setAvailState("idle");
    setUsernameError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 3) {
      debounceRef.current = setTimeout(() => checkAvailability(value), 500);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const err = validateUsername(username);
    if (err) { setUsernameError(err); return; }
    if (availState !== "available") return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (avatarFile) {
        try {
          await profileService.uploadAvatar(user.id, avatarFile);
        } catch {
          console.warn("Avatar upload failed, continuing without it.");
        }
      }
      const trimmedMobile = mobile.trim();
      if (trimmedMobile && trimmedMobile.length < 7) {
        setSubmitError("Mobile number looks too short. Please check and try again.");
        setSubmitting(false);
        return;
      }
      const phone = trimmedMobile ? `${countryCode}:${trimmedMobile}` : undefined;
      if (phone) {
        const phoneAvailable = await profileService.isPhoneAvailable(phone, user.id);
        if (!phoneAvailable) {
          setSubmitError("This mobile number is already linked to another account.");
          setSubmitting(false);
          return;
        }
      }
      await profileService.updateProfile(user.id, { username, ...(phone ? { phone } : {}) });
      await refreshUser();
      // Fire-and-forget: provision Hyperzod account in background
      const hasPhone = !!phone;
      fetch("/api/hyperzod/provision-customer", { method: "POST" }).catch(() => {});
      router.push(hasPhone ? "/dashboard?delivery=ready" : "/dashboard");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  const firstName = user.full_name?.split(" ")[0] ?? "there";
  const canSubmit = !submitting && availState === "available" && !usernameError;

  return (
    <div className="space-y-6">

      {/* ── Greeting ──────────────────────────────────────────── */}
      <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 rounded-xl px-6 pt-7 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F59E0B] mb-4">
          One last step
        </p>
        <h1 className="text-3xl font-extrabold uppercase tracking-tighter leading-none text-[#F7E7CE]">
          Hey, {firstName}.
        </h1>
        <p className="mt-2 text-[#F7E7CE]/45 text-sm leading-relaxed">
          Before you dive in - let's set up how the community sees you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Step 1: Photo ─────────────────────────────────────── */}
        <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 rounded-xl px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F7E7CE]/30 mb-1">
            Step 1
          </p>
          <h2 className="text-base font-bold text-[#F7E7CE] mb-1">
            Add a profile picture
          </h2>
          <p className="text-xs text-[#F7E7CE]/35 mb-5">
            Faces build trust. Put a photo so people know who they're cooking with.
          </p>

          <div className="flex items-center gap-5">
            {/* Avatar picker */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group shrink-0"
              aria-label="Upload profile picture"
            >
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-dashed border-[#F7E7CE]/20 bg-[#F7E7CE]/5 flex items-center justify-center transition-colors group-hover:border-[#F59E0B]/40">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Your photo"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-7 w-7 text-[#F7E7CE]/20 group-hover:text-[#F59E0B]/60 transition-colors" />
                )}
              </div>
              {avatarPreview && (
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div>
              {avatarPreview ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-400">
                    Looking good!
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 transition-colors underline underline-offset-2"
                  >
                    Change photo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-semibold text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
                  >
                    Choose a photo
                  </button>
                  <p className="text-xs text-[#F7E7CE]/25">
                    JPG, PNG or WebP · max 5 MB
                  </p>
                  <p className="text-xs text-[#F7E7CE]/20 italic">
                    Optional - you can always add one later.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Step 2: Mobile ───────────────────────────────────── */}
        <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 rounded-xl px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F7E7CE]/30 mb-1">
            Step 2
          </p>
          <h2 className="text-base font-bold text-[#F7E7CE] mb-1 flex items-center gap-2">
            <Phone className="h-4 w-4 text-[#F59E0B]" />
            Mobile number
          </h2>
          <p className="text-xs text-[#F7E7CE]/35 mb-5">
            Needed to activate your HalalMe Delivery account. Skip if you don&apos;t need delivery.
          </p>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="h-11 rounded-lg border border-[#F7E7CE]/12 bg-[#F7E7CE]/5 px-2 text-sm text-[#F7E7CE] outline-none focus:border-[#F59E0B]/50 focus:ring-1 focus:ring-[#F59E0B]/15 shrink-0"
            >
              {COUNTRY_CODES.map(({ code, label }) => (
                <option key={code} value={code} className="bg-[#0A1C19]">{label}</option>
              ))}
            </select>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="7911 123456"
              className="flex-1 h-11 rounded-lg border border-[#F7E7CE]/12 bg-[#F7E7CE]/5 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/20 outline-none focus:border-[#F59E0B]/50 focus:ring-1 focus:ring-[#F59E0B]/15"
            />
          </div>
          <p className="text-xs text-[#F7E7CE]/20 mt-2">
            Numbers only · no country prefix needed
          </p>
        </div>

        {/* ── Step 3: Username ──────────────────────────────────── */}
        <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 rounded-xl px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F7E7CE]/30 mb-1">
            Step 3
          </p>
          <h2 className="text-base font-bold text-[#F7E7CE] mb-1">
            Pick your username
          </h2>
          <p className="text-xs text-[#F7E7CE]/35 mb-5">
            This is how people find you - make it yours.
          </p>

          <div className="relative">
            {/* @ prefix */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#F7E7CE]/25 pointer-events-none select-none">
              @
            </div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="your_handle"
              autoComplete="username"
              autoFocus
              className={`w-full rounded-lg border bg-[#F7E7CE]/5 pl-7 pr-10 py-3 text-sm font-semibold text-[#F7E7CE] placeholder-[#F7E7CE]/20 outline-none transition-all focus:ring-1 ${
                usernameError || availState === "taken"
                  ? "border-red-500/50 focus:border-red-400 focus:ring-red-400/20"
                  : availState === "available"
                  ? "border-emerald-500/50 focus:border-emerald-400 focus:ring-emerald-400/20"
                  : "border-[#F7E7CE]/12 focus:border-[#F59E0B]/50 focus:ring-[#F59E0B]/15"
              }`}
            />
            {/* Status icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {availState === "checking" && <Loader2 className="h-4 w-4 animate-spin text-[#F7E7CE]/30" />}
              {availState === "available" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {availState === "taken"     && <XCircle className="h-4 w-4 text-red-400" />}
            </div>
          </div>

          {/* Feedback */}
          <div className="mt-2 min-h-[1.1rem]">
            {usernameError && (
              <p className="text-xs text-red-400">{usernameError}</p>
            )}
            {!usernameError && availState === "taken" && (
              <p className="text-xs text-red-400">
                That one's taken - try something a bit different.
              </p>
            )}
            {!usernameError && availState === "available" && (
              <p className="text-xs text-emerald-400">
                That's yours if you want it!
              </p>
            )}
            {!usernameError && (availState === "idle" || availState === "error") && (
              <p className="text-xs text-[#F7E7CE]/20">
                3–20 chars · lowercase · underscores allowed
              </p>
            )}
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────── */}
        {submitError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
        )}

        {/* ── CTA ───────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#F59E0B] py-3.5 text-sm font-bold text-[#0A1C19] uppercase tracking-wider transition-all hover:bg-[#FBBF24] active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up your profile…
            </>
          ) : (
            <>
              I&apos;m ready - let&apos;s go
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#F7E7CE]/20">
          You can update your photo and username anytime from settings.
        </p>

      </form>
    </div>
  );
}
