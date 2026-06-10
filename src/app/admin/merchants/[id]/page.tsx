"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { display } from "../../_fonts";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  Lock,
  Save,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Tag,
  Zap,
  Calendar,
  Rocket,
  Loader2,
  RotateCcw,
  Ban,
  Coins,
  ListChecks,
  Link2,
  ChevronDown,
  Copy,
  MoreHorizontal,
  User as UserIcon,
  Pencil,
  Power,
  Trash2,
  FileText,
  Eye,
} from "lucide-react";
import { MERCHANT_DOC_TYPES, REQUIRED_DOC_KEYS } from "@/lib/merchantStages";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReadinessChecklist {
  invite_accepted: boolean;
  commission_agreed: boolean;
  notes_completed: boolean;
  onboarding_verified: boolean;
}

interface Merchant {
  id: string;
  name: string;
  owner_name: string | null;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  post_code: string | null;
  country: string;
  website: string | null;
  status: string;
  assigned_rep: string | null;
  commission_percentage: number | null;
  notes: string | null;
  readiness_checklist: ReadinessChecklist | null;
  source_attribution: string | null;
  hyperzod_merchant_id: string | null;
  hyperzod_sync_failed: boolean;
  created_at: string;
  invited_at: string | null;
  contacted_at: string | null;
  activated_at: string | null;
}

interface AdminDocument {
  id: string;
  doc_type: string;
  status: "uploaded" | "under_review" | "approved" | "rejected";
  rejection_reason: string | null;
  expires_at: string | null;
  file_name: string | null;
  uploaded_at: string;
  url: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// The linear journey (excludes "live" — gated final step — and "rejected" — side branch)
const STAGES: {
  key: string;
  label: string;
  desc: string;
  tsField: "created_at" | "invited_at" | "contacted_at" | null;
  action: string;
}[] = [
  { key: "pending",     label: "Registered",  desc: "Application received",                tsField: "created_at",   action: "" },
  { key: "invited",     label: "Invited",     desc: "Dashboard invite sent to merchant",   tsField: "invited_at",   action: "Mark as Invited" },
  { key: "contacted",   label: "Contacted",   desc: "Agent has spoken to the merchant",    tsField: "contacted_at", action: "Mark as Contacted" },
  { key: "negotiating", label: "Negotiating", desc: "Commission discussion underway",      tsField: null,           action: "Start Negotiating" },
  { key: "agreed",      label: "Agreed",      desc: "Commission agreed — ready to verify", tsField: null,           action: "Mark as Agreed" },
];

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending:     { label: "Pending",     dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-700" },
  invited:     { label: "Invited",     dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700" },
  contacted:   { label: "Contacted",   dot: "bg-amber-500",  badge: "bg-amber-50 text-amber-700" },
  negotiating: { label: "Negotiating", dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700" },
  agreed:      { label: "Agreed",      dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700" },
  live:        { label: "Live",        dot: "bg-green-500",  badge: "bg-green-50 text-green-700" },
  rejected:    { label: "Rejected",    dot: "bg-red-500",    badge: "bg-red-50 text-red-700" },
};

const CHECKLIST_ITEMS: { key: keyof ReadinessChecklist; label: string; hint: string }[] = [
  { key: "invite_accepted",    label: "Invite accepted",       hint: "Merchant has accepted the Hyperzod dashboard invite" },
  { key: "commission_agreed",  label: "Commission agreed",     hint: "Commission % confirmed and saved below" },
  { key: "notes_completed",    label: "Call notes done",       hint: "Agent has logged call notes" },
  { key: "onboarding_verified",label: "Onboarding verified",   hint: "Agent has reviewed and approved the merchant setup" },
];

const DEFAULT_CHECKLIST: ReadinessChecklist = {
  invite_accepted: false,
  commission_agreed: false,
  notes_completed: false,
  onboarding_verified: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DocBadge({ status }: { status: AdminDocument["status"] }) {
  const cfg =
    status === "approved"
      ? { label: "Approved", cls: "bg-green-50 text-green-700" }
      : status === "rejected"
      ? { label: "Rejected", cls: "bg-red-50 text-red-700" }
      : { label: "Under review", cls: "bg-amber-50 text-amber-700" };
  return (
    <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function Card({
  title,
  subtitle,
  action,
  accent,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  accent?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-none border ${accent ? "border-[#102C26]/12 border-l-4 border-l-[#102C26]" : "border-[#102C26]/12"} ${className}`}>
      {title && (
        <div className="px-4 sm:px-6 py-4 border-b border-[#102C26]/8 flex items-start justify-between gap-3">
          <div>
            <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26]`}>{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[#102C26]/8 last:border-0">
      <div className="w-8 h-8 rounded-none bg-gray-50 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <div className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>
          {value ?? <span className="text-gray-400 italic">Not provided</span>}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
      {children}
    </label>
  );
}

const inputCls =
  "w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-none px-3.5 py-2.5 " +
  "focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 focus:border-[#102C26] " +
  "placeholder:text-gray-400 transition-colors";


// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border-b border-[#102C26]/12 px-8 py-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-28" />
          <div className="h-6 bg-gray-200 rounded w-56" />
        </div>
        <div className="h-9 bg-gray-200 rounded-none w-32" />
      </div>
      <div className="grid grid-cols-4 gap-4 px-8 py-5 bg-gray-50 border-b border-[#102C26]/12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-none border border-[#102C26]/12 h-20" />
        ))}
      </div>
      <div className="p-8 grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-5">
          <div className="h-64 bg-gray-100 rounded-none" />
          <div className="h-48 bg-gray-100 rounded-none" />
        </div>
        <div className="col-span-2 space-y-5">
          <div className="h-52 bg-gray-100 rounded-none" />
          <div className="h-48 bg-gray-100 rounded-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Details form (rep + commission)
  const [assignedRep, setAssignedRep] = useState("");
  const [commission, setCommission] = useState("");
  // Checklist (optimistic, persisted immediately on toggle)
  const [checklist, setChecklist] = useState<ReadinessChecklist>(DEFAULT_CHECKLIST);

  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"idle" | "success" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Journey
  const [transitioning, setTransitioning] = useState(false);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Header actions menu
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Edit merchant info
  const [showEdit, setShowEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", owner_name: "", email: "", phone: "",
    address: "", city: "", post_code: "", country: "",
    website: "", source_attribution: "",
  });

  // Publish
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Documents
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error();
      const { merchant: m } = await res.json() as { merchant: Merchant };
      setMerchant(m);
      setAssignedRep(m.assigned_rep ?? "");
      setCommission(m.commission_percentage?.toString() ?? "");
      setChecklist(m.readiness_checklist ?? DEFAULT_CHECKLIST);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/merchants/${id}/documents`);
      if (!res.ok) return;
      const { documents: docs } = await res.json() as { documents: AdminDocument[] };
      setDocuments(docs);
    } catch {
      // non-fatal — the rest of the page still works
    }
  }, [id]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  async function reviewDocument(docId: string, action: "approve" | "reject", reason?: string) {
    setReviewingId(docId);
    try {
      const res = await fetch(`/api/admin/merchants/${id}/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        alert(json.error ?? "Couldn't update the document. Please try again.");
        return;
      }
      setRejectingId(null);
      setRejectReason("");
      await loadDocuments();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setReviewingId(null);
    }
  }

