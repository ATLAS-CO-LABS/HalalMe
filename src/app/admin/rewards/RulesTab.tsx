"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertCircle, Coins, Loader2, Save, X, Pencil } from "lucide-react";
import ThemedSelect from "@/components/admin/ThemedSelect";
import { display } from "../_fonts";
import { fmtDate, useToast, ToastView, TableSkeleton, EmptyState, Badge } from "./_ui";

interface Rule {
  id: string;
  action: string;
  label: string;
  points_per_unit: number;
  unit: string;
  max_per_day: number | null;
  max_lifetime: number | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  updated_at: string;
}

export default function RulesTab() {
  const { toast, flash } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Rule | null>(null);
  const [busy, setBusy] = useState(false);

  async function fetchRules() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/reward-rules");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRules(json.rules); setCanManage(!!json.canManage);
    } catch {
      setError("Could not load reward rules. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRules(); }, []);

  function startEdit(r: Rule) { setEditId(r.id); setDraft({ ...r }); }
  function cancelEdit() { setEditId(null); setDraft(null); }

  async function save() {
    if (!draft) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/reward-rules", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id, label: draft.label, points_per_unit: draft.points_per_unit,
          unit: draft.unit, max_per_day: draft.max_per_day, max_lifetime: draft.max_lifetime,
          is_active: draft.is_active,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { flash("err", json?.error ?? "Save failed."); return; }
      flash("ok", "Rule updated.");
      cancelEdit();
      fetchRules();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <ToastView toast={toast} />

      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8 flex items-center justify-between gap-2">
          <div>
            <h3 className={`${display.className} text-sm font-bold text-[#102C26]`}>Reward Rules</h3>
            <p className="text-xs text-gray-600 mt-0.5">How many points each action awards. Changes apply immediately — no deploy.</p>
          </div>
          <button onClick={fetchRules}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error ? (
          <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? <TableSkeleton /> : rules.length === 0 ? (
          <EmptyState icon={Coins} title="No reward rules" hint="Reward rules define point awards for donations, reviews and more." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                <th className="pl-4 lg:pl-5 px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Action</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Points</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Per day</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Lifetime</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Active</th>
                <th className="px-4 lg:px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102C26]/8">
              {rules.map((r) => {
                const editing = editId === r.id && draft;
                return (
                  <tr key={r.id} className={editing ? "bg-[#102C26]/3" : "hover:bg-[#102C26]/2 transition-colors"}>
                    <td className="pl-4 lg:pl-5 px-2 py-3">
                      <p className="font-semibold text-gray-900">{r.label}</p>
                      <p className="text-xs text-gray-500 font-mono">{r.action}</p>
                    </td>
                    {editing ? (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <input type="number" value={draft!.points_per_unit} onChange={(e) => setDraft({ ...draft!, points_per_unit: parseFloat(e.target.value) })}
                              className="w-20 px-2 py-1.5 text-sm border border-gray-200 bg-white rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 tabular-nums" />
                            <div className="w-28"><ThemedSelect value={draft!.unit} onChange={(v) => setDraft({ ...draft!, unit: v })} options={[{ value: "fixed", label: "fixed" }, { value: "per_gbp", label: "per £" }]} /></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <input type="number" value={draft!.max_per_day ?? ""} placeholder="∞" onChange={(e) => setDraft({ ...draft!, max_per_day: e.target.value === "" ? null : parseInt(e.target.value, 10) })}
                            className="w-20 px-2 py-1.5 text-sm border border-gray-200 bg-white rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 tabular-nums" />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <input type="number" value={draft!.max_lifetime ?? ""} placeholder="∞" onChange={(e) => setDraft({ ...draft!, max_lifetime: e.target.value === "" ? null : parseInt(e.target.value, 10) })}
                            className="w-20 px-2 py-1.5 text-sm border border-gray-200 bg-white rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 tabular-nums" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={draft!.is_active} onChange={(e) => setDraft({ ...draft!, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-[#102C26]" />
                        </td>
                        <td className="px-4 lg:px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={save} disabled={busy} title="Save" className="inline-flex items-center justify-center w-8 h-8 rounded-none text-white bg-[#102C26] hover:bg-[#102C26]/90 disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}</button>
                            <button onClick={cancelEdit} disabled={busy} title="Cancel" className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-gray-100"><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 tabular-nums text-gray-900 font-medium">{r.points_per_unit} <span className="text-xs text-gray-500 font-normal">{r.unit === "per_gbp" ? "/ £" : "fixed"}</span></td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-600 tabular-nums">{r.max_per_day ?? "∞"}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-600 tabular-nums">{r.max_lifetime ?? "∞"}</td>
                        <td className="px-4 py-3"><Badge label={r.is_active ? "Active" : "Off"} tone={r.is_active ? "green" : "gray"} /></td>
                        <td className="px-4 lg:px-5 py-3 text-right">
                          {canManage && (
                            <button onClick={() => startEdit(r)} title="Edit" className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-[#102C26] hover:text-white transition-all"><Pencil size={14} /></button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && rules.length > 0 && (
          <div className="px-5 py-3 border-t border-[#102C26]/8">
            <p className="text-xs text-gray-500">Last updated {fmtDate(rules.reduce((a, b) => (a.updated_at > b.updated_at ? a : b)).updated_at)}.</p>
          </div>
        )}
      </div>
    </>
  );
}
