"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { display } from "../../_fonts";
import {
  ArrowLeft,
  BadgeCheck,
  Store,
  ShieldCheck,
  Ban,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AtSign,
  Award,
  Loader2,
  X,
  Pencil,
  Trash2,
  Save,
  Heart,
  FileText,
  ChefHat,
  LifeBuoy,
} from "lucide-react";
import ThemedSelect from "@/components/admin/ThemedSelect";
import RecordNav from "@/components/admin/RecordNav";
import { Modal } from "../../_ui";

// ─── Types ──────────────────────────────────────────────────────────────────
type Access = "none" | "view" | "manage";
const MODULES = ["merchants", "users", "kitchen", "hub", "rewards", "analytics"] as const;
type Module = (typeof MODULES)[number];

const MODULE_LABELS: Record<Module, string> = {
  merchants: "Merchant CRM", users: "User Management", kitchen: "Kitchen", hub: "Hub", rewards: "Rewards", analytics: "Analytics",
};

interface UserDetail {
  id: string; full_name: string; username: string | null; email: string | null;
  phone: string | null; bio: string | null; location: string | null; avatar_url: string | null;
  role: string; status: string; suspended_reason: string | null; suspended_at: string | null; suspended_by: string | null;
  is_verified: boolean; reward_points: number; reward_tier: string; created_at: string;
}
interface Activity {
  donations: { count: number; total: number; spark: number[]; recent: { amount: number; status: string; created_at: string; charity: string }[] };
  posts: { count: number; spark: number[]; recent: { id: string; content: string; created_at: string; like_count: number; comment_count: number }[] };
  recipes: { count: number; spark: number[]; recent: { id: string; title: string; created_at: string; is_published: boolean }[] };
  support: { count: number; open: number; spark: number[]; recent: { id: string; subject: string; status: string; last_message_at: string }[] };
  rewards: { recent: { points: number; action: string; description: string | null; created_at: string }[] };
}
interface DetailResponse {
  user: UserDetail;
  linkedMerchant: { id: string; name: string; status: string } | null;
  suspendedByName: string | null;
  permissions: Record<Module, Access>;
  activity: Activity;
  viewer: { id: string; role: string; canManage: boolean };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
const STATUS_CONFIG: Record<string, { label: string; dot: string; cls: string }> = {
  active: { label: "Active", dot: "bg-green-500", cls: "bg-green-50 text-green-700" },
  suspended: { label: "Suspended", dot: "bg-amber-500", cls: "bg-amber-50 text-amber-700" },
  banned: { label: "Banned", dot: "bg-red-500", cls: "bg-red-50 text-red-700" },
};
const ROLE_CONFIG: Record<string, { label: string; cls: string }> = {
  user: { label: "User", cls: "bg-gray-100 text-gray-700" },
  admin: { label: "Admin", cls: "bg-[#102C26]/10 text-[#102C26]" },
  super_admin: { label: "Super Admin", cls: "bg-[#F59E0B]/10 text-[#F59E0B]" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", username: "", phone: "", location: "", bio: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);

  // Status moderation
  const [statusMode, setStatusMode] = useState<null | "suspended" | "banned">(null);
  const [reason, setReason] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // Role / permissions
  const [roleDraft, setRoleDraft] = useState<string>("user");
  const [savingRole, setSavingRole] = useState(false);
  const [permDraft, setPermDraft] = useState<Record<Module, Access>>(Object.fromEntries(MODULES.map((m) => [m, "none"])) as Record<Module, Access>);
  const [savingPerms, setSavingPerms] = useState(false);

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  function flash(kind: "ok" | "err", msg: string) { setToast({ kind, msg }); setTimeout(() => setToast(null), 3500); }

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error();
      const json: DetailResponse = await res.json();
      setData(json);
      setRoleDraft(json.user.role === "admin" ? "admin" : "user");
      setPermDraft(json.permissions);
    } catch {
      setError("Could not load this user.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function patch(body: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!res.ok) { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Update failed."); return false; }
    return true;
  }