  // Save the Details card (rep + commission only)
  async function handleSaveDetails() {
    setSaving(true);
    setSaveResult("idle");
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_rep: assignedRep || null,
          commission_percentage: commission !== "" ? parseFloat(commission) : null,
        }),
      });
      if (!res.ok) throw new Error();
      const { merchant: m } = await res.json() as { merchant: Merchant };
      setMerchant(m);
      setSaveResult("success");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveResult("idle"), 2500);
    } catch {
      setSaveResult("error");
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {});
    setShowActions(false);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { message?: string };
        setDeleteError(json.message ?? "Could not delete this merchant. Please try again.");
        return;
      }
      // Gone — back to the list
      router.replace("/admin/merchants");
    } catch {
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  function openEdit() {
    if (!merchant) return;
    setEditError(null);
    setEditForm({
      name: merchant.name ?? "",
      owner_name: merchant.owner_name ?? "",
      email: merchant.email ?? "",
      phone: merchant.phone ?? "",
      address: merchant.address ?? "",
      city: merchant.city ?? "",
      post_code: merchant.post_code ?? "",
      country: merchant.country ?? "",
      website: merchant.website ?? "",
      source_attribution: merchant.source_attribution ?? "",
    });
    setShowEdit(true);
  }

  async function handleSaveEdit() {
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.phone.trim()) {
      setEditError("Name, email and phone are required.");
      return;
    }
    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/merchants/${id}/info`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json() as { merchant?: Merchant; warning?: string | null; error?: string };
      if (!res.ok) {
        setEditError(json.error ?? "Could not save changes. Please try again.");
        return;
      }
      if (json.merchant) setMerchant(json.merchant);
      if (json.warning) {
        // Saved locally but Hyperzod sync failed — surface, keep modal closable
        alert(json.warning);
      }
      setShowEdit(false);
    } catch {
      setEditError("Something went wrong. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  }

  // Move the merchant to a new pipeline stage (immediate persist)
  async function changeStatus(newStatus: string) {
    setTransitioning(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const { merchant: m } = await res.json() as { merchant: Merchant };
      setMerchant(m);
      setConfirmingReject(false);
    } catch {
      alert("Couldn't update the stage. Please try again.");
    } finally {
      setTransitioning(false);
    }
  }

  // Deactivate a live merchant (Hyperzod 1 → 0, status back to "agreed")
  async function handleDeactivate() {
    setDeactivating(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}/deactivate`, { method: "POST" });
      const json = await res.json() as { merchant?: Merchant; message?: string };
      if (!res.ok) {
        alert(json.message ?? "Couldn't deactivate. Please try again.");
        return;
      }
      if (json.merchant) setMerchant(json.merchant);
      setConfirmingDeactivate(false);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeactivating(false);
    }
  }

  // Toggle a checklist item (optimistic + immediate persist)
  async function toggleCheck(key: keyof ReadinessChecklist) {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next); // optimistic
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readiness_checklist: next }),
      });
      if (!res.ok) throw new Error();
      const { merchant: m } = await res.json() as { merchant: Merchant };
      setMerchant(m);
    } catch {
      setChecklist(checklist); // revert on failure
      alert("Couldn't save that change. Please try again.");
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });
      if (!res.ok) throw new Error();
      const { merchant: m } = await res.json() as { merchant: Merchant };
      setMerchant(m);
      setNote("");
    } catch {
      alert("Failed to save note — please try again.");
    } finally {
      setAddingNote(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch(`/api/admin/merchants/${id}/publish`, {
        method: "POST",
      });
      const json = await res.json() as { merchant?: Merchant; error?: string; message?: string };
      if (!res.ok) {
        setPublishError(
          json.message
            ?? (json.error === "checklist_incomplete"
              ? "Complete all checklist items before publishing."
              : "Could not publish this merchant. Please try again.")
        );
        return;
      }
      if (json.merchant) {
        setMerchant(json.merchant);
      }
      setShowPublishConfirm(false);
    } catch {
      setPublishError("Something went wrong. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  const checklistDone = Object.values(checklist).filter(Boolean).length;
  const checklistComplete = checklistDone === 4;

  // ── Render: loading / not found ────────────────────────────────────────────

  if (loading) return <Skeleton />;

  if (notFound || !merchant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center py-24">
        <div className="w-12 h-12 bg-gray-100 rounded-none flex items-center justify-center mb-4">
          <AlertTriangle size={20} className="text-gray-400" />
        </div>
        <p className="text-base font-semibold text-gray-700">Merchant not found</p>
        <p className="text-sm text-gray-400 mt-1">This record may have been deleted.</p>
        <button
          onClick={() => router.push("/admin/merchants")}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#102C26] font-medium hover:underline"
        >
          <ArrowLeft size={14} /> Back to Merchants
        </button>
      </div>
    );
  }

  // ── Render: main ───────────────────────────────────────────────────────────

  const address = [merchant.address, merchant.city, merchant.post_code]
    .filter(Boolean)
    .join(", ");

  // Journey derived state
  const isLive = merchant.status === "live";
  const isRejected = merchant.status === "rejected";
  const currentIndex = STAGES.findIndex((s) => s.key === merchant.status);

  const requiredDocsApproved = REQUIRED_DOC_KEYS.every((k) =>
    documents.some((d) => d.doc_type === k && d.status === "approved"),
  );
  const approvedRequiredCount = REQUIRED_DOC_KEYS.filter((k) =>
    documents.some((d) => d.doc_type === k && d.status === "approved"),
  ).length;

  return (
    <div className="bg-[#F3E9D6] min-h-full">

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-3 sm:py-4 sticky top-14 md:top-0 z-20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => router.push("/admin/merchants")}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0 font-medium"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Merchants</span>
            </button>
            <span className="text-gray-200 text-lg hidden sm:inline">/</span>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <h1 className={`${display.className} text-base sm:text-lg font-extrabold uppercase tracking-tighter text-[#102C26] truncate`}>{merchant.name}</h1>
              <StatusBadge status={merchant.status} />
            </div>
          </div>

          {/* Actions */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowActions((v) => !v)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#102C26] text-[#F7E7CE] rounded-none text-xs font-extrabold uppercase tracking-tighter hover:bg-[#102C26]/90 transition-colors"
            >
              <MoreHorizontal size={15} className="sm:hidden" />
              <span className="hidden sm:inline">Actions</span>
              <ChevronDown size={14} className={`hidden sm:block transition-transform ${showActions ? "rotate-180" : ""}`} />
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-none shadow-xl border border-[#102C26]/12 py-1.5 z-40">
                  <button
                    onClick={() => copyToClipboard(merchant.email, "email")}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={14} className="text-gray-400" />
                    {copied === "email" ? "Copied!" : "Copy email"}
                  </button>
                  {merchant.hyperzod_merchant_id && (
                    <button
                      onClick={() => copyToClipboard(merchant.hyperzod_merchant_id!, "id")}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Copy size={14} className="text-gray-400" />
                      {copied === "id" ? "Copied!" : "Copy Hyperzod ID"}
                    </button>
                  )}
                  {merchant.status !== "rejected" && merchant.status !== "live" && (
                    <button
                      onClick={() => { setShowActions(false); changeStatus("rejected"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Ban size={14} className="text-gray-400" />
                      Reject merchant
                    </button>
                  )}
                  <div className="my-1 border-t border-[#102C26]/12" />
                  <button
                    onClick={() => { setShowActions(false); setDeleteError(null); setDeleteConfirmText(""); setShowDelete(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete merchant
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick stats strip ── */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-3 sm:py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {/* Days registered */}
          {(() => {
            const days = daysSince(merchant.created_at);
            const urgent = days > 2 && merchant.status === "pending";
            return (
              <div className={`rounded-none border p-4 ${urgent ? "bg-amber-50/60 border-amber-200" : "bg-white border-[#102C26]/12"}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Days registered</p>
                    <p className={`${display.className} text-2xl font-bold mt-1 ${urgent ? "text-amber-700" : "text-[#102C26]"}`}>{days}d</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{fmtDate(merchant.created_at)}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${urgent ? "bg-amber-100" : "bg-green-50"}`}>
                    <Calendar size={18} className={urgent ? "text-amber-600" : "text-green-600"} />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Commission */}
          <div className={`rounded-none border p-4 ${merchant.commission_percentage == null ? "bg-amber-50/60 border-amber-200" : "bg-white border-[#102C26]/12"}`}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Commission</p>
                <p className={`${display.className} text-2xl font-bold text-[#102C26] mt-1`}>
                  {merchant.commission_percentage != null ? `${merchant.commission_percentage}%` : "Not set"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">of order value</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="w-10 h-10 rounded-none bg-orange-50 flex items-center justify-center">
                  <Coins size={18} className="text-orange-500" />
                </div>
                {merchant.commission_percentage == null && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Action needed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-none border border-[#102C26]/12 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Checklist</p>
                <p className={`${display.className} text-2xl font-bold text-[#102C26] mt-1`}>{checklistDone}/4</p>
                <p className="text-xs text-gray-400 mt-0.5">{checklistComplete ? "Ready to publish" : "Items completed"}</p>
              </div>
              <div className="w-10 h-10 rounded-none bg-purple-50 flex items-center justify-center shrink-0">
                <ListChecks size={18} className="text-purple-500" />
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(checklistDone / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Hyperzod */}
          <div className={`rounded-none border p-4 ${merchant.hyperzod_sync_failed ? "bg-amber-50/60 border-amber-200" : "bg-white border-[#102C26]/12"}`}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Hyperzod</p>
                <p className={`${display.className} text-xl font-bold text-[#102C26] mt-1 flex items-center gap-1.5`}>
                  {merchant.hyperzod_merchant_id ? "Synced" : merchant.hyperzod_sync_failed ? "Failed" : "Pending"}
                  {merchant.hyperzod_merchant_id && <CheckCircle2 size={15} className="text-green-500" />}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate font-mono">
                  {merchant.hyperzod_merchant_id ? merchant.hyperzod_merchant_id.slice(0, 14) + "…" : "Not yet synced"}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${merchant.hyperzod_sync_failed ? "bg-amber-100" : "bg-green-50"}`}>
                <Link2 size={18} className={merchant.hyperzod_sync_failed ? "text-amber-600" : "text-green-600"} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-start">

        {/* ── Left column ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Merchant info */}
          <Card
            title="Merchant Information"
            subtitle="Contact and location details"
            action={
              <button
                onClick={openEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-none hover:bg-gray-50 transition-colors"
              >
                <Pencil size={13} /> Edit
              </button>
            }
          >
            <InfoItem icon={Building2} label="Restaurant name" value={merchant.name} />
            <InfoItem icon={Mail} label="Email address" value={merchant.email} />
            <InfoItem icon={Phone} label="Phone number" value={merchant.phone} />
            {address && (
              <InfoItem icon={MapPin} label="Address" value={address} />
            )}
            <InfoItem icon={Globe} label="Country" value={merchant.country} />
            {merchant.website && (
              <InfoItem
                icon={Globe}
                label="Website"
                value={
                  <a
                    href={merchant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#102C26] hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    {merchant.website}
                    <ExternalLink size={11} />
                  </a>
                }
              />
            )}
            <InfoItem
              icon={Tag}
              label="Lead source"
              value={merchant.source_attribution
                ? merchant.source_attribution.charAt(0).toUpperCase() + merchant.source_attribution.slice(1)
                : null}
            />
            <InfoItem
              icon={Zap}
              label="Hyperzod ID"
              value={
                merchant.hyperzod_merchant_id ? (
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {merchant.hyperzod_merchant_id}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-xs">
                    <AlertTriangle size={11} />
                    {merchant.hyperzod_sync_failed ? "Sync failed" : "Not synced yet"}
                  </span>
                )
              }
            />
            <InfoItem
              icon={Calendar}
              label="Registered"
              value={fmt(merchant.created_at)}
            />
          </Card>

          {/* Verification documents */}
          <Card
            title="Verification Documents"
            subtitle="Review and approve before inviting"
            action={
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                requiredDocsApproved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}>
                {approvedRequiredCount}/{REQUIRED_DOC_KEYS.length} required
              </span>
            }
          >
            <div className="space-y-2">
              {MERCHANT_DOC_TYPES.map((dt) => {
                const doc = documents.find((d) => d.doc_type === dt.key);
                return (
                  <div key={dt.key} className="rounded-none border border-[#102C26]/12 bg-gray-50/50 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-gray-400 shrink-0" />
                          <p className="text-sm font-semibold text-gray-800 truncate">{dt.label}</p>
                          {dt.required
                            ? <span className="text-[10px] font-bold uppercase text-amber-600">Required</span>
                            : <span className="text-[10px] font-bold uppercase text-gray-400">Optional</span>}
                        </div>
                        {doc?.file_name && <p className="text-xs text-gray-400 mt-1 truncate pl-6">{doc.file_name}</p>}
                        {doc?.expires_at && <p className="text-xs text-gray-400 mt-0.5 pl-6">Expires {fmtDate(doc.expires_at)}</p>}
                        {doc?.status === "rejected" && doc.rejection_reason && (
                          <p className="text-xs text-red-600 mt-1.5 pl-6">Rejected: {doc.rejection_reason}</p>
                        )}
                      </div>
                      {doc ? (
                        <DocBadge status={doc.status} />
                      ) : (
                        <span className="text-xs text-gray-400 italic shrink-0">Not uploaded</span>
                      )}
                    </div>

                    {doc && (
                      <>
                        {rejectingId === doc.id ? (
                          <div className="mt-3 pl-6">
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Tell the merchant what needs fixing…"
                              rows={2}
                              className={`${inputCls} resize-none`}
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => reviewDocument(doc.id, "reject", rejectReason)}
                                disabled={!rejectReason.trim() || reviewingId === doc.id}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-none px-3 py-1.5 disabled:opacity-50"
                              >
                                {reviewingId === doc.id ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                                Confirm reject
                              </button>
                              <button
                                onClick={() => { setRejectingId(null); setRejectReason(""); }}
                                className="text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1.5"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 mt-3 pl-6">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#102C26] border border-gray-200 rounded-none px-3 py-1.5 hover:bg-gray-50"
                            >
                              <Eye size={13} /> View
                            </a>
                            {doc.status !== "approved" && (
                              <button
                                onClick={() => reviewDocument(doc.id, "approve")}
                                disabled={reviewingId === doc.id}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-none px-3 py-1.5 disabled:opacity-50"
                              >
                                {reviewingId === doc.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                                Approve
                              </button>
                            )}
                            {doc.status !== "rejected" && (
                              <button
                                onClick={() => { setRejectingId(doc.id); setRejectReason(""); }}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-none px-3 py-1.5 hover:bg-red-50"
                              >
                                <Ban size={13} /> Reject
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Notes */}
          <Card
            title="Notes"
            subtitle="Internal notes and call logs"
            action={
              <button
                onClick={handleAddNote}
                disabled={!note.trim() || addingNote}
                className="px-4 py-2 bg-[#102C26] text-[#F7E7CE] rounded-none text-sm font-semibold
                           hover:bg-[#102C26]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {addingNote ? "Adding…" : "Add Note"}
              </button>
            }
          >
            {merchant.notes ? (
              <div className="mb-5 rounded-none bg-gray-50 border border-[#102C26]/12 p-4">
                {merchant.notes.split("\n").map((line, i) => {
                  const timestampMatch = line.match(/^\[(.+?)\]\s(.+)$/);
                  if (timestampMatch) {
                    return (
                      <div key={i} className="mb-3 last:mb-0">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                          {timestampMatch[1]}
                        </p>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {timestampMatch[2]}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <p key={i} className="text-sm text-gray-800 mb-2 leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="mb-5 rounded-none bg-gray-50 border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-400">No notes yet — add the first one below.</p>
              </div>
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Called owner, agreed 15% commission — sending contract Friday."
              rows={3}
              className={`${inputCls} resize-none leading-relaxed`}
            />
            <p className="text-xs text-gray-400 mt-2">Timestamp is added automatically.</p>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Details: rep + commission */}
          <Card title="Details" subtitle="Sales rep and agreed commission" accent>
            <div className="space-y-4">
              <div>
                <FieldLabel>Assigned Rep</FieldLabel>
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={assignedRep}
                    onChange={(e) => setAssignedRep(e.target.value)}
                    placeholder="Select or search rep"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Commission %</FieldLabel>
                <div className="flex items-stretch border border-gray-300 rounded-none overflow-hidden focus-within:ring-2 focus-within:ring-[#102C26]/20 focus-within:border-[#102C26] transition-all bg-white">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    placeholder="0"
                    className="flex-1 text-sm text-gray-900 bg-transparent px-3.5 py-2.5 focus:outline-none placeholder:text-gray-400"
                  />
                  <div className="flex items-center px-3.5 bg-gray-50 border-l border-gray-200">
                    <span className="text-sm font-semibold text-gray-500">%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveDetails}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-none text-sm font-semibold transition-all ${
                  saveResult === "success"
                    ? "bg-green-600 text-white"
                    : saveResult === "error"
                    ? "bg-red-600 text-white"
                    : "bg-[#102C26] text-[#F7E7CE] hover:bg-[#102C26]/90 disabled:opacity-50"
                }`}
              >
                {saveResult === "success"
                  ? <><Check size={14} /> Saved</>
                  : saveResult === "error"
                  ? <><AlertTriangle size={14} /> Failed — retry</>
                  : <><Save size={14} /> {saving ? "Saving…" : "Save Details"}</>
                }
              </button>
            </div>
          </Card>

          {/* Merchant Journey */}
          <Card
            title="Merchant Journey"
            subtitle={isLive ? "Live on HalalMe" : isRejected ? "Rejected" : "Move the merchant through onboarding"}
          >
            {isRejected ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-none bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <Ban size={20} className="text-red-500" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Merchant rejected</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Onboarding was stopped for this merchant.</p>
                <button
                  onClick={() => changeStatus("pending")}
                  disabled={transitioning}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-none text-sm font-semibold text-[#102C26] border border-[#102C26]/20 hover:bg-[#102C26]/5 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={14} /> Reopen onboarding
                </button>
              </div>
            ) : (
              <>
                {/* Stepper */}
                <div>
                  {STAGES.map((stage, i) => {
                    const done = isLive || i < currentIndex;
                    const current = !isLive && i === currentIndex;
                    const ts = stage.tsField ? merchant[stage.tsField] : null;
                    const next = STAGES[i + 1];

                    return (
                      <div key={stage.key} className="flex gap-3">
                        {/* Track */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                            done    ? "bg-[#102C26] border-[#102C26] text-white"
                            : current ? "bg-white border-[#102C26] ring-2 ring-[#102C26]/15"
                            : "bg-white border-gray-200"
                          }`}>
                            {done
                              ? <Check size={13} />
                              : <span className={`w-1.5 h-1.5 rounded-full ${current ? "bg-[#102C26]" : "bg-gray-300"}`} />
                            }
                          </div>
                          <div className={`w-px flex-1 my-1 ${done ? "bg-[#102C26]/20" : "bg-gray-100"}`} style={{ minHeight: 20 }} />
                        </div>

                        {/* Content */}
                        <div className="pb-5 flex-1 min-w-0 pt-0.5">
                          <p className={`text-sm font-semibold ${done || current ? "text-gray-900" : "text-gray-400"}`}>
                            {stage.label}
                          </p>
                          {ts
                            ? <p className="text-xs text-gray-400 mt-0.5">{fmt(ts)}</p>
                            : done && <p className="text-xs text-gray-400 mt-0.5">Completed</p>
                          }

                          {/* Current-stage actions */}
                          {current && (
                            <div className="mt-2.5">
                              <p className="text-xs text-gray-500 mb-2.5 leading-relaxed">{stage.desc}</p>
                              {next?.key === "invited" && !requiredDocsApproved && (
                                <div className="flex items-start gap-2 rounded-none bg-amber-50 border border-amber-200 px-3 py-2 mb-2.5">
                                  <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
                                  <p className="text-xs text-amber-800 leading-relaxed">
                                    Not all required documents are approved yet. You can still invite, but verify first where possible.
                                  </p>
                                </div>
                              )}
                              {next ? (
                                <button
                                  onClick={() => changeStatus(next.key)}
                                  disabled={transitioning}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-none text-sm font-semibold bg-[#102C26] text-[#F7E7CE] hover:bg-[#102C26]/90 transition-colors disabled:opacity-50"
                                >
                                  {transitioning
                                    ? <><Loader2 size={13} className="animate-spin" /> Updating…</>
                                    : <>{next.action} <ArrowRight size={13} /></>
                                  }
                                </button>
                              ) : (
                                <p className="text-xs text-green-700 bg-green-50 rounded-none px-3 py-2 font-medium">
                                  ✓ Ready — complete the checklist below to go live.
                                </p>
                              )}
                              {i > 0 && (
                                <button
                                  onClick={() => changeStatus(STAGES[i - 1].key)}
                                  disabled={transitioning}
                                  className="ml-3 text-xs text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
                                >
                                  ← Move back
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* ── Go Live (gated final stage) ── */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        isLive ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-300"
                      }`}>
                        {isLive ? <Check size={13} /> : <Lock size={12} />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className={`text-sm font-semibold ${isLive ? "text-gray-900" : "text-gray-700"}`}>
                        Go Live
                      </p>

                      {isLive ? (
                        <>
                          {merchant.activated_at && (
                            <p className="text-xs text-gray-400 mt-0.5">{fmt(merchant.activated_at)}</p>
                          )}
                          <div className="mt-2.5 flex items-center gap-2 rounded-none bg-green-50 border border-green-200 px-3 py-2.5 text-sm font-semibold text-green-700">
                            <CheckCircle2 size={15} /> Published &amp; Live on HalalMe
                          </div>

                          {/* Deactivate */}
                          <div className="mt-3">
                            {confirmingDeactivate ? (
                              <div className="rounded-none bg-amber-50 border border-amber-200 px-3 py-3">
                                <p className="text-xs text-amber-800 font-medium mb-2.5">
                                  Take this merchant offline? They&apos;ll be hidden from customers on Hyperzod and HalalMe.
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleDeactivate}
                                    disabled={deactivating}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-none px-3 py-1.5 disabled:opacity-50"
                                  >
                                    {deactivating ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
                                    Yes, deactivate
                                  </button>
                                  <button
                                    onClick={() => setConfirmingDeactivate(false)}
                                    disabled={deactivating}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1.5"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmingDeactivate(true)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-amber-700 transition-colors"
                              >
                                <Power size={13} /> Deactivate &amp; take offline
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="mt-2.5">
                          <p className="text-xs text-gray-500 mb-3">
                            Complete all checks to activate the merchant on Hyperzod and publish.
                          </p>

                          {/* Checklist */}
                          <div className="space-y-1.5">
                            {CHECKLIST_ITEMS.map(({ key, label, hint }) => {
                              const checked = checklist[key];
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  title={hint}
                                  onClick={() => toggleCheck(key)}
                                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-none text-left transition-colors ${
                                    checked ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-transparent hover:border-gray-200"
                                  }`}
                                >
                                  {checked
                                    ? <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                                    : <Circle size={16} className="text-gray-300 shrink-0" />
                                  }
                                  <span className={`text-sm font-medium ${checked ? "text-green-800" : "text-gray-700"}`}>
                                    {label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Progress */}
                          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-500"
                              style={{ width: `${(checklistDone / 4) * 100}%` }}
                            />
                          </div>

                          {/* Publish */}
                          <button
                            onClick={() => { setPublishError(null); setShowPublishConfirm(true); }}
                            disabled={!checklistComplete}
                            className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-none text-sm font-semibold transition-all ${
                              checklistComplete
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {checklistComplete
                              ? <><Rocket size={15} /> Approve &amp; Publish</>
                              : <><Lock size={13} /> Approve &amp; Publish ({checklistDone}/4)</>
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reject action */}
                {!isLive && (
                  <div className="mt-2 pt-4 border-t border-[#102C26]/8">
                    {confirmingReject ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">Reject this merchant?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmingReject(false)}
                            disabled={transitioning}
                            className="text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => changeStatus("rejected")}
                            disabled={transitioning}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-none px-3 py-1.5 disabled:opacity-50"
                          >
                            {transitioning ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                            Yes, reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingReject(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Ban size={13} /> Reject merchant
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>

        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => !deleting && setShowDelete(false)}
        >
          <div
            className="bg-white rounded-none shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-white/15 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Delete Merchant</h3>
                <p className="text-white/70 text-xs mt-0.5">This cannot be undone</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                This permanently deletes <strong>{merchant.name}</strong> from{" "}
                <strong>both HalalMe and Hyperzod</strong>. All notes, history, and onboarding
                progress will be lost.
              </p>

              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-1.5">
                  Type <span className="font-mono font-bold text-gray-700">{merchant.name}</span> to confirm
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={merchant.name}
                  className={inputCls}
                />
              </div>

              {deleteError && (
                <div className="mt-4 flex items-start gap-2 rounded-none bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-[#102C26]/12 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || deleteConfirmText.trim() !== merchant.name}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-none text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting
                  ? <><Loader2 size={14} className="animate-spin" /> Deleting…</>
                  : <><Trash2 size={14} /> Delete permanently</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit merchant info modal ── */}
      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => !savingEdit && setShowEdit(false)}
        >
          <div
            className="bg-white rounded-none shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#102C26] px-6 py-5 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-none bg-white/15 flex items-center justify-center shrink-0">
                <Pencil size={17} className="text-[#F7E7CE]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Edit Merchant</h3>
                <p className="text-white/60 text-xs mt-0.5">Changes sync to Hyperzod automatically</p>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 py-5 overflow-y-auto space-y-4">
              <div>
                <FieldLabel>Restaurant name *</FieldLabel>
                <input className={inputCls} value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Owner name</FieldLabel>
                <input className={inputCls} value={editForm.owner_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, owner_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Email *</FieldLabel>
                  <input type="email" className={inputCls} value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>Phone *</FieldLabel>
                  <input className={inputCls} value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <FieldLabel>Address</FieldLabel>
                <input className={inputCls} value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FieldLabel>City</FieldLabel>
                  <input className={inputCls} value={editForm.city}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>Postcode</FieldLabel>
                  <input className={inputCls} value={editForm.post_code}
                    onChange={(e) => setEditForm((f) => ({ ...f, post_code: e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <input className={inputCls} value={editForm.country}
                    onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Website</FieldLabel>
                  <input className={inputCls} value={editForm.website}
                    onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>Lead source</FieldLabel>
                  <input className={inputCls} value={editForm.source_attribution}
                    onChange={(e) => setEditForm((f) => ({ ...f, source_attribution: e.target.value }))} />
                </div>
              </div>
              <p className="text-xs text-gray-400 pt-1">
                Name, email, phone &amp; address changes are synced to the merchant&apos;s Hyperzod profile.
              </p>
            </div>

            {/* Error */}
            {editError && (
              <div className="px-6 pb-2 shrink-0">
                <div className="flex items-start gap-2 rounded-none bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{editError}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[#102C26]/12 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowEdit(false)}
                disabled={savingEdit}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#102C26] text-[#F7E7CE] rounded-none text-sm font-semibold hover:bg-[#102C26]/90 transition-colors disabled:opacity-60"
              >
                {savingEdit
                  ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : <><Check size={14} /> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Publish confirmation modal ── */}
      {showPublishConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => !publishing && setShowPublishConfirm(false)}
        >
          <div
            className="bg-white rounded-none shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-green-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-white/15 flex items-center justify-center shrink-0">
                <Rocket size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Publish Merchant</h3>
                <p className="text-white/70 text-xs mt-0.5">{merchant.name}</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                This will <strong>activate {merchant.name} on Hyperzod</strong> (status set to
                live), mark them as <strong>live on HalalMe</strong>, and email the merchant to
                let them know they&apos;re live.
              </p>

              <div className="mt-4 rounded-none bg-gray-50 border border-[#102C26]/12 p-4 space-y-2">
                {[
                  "Merchant goes live on Hyperzod — visible to customers",
                  "HalalMe status changes to “live”",
                  "“You're live” email is sent to the merchant",
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                    {line}
                  </div>
                ))}
              </div>

              {publishError && (
                <div className="mt-4 flex items-start gap-2 rounded-none bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{publishError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[#102C26]/12 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPublishConfirm(false)}
                disabled={publishing}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-none text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {publishing ? (
                  <><Loader2 size={14} className="animate-spin" /> Publishing…</>
                ) : (
                  <><Rocket size={14} /> Confirm &amp; Publish</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
