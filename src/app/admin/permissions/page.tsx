"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { display } from "../_fonts";
import { useToast, ToastView } from "../_ui";
import {
  ShieldCheck, Crown, AlertCircle, Loader2, RefreshCw, Save, UserMinus, Lock, Users,
} from "lucide-react";

type Access = "none" | "view" | "manage";
type Module = "merchants" | "users" | "kitchen" | "hub" | "rewards" | "analytics" | "support";

const MODULE_LABELS: Record<Module, string> = {
  merchants: "Merchant CRM",
  users: "User Management",
  kitchen: "Kitchen",
  hub: "Hub",
  rewards: "Rewards & Charity",
  analytics: "Analytics",
  support: "Support",
};

const ACCESS_OPTS: { key: Access; label: string }[] = [
  { key: "none", label: "None" },
  { key: "view", label: "View" },
  { key: "manage", label: "Manage" },
];

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "admin" | "super_admin";
  permissions: Record<Module, Access>;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function PermissionsPage() {
  const { toast, flash } = useToast();
  const [team, setTeam] = useState<Member[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [viewerId, setViewerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/permissions");
      if (res.status === 403) { setForbidden(true); return; }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setTeam(json.team); setModules(json.modules); setViewerId(json.viewerId);
    } catch {
      setError("Could not load the team. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (forbidden) {
    return (
      <div className="bg-[#F3E9D6] min-h-full flex items-center justify-center p-6">
        <div className="bg-white border border-[#102C26]/12 rounded-none p-8 max-w-sm text-center">
          <div className="w-12 h-12 rounded-none bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mx-auto mb-3"><Lock size={22} /></div>
          <h2 className={`${display.className} text-lg font-bold text-[#102C26]`}>Super admins only</h2>
          <p className="text-sm text-gray-600 mt-1.5">Role and permission management is restricted to super admins.</p>
        </div>
      </div>
    );
  }

  const admins = team.filter((m) => m.role === "admin");
  const supers = team.filter((m) => m.role === "super_admin");

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      <ToastView toast={toast} />

      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-5 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">Access Control</span>
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Roles &amp; Permissions</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Control what each team member can see and do in every module</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/users"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors">
            <Users size={14} /> Manage members
          </Link>
          <button onClick={load} title="Refresh"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 space-y-5">
        {/* Legend */}
        <div className="bg-white border border-[#102C26]/12 rounded-none px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-gray-600">
          <span className="font-bold uppercase tracking-wide text-[10px] text-gray-400">Access levels</span>
          <span><span className="font-semibold text-[#102C26]">None</span> — hidden from the sidebar</span>
          <span><span className="font-semibold text-[#102C26]">View</span> — read-only access</span>
          <span><span className="font-semibold text-[#102C26]">Manage</span> — can take actions &amp; edit</span>
        </div>

        {error ? (
          <div className="flex items-center gap-3 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-44 bg-white border border-[#102C26]/10 rounded-none" />)}
          </div>
        ) : (
          <>
            {/* Admins (editable) */}
            <div>
              <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26]/70 mb-3`}>Admins</h2>
              {admins.length === 0 ? (
                <div className="bg-white border border-[#102C26]/12 rounded-none px-4 py-8 text-center text-sm text-gray-500">
                  No admins yet. Open a member in <Link href="/admin/users" className="text-[#102C26] font-semibold underline">Users</Link> and set their role to <span className="font-semibold">Admin</span> to grant module access.
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map((m) => (
                    <MemberCard key={m.id} member={m} modules={modules} isSelf={m.id === viewerId} flash={flash} onChanged={load} />
                  ))}
                </div>
              )}
            </div>

            {/* Super admins (read-only) */}
            {supers.length > 0 && (
              <div>
                <h2 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26]/70 mb-3`}>Super Admins</h2>
                <div className="space-y-4">
                  {supers.map((m) => (
                    <div key={m.id} className="bg-white border border-[#102C26]/12 rounded-none p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar member={m} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">{m.full_name ?? "—"}</p>
                            {m.id === viewerId && <span className="text-[10px] font-bold uppercase tracking-wide bg-[#102C26]/8 text-[#102C26] px-1.5 py-0.5 rounded-full">You</span>}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{m.email ?? "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide bg-[#F59E0B]/10 text-[#F59E0B] rounded-none"><Crown size={13} /> Super Admin</span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500"><Lock size={12} /> Full access to all modules</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Avatar({ member }: { member: Member }) {
  return (
    <div className="w-10 h-10 rounded-none bg-[#102C26]/8 border border-[#102C26]/10 flex items-center justify-center shrink-0">
      <span className="text-[#102C26] text-xs font-bold">{initials(member.full_name || "?")}</span>
    </div>
  );
}

function MemberCard({
  member, modules, isSelf, flash, onChanged,
}: {
  member: Member; modules: Module[]; isSelf: boolean;
  flash: (k: "ok" | "err", m: string) => void; onChanged: () => void;
}) {
  const [draft, setDraft] = useState<Record<Module, Access>>(member.permissions);
  const [saving, setSaving] = useState(false);
  const [demoting, setDemoting] = useState(false);
  const [confirmDemote, setConfirmDemote] = useState(false);

  // Keep the draft in sync if the parent reloads with fresh data.
  useEffect(() => { setDraft(member.permissions); }, [member.permissions]);

  const dirty = modules.some((mod) => draft[mod] !== member.permissions[mod]);
  const locked = isSelf; // can't edit your own access

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${member.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: draft }),
      });
      if (!res.ok) { const j = await res.json().catch(() => null); throw new Error(j?.error); }
      flash("ok", `Permissions updated for ${member.full_name ?? "member"}.`);
      onChanged();
    } catch (e) {
      flash("err", (e as Error).message || "Failed to update permissions.");
    } finally {
      setSaving(false);
    }
  }

  async function demote() {
    setDemoting(true);
    try {
      const res = await fetch(`/api/admin/users/${member.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user" }),
      });
      if (!res.ok) { const j = await res.json().catch(() => null); throw new Error(j?.error); }
      flash("ok", `${member.full_name ?? "Member"} demoted to User (access removed).`);
      onChanged();
    } catch (e) {
      flash("err", (e as Error).message || "Failed to demote member.");
    } finally {
      setDemoting(false);
      setConfirmDemote(false);
    }
  }

  return (
    <div className="bg-white border border-[#102C26]/12 rounded-none p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar member={member} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 truncate">{member.full_name ?? "—"}</p>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#102C26]/10 text-[#102C26] rounded-full"><ShieldCheck size={11} /> Admin</span>
              {isSelf && <span className="text-[10px] font-bold uppercase tracking-wide bg-[#102C26]/8 text-[#102C26] px-1.5 py-0.5 rounded-full">You</span>}
            </div>
            <p className="text-xs text-gray-500 truncate">{member.email ?? "—"}</p>
          </div>
        </div>
        {!isSelf && (
          confirmDemote ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Remove admin access?</span>
              <button onClick={demote} disabled={demoting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-none transition-colors disabled:opacity-50">
                {demoting ? <Loader2 size={13} className="animate-spin" /> : <UserMinus size={13} />} Demote
              </button>
              <button onClick={() => setConfirmDemote(false)} disabled={demoting} className="text-xs font-medium text-gray-500 hover:text-gray-800">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDemote(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-none hover:bg-gray-50 transition-colors">
              <UserMinus size={13} /> Demote to User
            </button>
          )
        )}
      </div>

      {locked && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 italic"><Lock size={12} /> You can&rsquo;t change your own access. Ask another super admin.</p>
      )}

      {/* Permission grid */}
      <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {modules.map((mod) => (
          <div key={mod} className="flex items-center justify-between gap-3 py-1">
            <span className="text-sm text-gray-700">{MODULE_LABELS[mod]}</span>
            <div className="inline-flex border border-gray-200 rounded-none overflow-hidden shrink-0">
              {ACCESS_OPTS.map(({ key, label }) => {
                const active = draft[mod] === key;
                return (
                  <button key={key} disabled={locked}
                    onClick={() => setDraft((d) => ({ ...d, [mod]: key }))}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                      active
                        ? key === "manage" ? "bg-[#102C26] text-[#F7E7CE]" : key === "view" ? "bg-[#102C26]/15 text-[#102C26]" : "bg-gray-200 text-gray-600"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    } ${locked ? "opacity-60" : ""}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!locked && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          {dirty && (
            <button onClick={() => setDraft(member.permissions)} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Reset</button>
          )}
          <button onClick={save} disabled={!dirty || saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-[#F7E7CE] bg-[#102C26] rounded-none hover:bg-[#102C26]/90 transition-colors disabled:opacity-40">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
          </button>
        </div>
      )}
    </div>
  );
}
