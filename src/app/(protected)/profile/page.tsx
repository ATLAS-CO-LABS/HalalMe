"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/profileService";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  AtSign,
  FileText,
  MapPin,
  Lock,
  Trash2,
  ChevronRight,
} from "lucide-react";

/* ─── username validation ────────────────────────────────── */
function validateUsername(value: string): string | null {
  if (value.length < 3) return "At least 3 characters required";
  if (value.length > 20) return "Maximum 20 characters";
  if (!/^[a-z0-9_]+$/.test(value))
    return "Only lowercase letters, numbers, and underscores";
  return null;
}

type AvailState = "idle" | "checking" | "available" | "taken" | "error";

/* ─── small section wrapper ──────────────────────────────── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#F7E7CE]/10 bg-[#0A1C19] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F7E7CE]/8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
          {title}
        </h2>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </section>
  );
}

/* ─── field row ─────────────────────────────────────────── */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#F7E7CE]/35 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── text input ─────────────────────────────────────────── */
function TextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  icon: Icon,
  rightSlot,
  error,
  success,
  textarea,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ElementType;
  rightSlot?: React.ReactNode;
  error?: boolean;
  success?: boolean;
  textarea?: boolean;
}) {
  const base =
    "w-full rounded-md border bg-[#F7E7CE]/5 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/20 outline-none transition-colors focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const border = error
    ? "border-red-500/60 focus:border-red-400 focus:ring-red-400/20"
    : success
    ? "border-emerald-500/60 focus:border-emerald-400 focus:ring-emerald-400/20"
    : "border-[#F7E7CE]/15 focus:border-[#F59E0B]/60 focus:ring-[#F59E0B]/15";

  if (textarea) {
    return (
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={`${base} ${border} px-3 py-2.5 resize-none`}
      />
    );
  }

  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#F7E7CE]/25 pointer-events-none" />
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${base} ${border} ${Icon ? "pl-9" : "px-3"} ${rightSlot ? "pr-9" : "pr-3"} py-2.5`}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  /* ── profile fields ── */
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  /* ── username availability ── */
  const [availState, setAvailState] = useState<AvailState>("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── avatar ── */
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── save state ── */
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ── seed form from current user ── */
  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name ?? "");
    setUsername(user.username ?? "");
    setBio(user.bio ?? "");
    setLocation(user.location ?? "");
    if (user.avatar_url) setAvatarPreview(user.avatar_url);
  }, [user]);

  /* ── username availability check ── */
  const checkAvailability = useCallback(
    async (value: string) => {
      const err = validateUsername(value);
      setUsernameError(err);
      if (err) { setAvailState("idle"); return; }

      // Same as current → no need to check
      if (value === user?.username) { setAvailState("available"); return; }

      setAvailState("checking");
      try {
        const ok = await profileService.isUsernameAvailable(value, user?.id);
        setAvailState(ok ? "available" : "taken");
      } catch {
        setAvailState("error");
      }
    },
    [user?.id, user?.username]
  );

  const handleUsernameChange = (raw: string) => {
    const value = raw.toLowerCase().replace(/\s/g, "_");
    setUsername(value);
    setAvailState("idle");
    setUsernameError(null);
    setSaveSuccess(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 3) {
      debounceRef.current = setTimeout(() => checkAvailability(value), 500);
    }
  };

  /* ── avatar ── */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ── save ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (usernameError || availState === "taken") return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (avatarFile) {
        await profileService.uploadAvatar(user.id, avatarFile);
        setAvatarFile(null);
      }

      await profileService.updateProfile(user.id, {
        full_name: fullName,
        username,
        bio: bio || undefined,
        location: location || undefined,
      });

      await refreshUser();
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── guards ── */
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#102C26]">
        <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  if (!user) return null;

  /* ── availability slot ── */
  const availSlot =
    availState === "checking" ? (
      <Loader2 className="h-4 w-4 animate-spin text-[#F7E7CE]/40" />
    ) : availState === "available" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    ) : availState === "taken" ? (
      <XCircle className="h-4 w-4 text-red-400" />
    ) : null;

  const initials = (user.full_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#102C26]">
      <div className="container mx-auto max-w-2xl px-4 py-10 sm:py-14">

        {/* ── Page title ── */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F59E0B] mb-2">
            Account
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-none text-[#F7E7CE]">
            Profile
            <br />
            <span className="text-[#F7E7CE]/30">Settings</span>
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-5">

          {/* ── Avatar card ── */}
          <Section title="Photo">
            <div className="flex items-center gap-5">
              {/* Avatar circle */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group flex-shrink-0"
                aria-label="Change profile picture"
              >
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#F7E7CE]/15 bg-[#F7E7CE]/5 flex items-center justify-center">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                      unoptimized={avatarPreview.startsWith("blob:")}
                    />
                  ) : (
                    <span className="text-xl font-bold text-[#F7E7CE]/40">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>

              <div>
                <p className="text-sm font-semibold text-[#F7E7CE]/80 mb-1">
                  {user.full_name}
                </p>
                <p className="text-xs text-[#F7E7CE]/35 mb-3">
                  {user.email}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
                >
                  {avatarFile ? "Change photo" : "Upload photo"}
                </button>
                {avatarFile && (
                  <span className="ml-3 text-xs text-[#F7E7CE]/30">
                    {avatarFile.name}
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </Section>

          {/* ── Identity ── */}
          <Section title="Identity">
            <Field label="Full Name">
              <TextInput
                value={fullName}
                onChange={(v) => { setFullName(v); setSaveSuccess(false); }}
                placeholder="Your full name"
                icon={User}
              />
            </Field>

            <Field label="Username">
              <TextInput
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="your_handle"
                icon={AtSign}
                rightSlot={availSlot}
                error={!!usernameError || availState === "taken"}
                success={availState === "available"}
              />
              <div className="mt-1.5 min-h-[1.25rem]">
                {usernameError && (
                  <p className="text-xs text-red-400">{usernameError}</p>
                )}
                {!usernameError && availState === "taken" && (
                  <p className="text-xs text-red-400">Username already taken.</p>
                )}
                {!usernameError && availState === "available" && username !== user.username && (
                  <p className="text-xs text-emerald-400">Username is available!</p>
                )}
              </div>
            </Field>
          </Section>

          {/* ── About ── */}
          <Section title="About">
            <Field label="Bio">
              <TextInput
                value={bio}
                onChange={(v) => { setBio(v); setSaveSuccess(false); }}
                placeholder="Tell the community about yourself…"
                textarea
              />
            </Field>

            <Field label="Location">
              <TextInput
                value={location}
                onChange={(v) => { setLocation(v); setSaveSuccess(false); }}
                placeholder="City, Country"
                icon={MapPin}
              />
            </Field>
          </Section>

          {/* ── Save feedback ── */}
          {saveError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{saveError}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-400">Profile saved successfully.</p>
            </div>
          )}

          {/* ── Save button ── */}
          <button
            type="submit"
            disabled={saving || availState === "taken" || !!usernameError}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-[#F59E0B] py-2.5 text-sm font-bold text-[#0A1C19] uppercase tracking-wider transition-all hover:bg-[#FBBF24] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>

        {/* ── Security section ── */}
        <div className="mt-5 rounded-xl border border-[#F7E7CE]/10 bg-[#0A1C19] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F7E7CE]/8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
              Security
            </h2>
          </div>
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="w-full flex items-center justify-between px-5 py-4 text-sm text-[#F7E7CE]/70 hover:bg-[#F7E7CE]/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-[#F7E7CE]/30" />
              <span>Change Password</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#F7E7CE]/25" />
          </button>
        </div>

        {/* ── Danger zone ── */}
        <div className="mt-5 rounded-xl border border-red-900/40 bg-red-950/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-red-900/30">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400">
              Danger Zone
            </h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-xs text-[#F7E7CE]/30 mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