  function startEdit() {
    if (!data) return;
    const u = data.user;
    setForm({ full_name: u.full_name ?? "", username: u.username ?? "", phone: u.phone ?? "", location: u.location ?? "", bio: u.bio ?? "" });
    setEditing(true);
  }
  async function saveProfile() {
    if (!form.full_name.trim()) { flash("err", "Name cannot be empty."); return; }
    if (!form.username.trim()) { flash("err", "Username cannot be empty."); return; }
    setSavingProfile(true);
    const ok = await patch({
      full_name: form.full_name, username: form.username,
      phone: form.phone, location: form.location, bio: form.bio,
    });
    setSavingProfile(false);
    if (ok) { setEditing(false); flash("ok", "Profile updated."); load(); }
  }
  async function toggleVerify() {
    if (!data) return;
    setVerifyBusy(true);
    const ok = await patch({ is_verified: !data.user.is_verified });
    setVerifyBusy(false);
    if (ok) { flash("ok", data.user.is_verified ? "Verification removed." : "User verified."); load(); }
  }

  async function changeStatus(status: "active" | "suspended" | "banned") {
    if ((status === "suspended" || status === "banned") && !reason.trim()) { flash("err", "A reason is required."); return; }
    setSavingStatus(true);
    const ok = await patch({ status, reason: reason.trim() || undefined });
    setSavingStatus(false);
    if (ok) { setStatusMode(null); setReason(""); flash("ok", `Account ${status === "active" ? "reactivated" : status}.`); load(); }
  }
  async function saveRole() {
    setSavingRole(true);
    const ok = await patch({ role: roleDraft });
    setSavingRole(false);
    if (ok) { flash("ok", "Role updated."); load(); }
  }
  async function savePerms() {
    setSavingPerms(true);
    const ok = await patch({ permissions: permDraft });
    setSavingPerms(false);
    if (ok) { flash("ok", "Permissions updated."); load(); }
  }
  async function doDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { router.push("/admin/users"); }
    else { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Delete failed."); setShowDelete(false); }
  }

