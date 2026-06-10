"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import {
  merchantService,
  type MerchantRecord,
  type MerchantDocument,
} from "@/services/merchantService";
import {
  getMerchantJourney,
  areRequiredDocsApproved,
  MERCHANT_DOC_TYPES,
  REQUIRED_DOC_KEYS,
} from "@/lib/merchantStages";
import {
  LogOut,
  LayoutGrid,
  Check,
  CheckCircle2,
  Loader2,
  Store,
  Pencil,
  X,
  LifeBuoy,
  FileText,
  AlertCircle,
  Clock,
  Upload,
  RotateCcw,
  Eye,
} from "lucide-react";

export default function MerchantDashboardPage() {
  const { logout } = useAuth();

  const [merchant, setMerchant] = useState<MerchantRecord | null>(null);
  const [documents, setDocuments] = useState<MerchantDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const m = await merchantService.getMyMerchant();
      setMerchant(m);
      if (m) {
        setDocuments(await merchantService.getMyDocuments(m.id));
        // Fire the welcome email now that the merchant has verified and landed
        // here. The endpoint is idempotent (sends once via welcome_sent_at).
        fetch("/api/merchant/welcome", { method: "POST" }).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reloadDocuments = useCallback(async () => {
    if (!merchant) return;
    setDocuments(await merchantService.getMyDocuments(merchant.id));
  }, [merchant]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#102C26]">
        <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  if (!merchant) return null; // layout guards this, but keep TS happy

  const docsApproved = areRequiredDocsApproved(documents);
  const journey = getMerchantJourney(merchant.status, docsApproved);

  return (
    <div className="min-h-screen bg-[#102C26]">
      {/* dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #F7E7CE 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">
        {/* ── Top nav (with Personal switcher) ── */}
        <nav className="border-b border-[#F7E7CE]/8 bg-[#0A1C19]/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="relative inline-flex w-6.5 h-6.5 shrink-0">
                <span className="absolute inset-0 bg-white/90 rounded-full" />
                <Image src="/logo/logo.png" alt="HalalMe" width={26} height={26} className="object-contain relative z-10" />
              </span>
              <span className="text-lg font-black text-[#F7E7CE] tracking-tight" style={{ fontFamily: "var(--font-logo)" }}>
                HalalMe
              </span>
              <span className="ml-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#F59E0B] border border-[#F59E0B]/30 px-1.5 py-0.5">
                Partner
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 text-[#F7E7CE]/45 hover:text-[#F7E7CE]/80 hover:bg-[#F7E7CE]/6 transition-colors text-xs font-bold uppercase tracking-wide"
                title="Switch to your personal account"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Personal</span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-2.5 text-[#F7E7CE]/40 hover:text-red-400 hover:bg-[#F7E7CE]/6 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-14">
          <div className="mx-auto max-w-4xl space-y-5 sm:space-y-8">

            {/* ── Header ── */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-[#F59E0B]" />
                <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">
                  Merchant Dashboard
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.95] text-[#F7E7CE] break-words">
                {merchant.name}
              </h1>
              <p className="mt-2 text-sm text-[#F7E7CE]/40">
                Track your onboarding and complete your verification below.
              </p>
            </div>

            {/* ── Status tracker ── */}
            <StatusTracker journey={journey} />

            {/* ── Documents ── */}
            <DocumentsSection documents={documents} onChange={reloadDocuments} />

            {/* ── Restaurant info ── */}
            <RestaurantInfo merchant={merchant} onSaved={setMerchant} />

            {/* ── Support ── */}
            <SupportCard merchant={merchant} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Status tracker ────────────────────────────────────────────────────────────

function StatusTracker({ journey }: { journey: ReturnType<typeof getMerchantJourney> }) {
  if (journey.isClosed) {
    return (
      <section className="bg-[#0A1C19] border border-red-500/20 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#F7E7CE]">Application closed</h2>
        </div>
        <p className="text-sm text-[#F7E7CE]/55 leading-relaxed">{journey.cta}</p>
      </section>
    );
  }

  const stages = journey.stages;

  return (
    <section className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-5 sm:p-6">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F7E7CE]/35 mb-5 sm:mb-6">
        Onboarding progress
      </h2>

      {/* ── Mobile: vertical timeline ── */}
      <div className="sm:hidden">
        {stages.map((stage, i) => {
          const last = i === stages.length - 1;
          return (
            <div key={stage.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    stage.done
                      ? "bg-[#F59E0B] border-[#F59E0B] text-[#102C26]"
                      : stage.current
                      ? "bg-[#102C26] border-[#F59E0B] ring-2 ring-[#F59E0B]/20"
                      : "bg-[#102C26] border-[#F7E7CE]/15"
                  }`}
                >
                  {stage.done
                    ? <Check className="w-3 h-3" />
                    : <span className={`w-1.5 h-1.5 rounded-full ${stage.current ? "bg-[#F59E0B]" : "bg-[#F7E7CE]/25"}`} />}
                </div>
                {!last && (
                  <div
                    className={`w-px flex-1 my-1 ${stage.done ? "bg-[#F59E0B]/40" : "bg-[#F7E7CE]/10"}`}
                    style={{ minHeight: 14 }}
                  />
                )}
              </div>
              <div className={`flex items-center gap-2 ${last ? "" : "pb-3"}`}>
                <span className={`text-sm font-bold ${stage.done || stage.current ? "text-[#F7E7CE]/85" : "text-[#F7E7CE]/30"}`}>
                  {stage.label}
                </span>
                {stage.current && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#F59E0B]">You are here</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: horizontal stepper ── */}
      <div className="hidden sm:flex items-center justify-between gap-1">
        {stages.map((stage, i) => (
          <div key={stage.key} className="flex-1 flex flex-col items-center text-center">
            <div className="flex items-center w-full">
              <div className={`h-px flex-1 ${i === 0 ? "opacity-0" : stage.done || stage.current ? "bg-[#F59E0B]/40" : "bg-[#F7E7CE]/10"}`} />
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                  stage.done
                    ? "bg-[#F59E0B] border-[#F59E0B] text-[#102C26]"
                    : stage.current
                    ? "bg-[#102C26] border-[#F59E0B] ring-2 ring-[#F59E0B]/20"
                    : "bg-[#102C26] border-[#F7E7CE]/15"
                }`}
              >
                {stage.done
                  ? <Check className="w-3.5 h-3.5" />
                  : <span className={`w-1.5 h-1.5 rounded-full ${stage.current ? "bg-[#F59E0B]" : "bg-[#F7E7CE]/25"}`} />}
              </div>
              <div className={`h-px flex-1 ${i === stages.length - 1 ? "opacity-0" : stage.done ? "bg-[#F59E0B]/40" : "bg-[#F7E7CE]/10"}`} />
            </div>
            <span className={`mt-2 text-[10px] font-bold uppercase tracking-wide ${
              stage.done || stage.current ? "text-[#F7E7CE]/80" : "text-[#F7E7CE]/30"
            }`}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      {/* current CTA */}
      <div className="mt-5 sm:mt-6 flex items-start gap-2.5 bg-[#F59E0B]/8 border border-[#F59E0B]/20 px-3.5 sm:px-4 py-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0 animate-pulse" />
        <p className="text-sm text-[#F7E7CE]/75 leading-relaxed">{journey.cta}</p>
      </div>
    </section>
  );
}

// ── Documents (upload + per-doc status) ───────────────────────────────────────

function DocStatusBadge({ status }: { status: MerchantDocument["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1">
        <AlertCircle className="w-3 h-3" /> Needs attention
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1">
      <Clock className="w-3 h-3" /> Under review
    </span>
  );
}

function DocumentsSection({
  documents,
  onChange,
}: {
  documents: MerchantDocument[];
  onChange: () => void | Promise<void>;
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<Record<string, string>>({});
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const byType = (key: string) => documents.find((d) => d.doc_type === key);
  const requiredApproved = REQUIRED_DOC_KEYS.filter((k) =>
    documents.some((d) => d.doc_type === k && d.status === "approved"),
  ).length;

  async function handleFile(docType: string, file: File | undefined) {
    if (!file) return;
    setUploadingKey(docType);
    setError(null);
    try {
      await merchantService.uploadDocument(file, docType, expiry[docType]);
      await onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function view(docId: string) {
    try {
      const url = await merchantService.getDocumentUrl(docId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Couldn't open the document. Please try again.");
    }
  }

  return (
    <section className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-5 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1 mb-1">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-[#F59E0B]" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#F7E7CE]">Verification documents</h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#F7E7CE]/40">
          {requiredApproved}/{REQUIRED_DOC_KEYS.length} required approved
        </span>
      </div>
      <p className="text-xs text-[#F7E7CE]/40 mb-3">
        Upload these so our team can verify your restaurant. PDF, JPG, PNG or WEBP · max 10 MB.
      </p>

      {/* progress */}
      <div className="h-1.5 bg-[#F7E7CE]/8 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
          style={{ width: `${(requiredApproved / REQUIRED_DOC_KEYS.length) * 100}%` }}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 mb-4">{error}</p>
      )}

      <div className="space-y-2">
        {MERCHANT_DOC_TYPES.map((doc) => {
          const existing = byType(doc.key);
          const isUploading = uploadingKey === doc.key;
          // Can replace until it's approved — so a wrong file can be swapped
          // while it's still uploaded / under review, not just after a rejection.
          const canReplace = !existing || existing.status !== "approved";

          return (
            <div key={doc.key} className="bg-[#102C26] border border-[#F7E7CE]/8 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#F7E7CE]/80 truncate">{doc.label}</p>
                    {doc.required
                      ? <span className="text-[9px] font-bold uppercase text-[#F59E0B]/80">Required</span>
                      : <span className="text-[9px] font-bold uppercase text-[#F7E7CE]/25">Optional</span>}
                  </div>
                  <p className="text-xs text-[#F7E7CE]/35 mt-0.5 truncate">{doc.hint}</p>
                  {existing?.file_name && (
                    <p className="text-[11px] text-[#F7E7CE]/45 mt-1 truncate">{existing.file_name}</p>
                  )}
                </div>
                {existing && <DocStatusBadge status={existing.status} />}
              </div>

              {/* rejection reason */}
              {existing?.status === "rejected" && existing.rejection_reason && (
                <p className="text-xs text-red-400/90 bg-red-500/5 border border-red-500/15 px-3 py-2 mt-2.5">
                  <strong>Reason:</strong> {existing.rejection_reason}
                </p>
              )}

              {/* optional expiry (only before upload, for certs that lapse) */}
              {doc.hasExpiry && canReplace && (
                <div className="mt-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/40 mb-1">
                    Expiry date (optional)
                  </label>
                  <input
                    type="date"
                    value={expiry[doc.key] ?? ""}
                    onChange={(e) => setExpiry((prev) => ({ ...prev, [doc.key]: e.target.value }))}
                    className="h-9 bg-[#0A1C19] border border-[#F7E7CE]/12 px-2.5 text-xs text-[#F7E7CE] focus:outline-none focus:border-[#F7E7CE]/40"
                  />
                </div>
              )}

              {/* actions */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  ref={(el) => { inputs.current[doc.key] = el; }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => { handleFile(doc.key, e.target.files?.[0]); e.target.value = ""; }}
                />
                {canReplace ? (
                  <button
                    onClick={() => inputs.current[doc.key]?.click()}
                    disabled={isUploading}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-9 px-3.5 bg-[#F7E7CE] text-[#102C26] text-xs font-extrabold uppercase tracking-tighter hover:bg-[#F7E7CE]/90 disabled:opacity-60 transition-colors"
                  >
                    {isUploading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                      : !existing
                      ? <><Upload className="w-3.5 h-3.5" /> Upload</>
                      : existing.status === "rejected"
                      ? <><RotateCcw className="w-3.5 h-3.5" /> Re-upload</>
                      : <><RotateCcw className="w-3.5 h-3.5" /> Replace file</>}
                  </button>
                ) : null}
                {existing && (
                  <button
                    onClick={() => view(existing.id)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-9 px-3.5 border border-[#F7E7CE]/15 text-[#F7E7CE]/60 text-xs font-bold uppercase tracking-wide hover:border-[#F7E7CE]/30 hover:text-[#F7E7CE]/85 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Restaurant info (read + inline contact edit) ──────────────────────────────

function RestaurantInfo({
  merchant,
  onSaved,
}: {
  merchant: MerchantRecord;
  onSaved: (m: MerchantRecord) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    phone: merchant.phone ?? "",
    address: merchant.address ?? "",
    city: merchant.city ?? "",
    post_code: merchant.post_code ?? "",
    business_email: merchant.business_email ?? "",
  });

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const updated = await merchantService.updateMyContactInfo(form);
      onSaved(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  const rows: { label: string; value: string | null }[] = [
    { label: "Restaurant", value: merchant.name },
    { label: "Owner", value: merchant.owner_name },
    { label: "Contact email", value: merchant.business_email ?? merchant.email },
    { label: "Phone", value: merchant.phone },
    { label: "Address", value: [merchant.address, merchant.city, merchant.post_code].filter(Boolean).join(", ") || null },
  ];

  return (
    <section className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Store className="w-4 h-4 text-[#F59E0B]" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#F7E7CE]">Restaurant details</h2>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#F7E7CE]/50 hover:text-[#F7E7CE]/80 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit contact
          </button>
        ) : (
          <button
            onClick={() => { setEditing(false); setError(null); }}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      {!editing ? (
        <div className="divide-y divide-[#F7E7CE]/6">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F7E7CE]/35 shrink-0">{r.label}</span>
              <span className="text-sm text-[#F7E7CE]/75 sm:text-right break-words">{r.value ?? "—"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <EditField label="Contact email" value={form.business_email} onChange={(v) => setForm((f) => ({ ...f, business_email: v }))} />
          <EditField label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <EditField label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <EditField label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
            <EditField label="Post code" value={form.post_code} onChange={(v) => setForm((f) => ({ ...f, post_code: v }))} />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="w-full h-11 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-xs flex items-center justify-center gap-2 hover:bg-[#F7E7CE]/90 disabled:opacity-60 transition-colors"
          >
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save changes</>}
          </button>
          <p className="text-[10px] text-[#F7E7CE]/25 text-center">
            Restaurant name and owner can only be changed by our team — contact support.
          </p>
        </div>
      )}
    </section>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F7E7CE]/50 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
      />
    </div>
  );
}

// ── Support ───────────────────────────────────────────────────────────────────

function SupportCard({ merchant }: { merchant: MerchantRecord }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!subject.trim() || !message.trim()) {
      setError("Please add a subject and a message.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await merchantService.sendSupport(subject, message);
      setSent(true);
      setSubject("");
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F7E7CE]/6 border border-[#F7E7CE]/12 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#F7E7CE]">Need help?</h2>
            <p className="text-xs text-[#F7E7CE]/40 mt-0.5">
              {merchant.assigned_rep
                ? `Your account manager is ${merchant.assigned_rep}.`
                : "Our partnerships team is here to help."}
            </p>
          </div>
        </div>
        {!open && (
          <button
            onClick={() => { setOpen(true); setSent(false); }}
            className="w-full sm:w-auto shrink-0 h-10 px-5 border border-[#F7E7CE]/15 text-xs font-bold text-[#F7E7CE]/60 uppercase tracking-wide hover:border-[#F7E7CE]/30 hover:text-[#F7E7CE]/85 transition-colors flex items-center justify-center"
          >
            Contact Support
          </button>
        )}
      </div>

      {sent && (
        <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">Message sent — we&apos;ll get back to you by email.</p>
        </div>
      )}

      {open && !sent && (
        <div className="mt-5 space-y-3">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full h-11 bg-[#102C26] border border-[#F7E7CE]/12 px-3 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            rows={4}
            className="w-full bg-[#102C26] border border-[#F7E7CE]/12 px-3 py-2.5 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors resize-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={send}
              disabled={sending}
              className="h-10 px-5 bg-[#F7E7CE] text-[#102C26] text-xs font-extrabold uppercase tracking-tighter hover:bg-[#F7E7CE]/90 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {sending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</> : <><Check className="w-3.5 h-3.5" /> Send message</>}
            </button>
            <button
              onClick={() => { setOpen(false); setError(null); }}
              className="h-10 px-4 text-xs font-bold uppercase tracking-wide text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