  // ── Loading / error ──
  if (loading) {
    return (
      <div className="bg-[#F3E9D6] min-h-full p-8">
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-28 bg-white rounded-none border border-[#102C26]/12" />
          <div className="h-64 bg-white rounded-none border border-[#102C26]/12" />
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="bg-[#F3E9D6] min-h-full p-8">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-[#102C26] font-semibold hover:underline mb-6"><ArrowLeft size={14} /> Back to Users</Link>
        <div className="flex items-center gap-3 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium max-w-md">
          <AlertCircle size={16} className="shrink-0" /> {error ?? "User not found."}
        </div>
      </div>
    );
  }

  const { user, linkedMerchant, suspendedByName, activity, viewer } = data;
  const isSuperViewer = viewer.role === "super_admin";
  const isOwnRow = viewer.id === user.id;
  const targetIsSuper = user.role === "super_admin";
  const statusCfg = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.active;
  const roleCfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.user;

  const canManage = viewer.canManage && !targetIsSuper;          // edit / status / verify
  const canManageRole = isSuperViewer && !isOwnRow && !targetIsSuper; // role + permission grid
  const canDelete = canManage && user.role === "user" && !isOwnRow;   // delete only regular users
  const showPermGrid = canManageRole && user.role === "admin";
  const permDirty = MODULES.some((m) => permDraft[m] !== data.permissions[m]);

  const inputCls = "w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500";

  return (
    <div className="bg-[#F3E9D6] min-h-full pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-70 flex items-center gap-2 px-4 py-2.5 rounded-none shadow-lg text-sm font-medium ${toast.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-[#102C26]/80 font-semibold hover:text-[#102C26] transition-colors"><ArrowLeft size={14} /> Back to Users</Link>
        <RecordNav navKey="users" currentId={id} basePath="/admin/users" />
      </div>

      <div className="px-4 sm:px-8 py-6 max-w-4xl space-y-5">
        {/* Profile header card */}
        <div className="bg-white rounded-none border border-[#102C26]/12 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-none bg-[#102C26]/8 border border-[#102C26]/10 flex items-center justify-center shrink-0 overflow-hidden">
              {user.avatar_url
                // eslint-disable-next-line @next/next/no-img-element -- external avatar URL (Cloudinary/Google), not worth next/image domain config
                ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                : <span className="text-[#102C26] text-lg font-bold">{initials(user.full_name || "?")}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold text-[#102C26] leading-tight`}>{user.full_name}</h1>
                {user.is_verified && <BadgeCheck size={18} className="text-[#102C26]/60" />}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{user.email ?? "No email"}</p>
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleCfg.cls}`}>{roleCfg.label}</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusCfg.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} /> {statusCfg.label}
                </span>
              </div>
            </div>
            {canManage && (
              <button onClick={toggleVerify} disabled={verifyBusy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-[#102C26] bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors disabled:opacity-50 shrink-0">
                {verifyBusy ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />}
                {user.is_verified ? "Unverify" : "Verify"}
              </button>
            )}
          </div>
        </div>

        {/* Profile info / edit */}
        <div className="bg-white rounded-none border border-[#102C26]/12 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26]`}>Profile</h2>
            {canManage && !editing && (
              <button onClick={startEdit} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#102C26]/80 hover:text-[#102C26] transition-colors"><Pencil size={13} /> Edit</button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full name"><input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className={inputCls} /></Field>
                <Field label="Username"><input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className={inputCls} /></Field>
                <Field label="Phone"><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} /></Field>
                <Field label="Location"><input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className={inputCls} /></Field>
              </div>
              <Field label="Bio"><textarea rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className={inputCls} /></Field>
              <p className="text-xs text-gray-500">Email is the login identity and can&apos;t be changed here.</p>
              <div className="flex items-center gap-2">
                <button onClick={saveProfile} disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-[#F7E7CE] bg-[#102C26] hover:bg-[#102C26]/90 rounded-none disabled:opacity-50 transition-colors">
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
                <button onClick={() => setEditing(false)} disabled={savingProfile} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={AtSign} label="Username" value={user.username ? `@${user.username}` : null} />
                <InfoRow icon={Phone} label="Phone" value={user.phone} />
                <InfoRow icon={MapPin} label="Location" value={user.location} />
                <InfoRow icon={Calendar} label="Joined" value={fmtDate(user.created_at)} />
                <InfoRow icon={Award} label="Rewards" value={`${user.reward_tier} · ${user.reward_points.toLocaleString()} pts`} />
              </div>
              {user.bio && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Linked merchant */}
        {linkedMerchant && (
          <Link href={`/admin/merchants/${linkedMerchant.id}`}
            className="bg-white rounded-none border border-[#102C26]/12 p-4 sm:p-5 flex items-center gap-4 hover:border-[#102C26]/30 transition-colors group">
            <div className="w-10 h-10 rounded-none bg-[#102C26]/8 flex items-center justify-center shrink-0"><Store size={18} className="text-[#102C26]" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Linked Merchant</p>
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#102C26]">{linkedMerchant.name}</p>
            </div>
            <span className="text-xs text-[#102C26] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
          </Link>
        )}

        {/* Activity overview */}
        <div className="bg-white rounded-none border border-[#102C26]/12 p-5 sm:p-6">
          <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26] mb-4`}>Activity</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Chip icon={Heart} label="Donated" value={`£${activity.donations.total.toLocaleString()}`} sub={`${activity.donations.count} completed`} spark={activity.donations.spark} sparkColor="#F59E0B" />
            <Chip icon={FileText} label="Posts" value={activity.posts.count} sub="Hub" spark={activity.posts.spark} />
            <Chip icon={ChefHat} label="Recipes" value={activity.recipes.count} sub="Kitchen" spark={activity.recipes.spark} />
            <Chip icon={LifeBuoy} label="Tickets" value={activity.support.count} sub={`${activity.support.open} open`} spark={activity.support.spark} sparkColor="#F59E0B" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Recent donations */}
          <ListCard title="Recent Donations" empty="No donations yet">
            {activity.donations.recent.map((d, i) => (
              <Row key={i} left={`£${Math.round(d.amount).toLocaleString()} to ${d.charity}`}
                sub={fmtDate(d.created_at)}
                right={<span className={`text-[10px] font-bold uppercase ${d.status === "completed" ? "text-green-600" : "text-gray-400"}`}>{d.status}</span>} />
            ))}
          </ListCard>

          {/* Support tickets */}
          <ListCard title="Support Tickets" empty="No support tickets">
            {activity.support.recent.map((t) => (
              <Link key={t.id} href={`/admin/chat/${t.id}`} className="block hover:bg-[#102C26]/2 -mx-1 px-1 transition-colors">
                <Row left={t.subject} sub={fmtDate(t.last_message_at)}
                  right={<span className="text-[10px] font-bold uppercase text-gray-500">{t.status}</span>} />
              </Link>
            ))}
          </ListCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Recent posts */}
          <ListCard title="Recent Posts" empty="No posts">
            {activity.posts.recent.map((p) => (
              <Row key={p.id} left={p.content?.trim() || "(no text)"} sub={fmtDate(p.created_at)}
                right={<span className="text-[11px] text-gray-400 whitespace-nowrap">♥ {p.like_count} · 💬 {p.comment_count}</span>} />
            ))}
          </ListCard>

          {/* Recent recipes */}
          <ListCard title="Recent Recipes" empty="No recipes">
            {activity.recipes.recent.map((r) => (
              <Row key={r.id} left={r.title} sub={fmtDate(r.created_at)}
                right={<span className={`text-[10px] font-bold uppercase ${r.is_published ? "text-green-600" : "text-gray-400"}`}>{r.is_published ? "Published" : "Hidden"}</span>} />
            ))}
          </ListCard>
        </div>

        {/* Reward history */}
        {activity.rewards.recent.length > 0 && (
          <ListCard title="Reward History" empty="No reward activity">
            {activity.rewards.recent.map((t, i) => (
              <Row key={i} left={t.description ?? t.action} sub={fmtDate(t.created_at)}
                right={<span className={`text-sm font-bold tabular-nums ${t.points >= 0 ? "text-[#102C26]" : "text-red-600"}`}>{t.points >= 0 ? "+" : ""}{t.points.toLocaleString()}</span>} />
            ))}
          </ListCard>
        )}

        {/* Account status / moderation */}
        {canManage && (
          <div className="bg-white rounded-none border border-[#102C26]/12 p-5 sm:p-6">
            <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26] mb-1`}>Account Status</h2>
            <p className="text-xs text-gray-500 mb-4">Suspend hides the account; ban is a permanent restriction. Both require a reason.</p>

            {user.status !== "active" && user.suspended_reason && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-100 rounded-none">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">{statusCfg.label} reason</p>
                <p className="text-sm text-gray-800 mt-1">{user.suspended_reason}</p>
                <p className="text-[11px] text-gray-500 mt-1.5">{user.suspended_at && fmtDate(user.suspended_at)}{suspendedByName && ` · by ${suspendedByName}`}</p>
              </div>
            )}

            {isOwnRow ? (
              <p className="text-sm text-gray-500 italic">You cannot change your own account status.</p>
            ) : statusMode ? (
              <div className="space-y-3">
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                  placeholder={`Reason for ${statusMode === "banned" ? "banning" : "suspending"} this account (required)…`} className={inputCls} />
                <div className="flex items-center gap-2">
                  <button onClick={() => changeStatus(statusMode)} disabled={savingStatus || !reason.trim()}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white rounded-none disabled:opacity-50 transition-colors ${statusMode === "banned" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}>
                    {savingStatus ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} Confirm {statusMode === "banned" ? "Ban" : "Suspend"}
                  </button>
                  <button onClick={() => { setStatusMode(null); setReason(""); }} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {user.status !== "active" && (
                  <button onClick={() => changeStatus("active")} disabled={savingStatus}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white bg-green-600 hover:bg-green-700 rounded-none disabled:opacity-50 transition-colors">
                    {savingStatus ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Reactivate
                  </button>
                )}
                {user.status !== "suspended" && (
                  <button onClick={() => setStatusMode("suspended")} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-none transition-colors"><Ban size={14} /> Suspend</button>
                )}
                {user.status !== "banned" && (
                  <button onClick={() => setStatusMode("banned")} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-none transition-colors"><Ban size={14} /> Ban</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Role + permissions (super admin only) */}
        {canManageRole && (
          <div className="bg-white rounded-none border border-[#102C26]/12 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-[#F59E0B]" />
              <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26]`}>Role &amp; Permissions</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Only super admins can change these. Promote a member to Admin, then choose what each module allows.</p>

            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <ThemedSelect
                value={roleDraft}
                onChange={setRoleDraft}
                className="w-44"
                options={[{ value: "user", label: "User" }, { value: "admin", label: "Admin" }]}
              />
              {roleDraft !== user.role && (
                <button onClick={saveRole} disabled={savingRole}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-[#F7E7CE] bg-[#102C26] hover:bg-[#102C26]/90 rounded-none disabled:opacity-50 transition-colors">
                  {savingRole ? <Loader2 size={14} className="animate-spin" /> : null} Save Role
                </button>
              )}
            </div>

            {showPermGrid ? (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="space-y-2">
                  {MODULES.map((m) => (
                    <div key={m} className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-sm font-medium text-gray-700">{MODULE_LABELS[m]}</span>
                      <div className="flex items-center gap-1">
                        {(["none", "view", "manage"] as Access[]).map((lvl) => {
                          const active = permDraft[m] === lvl;
                          return (
                            <button key={lvl} onClick={() => setPermDraft((prev) => ({ ...prev, [m]: lvl }))}
                              className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-none transition-all border ${active
                                ? lvl === "none" ? "bg-gray-100 text-gray-700 border-gray-300"
                                  : lvl === "view" ? "bg-[#102C26]/10 text-[#102C26] border-[#102C26]/30"
                                  : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                              {lvl === "none" ? "No access" : lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {permDirty && (
                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={savePerms} disabled={savingPerms}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-[#F7E7CE] bg-[#102C26] hover:bg-[#102C26]/90 rounded-none disabled:opacity-50 transition-colors">
                      {savingPerms ? <Loader2 size={14} className="animate-spin" /> : null} Save Permissions
                    </button>
                    <button onClick={() => setPermDraft(data.permissions)} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 inline-flex items-center gap-1"><X size={13} /> Reset</button>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 italic">Promote this member to <span className="font-semibold">Admin</span> and save to configure per-module permissions.</p>
            )}
          </div>
        )}

        {/* Danger zone */}
        {canDelete && (
          <div className="bg-white rounded-none border border-red-200 p-5 sm:p-6">
            <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-red-700 mb-1`}>Danger Zone</h2>
            <p className="text-xs text-gray-600 mb-4">Permanently delete this user and all of their content. This cannot be undone.</p>
            <button onClick={() => setShowDelete(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-none transition-colors"><Trash2 size={14} /> Delete user</button>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showDelete && (
        <Modal open onClose={() => setShowDelete(false)} busy={deleting} maxWidth="max-w-md" className="p-6"
          labelledBy="user-hard-del-title" describedBy="user-hard-del-desc">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-none bg-red-50 text-red-600 flex items-center justify-center shrink-0"><Trash2 size={18} /></div>
              <div className="min-w-0">
                <h3 id="user-hard-del-title" className={`${display.className} text-lg font-bold text-[#102C26]`}>Delete user?</h3>
                <p id="user-hard-del-desc" className="text-sm text-gray-600 mt-1">This permanently removes <span className="font-semibold">{user.full_name}</span> and all of their content. This cannot be undone.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => setShowDelete(false)} disabled={deleting} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
              <button onClick={doDelete} disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white bg-red-600 hover:bg-red-700 rounded-none disabled:opacity-50 transition-colors">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
              </button>
            </div>
        </Modal>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 truncate">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Chip({ icon: Icon, label, value, sub, spark, sparkColor = "#102C26" }: { icon: React.ElementType; label: string; value: React.ReactNode; sub?: string; spark?: number[]; sparkColor?: string }) {
  return (
    <div className="border border-[#102C26]/10 rounded-none p-3">
      <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
        <Icon size={13} /> <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className={`${display.className} text-lg font-bold text-[#102C26] leading-none`}>{value}</p>
          {sub && <p className="text-[11px] text-gray-500 mt-1">{sub}</p>}
        </div>
        {spark && <Sparkline data={spark} color={sparkColor} />}
      </div>
    </div>
  );
}

// Tiny inline trend line (last 6 months). Hidden when there's not enough signal.
function Sparkline({ data, color = "#102C26" }: { data: number[]; color?: string }) {
  if (!data || data.length < 2 || data.every((v) => v === 0)) return null;
  const w = 60, h = 20, max = Math.max(1, ...data);
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - (v / max) * (h - 3) - 1.5).toFixed(1)}`).join(" ");
  const last = data[data.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {last > 0 && <circle cx={w} cy={h - (last / max) * (h - 3) - 1.5} r="1.8" fill={color} />}
    </svg>
  );
}

function ListCard({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.flat().filter(Boolean) : children;
  const isEmpty = Array.isArray(items) ? items.length === 0 : !items;
  return (
    <div className="bg-white rounded-none border border-[#102C26]/12 p-5 sm:p-6">
      <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26] mb-3`}>{title}</h2>
      {isEmpty ? <p className="text-sm text-gray-400 py-2">{empty}</p> : <div className="divide-y divide-gray-100">{children}</div>}
    </div>
  );
}

function Row({ left, sub, right }: { left: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm text-gray-800 truncate">{left}</p>
        {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
