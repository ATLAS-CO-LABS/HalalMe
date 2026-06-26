"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search, RefreshCw, AlertCircle, ChefHat, BadgeCheck, Sparkles, Star, EyeOff, Eye,
  MoreVertical, Trash2, Loader2, Bot, Users, TrendingUp, CheckSquare, X, FileText, Clock, Flag, RotateCcw,
} from "lucide-react";
import { display } from "../_fonts";
import {
  fmtDate, useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge, Modal,
} from "../_ui";
import ReportsQueue from "../_ReportsQueue";

type Author = { id: string; full_name?: string; username?: string } | { id: string; full_name?: string; username?: string }[] | null;
function oneAuthor(a: Author) { return Array.isArray(a) ? a[0] : a; }

// Recipe ingredients/instructions are free-form JSONB. Normalise to printable
// lines whether they're strings, {name/amount}, or {step/text} objects.
function toLines(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      if (typeof o.text === "string") return o.text;
      if (typeof o.step === "string") return o.step;
      const name = [o.quantity, o.amount, o.unit, o.name, o.item].filter((v) => typeof v === "string" || typeof v === "number").join(" ");
      if (name.trim()) return name.trim();
      return JSON.stringify(item);
    }
    return String(item);
  }).filter(Boolean);
}

interface RecipeRow {
  id: string;
  title: string;
  cuisine: string | null;
  difficulty: string | null;
  image_url: string | null;
  is_published: boolean;
  is_halal_verified: boolean;
  is_ai_generated: boolean;
  is_featured: boolean;
  avg_rating: number;
  review_count: number;
  view_count: number;
  created_at: string;
  author: Author;
}
interface Stats { total: number; published: number; unverified: number; aiGenerated: number; deleted?: number; }
interface AiUsage {
  sessions: { total: number; converted: number; conversionRate: number; thisWeek: number };
  requests: { total: number; thisWeek: number; uniqueUsers: number };
  topUsers: { id: string; name: string; requests: number }[];
}

const PUBLISHED_FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "unpublished", label: "Hidden" },
];
const HALAL_FILTERS = [
  { key: "all", label: "All" },
  { key: "verified", label: "Halal ✓" },
  { key: "unverified", label: "Unverified" },
];
const SOURCE_FILTERS = [
  { key: "all", label: "All" },
  { key: "ai", label: "AI" },
  { key: "user", label: "User" },
];

export default function KitchenPage() {
  const { toast, flash } = useToast();
  const [tab, setTab] = useState<"recipes" | "reported" | "deleted">("recipes");
  const deletedMode = tab === "deleted";
  const [rows, setRows] = useState<RecipeRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [published, setPublished] = useState("all");
  const [halal, setHalal] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ai, setAi] = useState<AiUsage | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<string | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);

  const [menu, setMenu] = useState<{ recipe: RecipeRow; top: number; left: number } | null>(null);
  const [modal, setModal] = useState<RecipeRow | null>(null);
  const [modalBusy, setModalBusy] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [preview, setPreview] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function openPreview(id: string) {
    setMenu(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/recipes/${id}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setPreview(json.recipe);
    } catch {
      flash("err", "Could not load recipe.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function fetchRows(p: number, pub: string, hal: string, src: string, q: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) });
      if (tab === "deleted") params.set("deleted", "1");
      if (pub !== "all") params.set("published", pub);
      if (hal !== "all") params.set("halal", hal);
      if (src !== "all") params.set("source", src);
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/recipes?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.recipes); setStats(json.stats); setTotal(json.total);
      setPageSize(json.pageSize); setCanManage(!!json.canManage);
    } catch {
      setError("Could not load recipes. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(page, published, halal, source, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, published, halal, source, tab]);
  useEffect(() => { setPage(0); setSelectedIds(new Set()); }, [published, halal, source, tab]);
  useEffect(() => { setSelectedIds(new Set()); setBulkDelete(false); }, [page, published, halal, source, search]);

  // AI usage panel — loaded once.
  useEffect(() => {
    fetch("/api/admin/kitchen/ai-usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setAi(d); })
      .catch(() => {});
  }, []);

  // Close the row menu on outside interaction.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("click", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("click", close);
    };
  }, [menu]);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); fetchRows(0, published, halal, source, val); }, 300);
  }

  async function patch(id: string, body: Record<string, boolean>): Promise<boolean> {
    const res = await fetch(`/api/admin/recipes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!res.ok) { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Update failed."); return false; }
    return true;
  }

  async function toggle(r: RecipeRow, field: "is_published" | "is_halal_verified" | "is_featured", okMsg: string) {
    setMenu(null);
    const ok = await patch(r.id, { [field]: !r[field] });
    if (ok) { flash("ok", okMsg); fetchRows(page, published, halal, source, search); }
  }

  async function confirmDelete() {
    if (!modal) return;
    setModalBusy(true);
    try {
      // In the Trash, deleting is permanent (?hard=1); elsewhere it soft-deletes.
      const res = await fetch(`/api/admin/recipes/${modal.id}${deletedMode ? "?hard=1" : ""}`, { method: "DELETE" });
      if (res.ok) { flash("ok", deletedMode ? "Recipe permanently deleted." : "Recipe moved to Trash."); setModal(null); fetchRows(page, published, halal, source, search); }
      else { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Delete failed."); }
    } finally {
      setModalBusy(false);
    }
  }

  function openMenu(e: React.MouseEvent, r: RecipeRow) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ recipe: r, top: rect.bottom + 4, left: Math.max(8, rect.right - 190) });
  }

  // ── Selection ────────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleSelectAll() {
    if (selectedIds.size === rows.length && rows.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(rows.map((r) => r.id)));
  }
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  // ── Bulk actions (looped over the existing per-recipe routes) ──────────────
  async function runBulk(action: "publish" | "unpublish" | "feature" | "unfeature" | "verify" | "delete" | "restore" | "purge") {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(action);
    try {
      const res = await fetch("/api/admin/recipes/bulk", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json() as { updated: number };
      const verb = action === "delete" ? "moved to Trash" : action === "restore" ? "restored" : action === "purge" ? "permanently deleted" : "updated";
      flash("ok", `${json.updated} recipe${json.updated !== 1 ? "s" : ""} ${verb}.`);
      setSelectedIds(new Set());
      setBulkDelete(false);
      fetchRows(page, published, halal, source, search);
    } catch {
      flash("err", "Bulk action failed.");
    } finally {
      setBulkBusy(null);
    }
  }

  // Restore a single recipe from the Trash.
  async function restoreOne(r: RecipeRow) {
    setMenu(null);
    const res = await fetch(`/api/admin/recipes/${r.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
    if (res.ok) { flash("ok", "Recipe restored."); fetchRows(page, published, halal, source, search); }
    else flash("err", "Restore failed.");
  }

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      <ToastView toast={toast} />

      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-5 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">Content Moderation</span>
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Kitchen</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Moderate recipes, verify halal status and manage featured content</p>
        </div>
        <button onClick={() => fetchRows(page, published, halal, source, search)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Recipes / Reported toggle */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8">
        <div className="flex items-center gap-0.5 -mb-px">
          {([["recipes", "Recipes", ChefHat], ["reported", "Reported", Flag], ["deleted", "Trash", Trash2]] as const).map(([key, label, Icon]) => {
            const active = tab === key;
            const badge = key === "deleted" ? (stats?.deleted ?? 0) : 0;
            return (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${active ? "border-[#F59E0B] text-[#102C26]" : "border-transparent text-gray-500 hover:text-[#102C26]"}`}>
                <Icon size={15} className={active ? "text-[#F59E0B]" : ""} /> {label}
                {badge > 0 && <span className="text-[10px] font-bold bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5">{badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "reported" ? (
        <div className="px-4 sm:px-8 py-5"><ReportsQueue type="recipe" /></div>
      ) : (
      <>
      {/* Stat cards */}
      <div className="px-4 sm:px-8 pt-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Total Recipes" value={stats?.total ?? "—"} sub="All recipes" icon={ChefHat} tone="blue" />
          <StatCard label="Published" value={stats?.published ?? "—"} sub="Visible to public" icon={Eye} tone="green" />
          <StatCard label="Unverified Halal" value={stats?.unverified ?? "—"} sub="Need review" icon={BadgeCheck} tone="amber" />
          <StatCard label="AI-Generated" value={stats?.aiGenerated ?? "—"} sub="From AI chat" icon={Sparkles} tone="purple" />
        </div>
      </div>

      {/* Main */}
      <div className="px-4 sm:px-8 py-5">
        <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
          {/* Filters */}
          <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <FilterPills options={PUBLISHED_FILTERS} value={published} onChange={setPublished} />
              <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
              <FilterPills options={HALAL_FILTERS} value={halal} onChange={setHalal} />
              <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
              <FilterPills options={SOURCE_FILTERS} value={source} onChange={setSource} />
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by recipe title or author…"
                className="w-full pl-8 pr-4 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500 transition-colors" />
            </div>
          </div>

          {/* Bulk toolbar */}
          {canManage && selectedIds.size > 0 && (
            <div className="bg-[#102C26] px-4 sm:px-5 py-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <CheckSquare size={16} className="text-[#F7E7CE]" />
                  <span className="text-white font-semibold text-sm">{selectedIds.size} selected</span>
                  <button onClick={() => { setSelectedIds(new Set()); setBulkDelete(false); }} className="text-white/60 hover:text-white transition-colors ml-1" title="Clear"><X size={14} /></button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {deletedMode ? (
                    <>
                      <button onClick={() => runBulk("restore")} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><RotateCcw size={14} /> Restore</button>
                      <button onClick={() => setBulkDelete((v) => !v)} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-white rounded-none text-sm font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"><Trash2 size={14} /> Delete forever</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => runBulk("publish")} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><Eye size={14} /> Publish</button>
                      <button onClick={() => runBulk("unpublish")} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><EyeOff size={14} /> Hide</button>
                      <button onClick={() => runBulk("verify")} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><BadgeCheck size={14} /> Halal ✓</button>
                      <button onClick={() => runBulk("feature")} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><Star size={14} /> Feature</button>
                      <button onClick={() => setBulkDelete((v) => !v)} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-white rounded-none text-sm font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"><Trash2 size={14} /> Delete</button>
                    </>
                  )}
                </div>
              </div>
              {bulkDelete && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-white/80 text-sm">
                    {deletedMode
                      ? `Permanently delete ${selectedIds.size} recipe${selectedIds.size !== 1 ? "s" : ""} and all their reviews/favourites? This can't be undone.`
                      : `Move ${selectedIds.size} recipe${selectedIds.size !== 1 ? "s" : ""} to Trash? You can restore them later.`}
                  </span>
                  <button onClick={() => runBulk(deletedMode ? "purge" : "delete")} disabled={!!bulkBusy}
                    className="px-4 py-2 bg-[#F7E7CE] text-[#102C26] rounded-none text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50">
                    {bulkBusy ? "Working…" : deletedMode ? "Delete forever" : "Move to Trash"}
                  </button>
                </div>
              )}
            </div>
          )}

          {error ? (
            <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
          ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
            <EmptyState icon={ChefHat} title="No recipes found" hint="Recipes created by users or the AI chat will appear here for moderation." />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#102C26]/8">
                {rows.map((r) => {
                  const a = oneAuthor(r.author);
                  const authorName = a?.full_name ?? (a?.username ? `@${a.username}` : "—");
                  const sel = selectedIds.has(r.id);
                  return (
                    <div key={r.id} className={`px-4 py-4 ${sel ? "bg-[#102C26]/3" : ""}`}>
                      <div className="flex items-start gap-3">
                        {canManage && (
                          <div className="flex items-center justify-center w-6 h-6 shrink-0 mt-1" onClick={() => toggleSelect(r.id)}>
                            <input type="checkbox" checked={sel} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openPreview(r.id)}>
                          <div className="flex items-center gap-1.5">
                            <p title={r.title} className={`font-semibold truncate text-[15px] ${r.is_published ? "text-gray-900" : "text-gray-400 line-through"}`}>{r.title}</p>
                            {r.is_featured && <Star size={13} className="text-[#F59E0B] shrink-0 fill-[#F59E0B]" />}
                          </div>
                          <p className="text-xs text-gray-600 truncate capitalize mt-0.5">
                            {r.cuisine ?? "—"}{r.difficulty ? ` · ${r.difficulty}` : ""} · {authorName}
                          </p>
                          <div className="flex items-center gap-1 flex-wrap mt-2">
                            {r.is_halal_verified ? <Badge label="Halal ✓" tone="green" /> : <Badge label="Unverified" tone="amber" />}
                            {r.is_ai_generated && <Badge label="AI" tone="purple" />}
                            {!r.is_published && <Badge label="Hidden" tone="gray" />}
                            {r.review_count > 0 && <span className="text-[10px] text-gray-600">★ {Number(r.avg_rating).toFixed(1)} ({r.review_count})</span>}
                          </div>
                        </div>
                        {canManage && (
                          <button onClick={(e) => openMenu(e, r)} title="Actions"
                            className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-none text-gray-500 hover:bg-[#102C26] hover:text-white transition-all">
                            <MoreVertical size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                    {canManage && (
                      <th className="pl-4 lg:pl-5 pr-2 py-3 w-10 cursor-pointer" onClick={toggleSelectAll} title="Select / deselect page">
                        <div className="flex items-center justify-center">
                          <input type="checkbox" checked={allSelected} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                        </div>
                      </th>
                    )}
                    <th className={`px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 ${canManage ? "" : "pl-4 lg:pl-5"}`}>Recipe</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Author</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Flags</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Rating</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden xl:table-cell">Views</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden xl:table-cell">Created</th>
                    <th className="px-4 lg:px-5 py-3 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102C26]/8">
                  {rows.map((r) => {
                    const a = oneAuthor(r.author);
                    const authorName = a?.full_name ?? (a?.username ? `@${a.username}` : "—");
                    const sel = selectedIds.has(r.id);
                    return (
                      <tr key={r.id} onClick={() => openPreview(r.id)} className={`group cursor-pointer transition-colors ${sel ? "bg-[#102C26]/3" : "hover:bg-[#102C26]/2"}`}>
                        {canManage && (
                          <td className="pl-4 lg:pl-5 pr-2 py-3.5 w-10" onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }}>
                            <div className="flex items-center justify-center h-full">
                              <input type="checkbox" checked={sel} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                            </div>
                          </td>
                        )}
                        <td className={`px-2 py-3.5 ${canManage ? "" : "pl-4 lg:pl-5"}`}>
                          <div className="flex items-center gap-1.5">
                            <p title={r.title} className={`font-semibold truncate max-w-64 ${r.is_published ? "text-gray-900" : "text-gray-400 line-through"}`}>{r.title}</p>
                            {r.is_featured && <Star size={13} className="text-[#F59E0B] shrink-0 fill-[#F59E0B]" />}
                          </div>
                          <p className="text-xs text-gray-600 truncate capitalize">{r.cuisine ?? "—"}{r.difficulty ? ` · ${r.difficulty}` : ""}</p>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell text-gray-700 truncate max-w-40" title={authorName}>{authorName}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {r.is_halal_verified ? <Badge label="Halal ✓" tone="green" /> : <Badge label="Unverified" tone="amber" />}
                            {r.is_ai_generated && <Badge label="AI" tone="purple" />}
                            {!r.is_published && <Badge label="Hidden" tone="gray" />}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right hidden md:table-cell tabular-nums text-gray-700">{r.review_count > 0 ? `${Number(r.avg_rating).toFixed(1)} (${r.review_count})` : "—"}</td>
                        <td className="px-4 py-3.5 text-right hidden xl:table-cell tabular-nums text-gray-600">{r.view_count.toLocaleString()}</td>
                        <td className="px-4 py-3.5 hidden xl:table-cell text-gray-600 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                        <td className="px-4 lg:px-5 py-3.5 text-right">
                          {canManage && (
                            <button onClick={(e) => openMenu(e, r)} title="Actions"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-[#102C26] hover:text-white transition-all">
                              <MoreVertical size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
              <Pagination page={page} pageSize={pageSize} total={total} noun="recipe" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} onPageSize={(s) => { setPageSize(s); setPage(0); }} onJump={(p) => setPage(p)} />
            </>
          )}
        </div>

        {/* AI usage panel */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Bot size={16} className="text-[#102C26]/60" />
            <h2 className={`${display.className} text-sm font-bold uppercase tracking-tight text-[#102C26]`}>AI Recipe Chat — Usage</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Chat Sessions" value={ai?.sessions.total ?? "—"} sub={`${ai?.sessions.thisWeek ?? 0} this week`} icon={Bot} tone="blue" />
            <StatCard label="Session → Recipe" value={ai ? `${ai.sessions.conversionRate}%` : "—"} sub={`${ai?.sessions.converted ?? 0} produced a recipe`} icon={TrendingUp} tone="green" />
            <StatCard label="AI Requests" value={ai?.requests.total ?? "—"} sub={`${ai?.requests.thisWeek ?? 0} this week`} icon={Sparkles} tone="purple" />
            <StatCard label="Active AI Users" value={ai?.requests.uniqueUsers ?? "—"} sub="All time" icon={Users} tone="amber" />
          </div>
          {ai && ai.topUsers.length > 0 && (
            <div className="mt-4 bg-white rounded-none border border-[#102C26]/12 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2.5">Heaviest AI users this week</p>
              <div className="space-y-1.5">
                {ai.topUsers.map((u, i) => (
                  <div key={u.id} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 tabular-nums w-4">{i + 1}</span>
                    <span className="text-gray-800 flex-1 truncate">{u.name}</span>
                    <span className="text-gray-600 tabular-nums font-medium">{u.requests} requests</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* Row action menu */}
      {menu && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: menu.top, left: menu.left, width: 190 }}
          className="z-50 bg-white border border-[#102C26]/15 shadow-xl rounded-none py-1 text-sm">
          <button onClick={() => openPreview(menu.recipe.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"><FileText size={14} className="text-gray-500" /> View recipe</button>
          <div className="my-1 h-px bg-gray-100" />
          {deletedMode ? (
            <>
              <button onClick={() => restoreOne(menu.recipe)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"><RotateCcw size={14} className="text-gray-500" /> Restore</button>
              <button onClick={() => { setModal(menu.recipe); setMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-red-700 hover:bg-red-50 transition-colors"><Trash2 size={14} /> Delete forever</button>
            </>
          ) : (
            <>
              <button onClick={() => toggle(menu.recipe, "is_published", menu.recipe.is_published ? "Recipe hidden." : "Recipe published.")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                {menu.recipe.is_published ? <EyeOff size={14} className="text-gray-500" /> : <Eye size={14} className="text-gray-500" />}
                {menu.recipe.is_published ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => toggle(menu.recipe, "is_halal_verified", menu.recipe.is_halal_verified ? "Halal verification removed." : "Marked halal-verified.")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                <BadgeCheck size={14} className="text-gray-500" /> {menu.recipe.is_halal_verified ? "Remove halal ✓" : "Mark halal ✓"}
              </button>
              <button onClick={() => toggle(menu.recipe, "is_featured", menu.recipe.is_featured ? "Removed from featured." : "Added to featured.")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                <Star size={14} className="text-gray-500" /> {menu.recipe.is_featured ? "Unfeature" : "Feature"}
              </button>
              <div className="my-1 h-px bg-gray-100" />
              <button onClick={() => { setModal(menu.recipe); setMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-red-700 hover:bg-red-50 transition-colors"><Trash2 size={14} /> Delete</button>
            </>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {modal && (
        <Modal open busy={modalBusy} onClose={() => setModal(null)} labelledBy="kitchen-del-title" describedBy="kitchen-del-desc" className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-none flex items-center justify-center shrink-0 bg-red-50 text-red-600"><Trash2 size={18} /></div>
            <div className="min-w-0">
              <h3 id="kitchen-del-title" className={`${display.className} text-lg font-bold text-[#102C26]`}>{deletedMode ? "Delete forever?" : "Move to Trash?"}</h3>
              <p id="kitchen-del-desc" className="text-sm text-gray-600 mt-1">
                {deletedMode
                  ? <>This permanently removes <span className="font-semibold">{modal.title}</span> and all of its reviews and favourites. This cannot be undone.</>
                  : <><span className="font-semibold">{modal.title}</span> will be hidden from the site and moved to Trash. You can restore it later.</>}
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button onClick={() => setModal(null)} disabled={modalBusy} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
            <button onClick={confirmDelete} disabled={modalBusy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white rounded-none disabled:opacity-50 bg-red-600 hover:bg-red-700 transition-colors">
              {modalBusy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} {deletedMode ? "Delete forever" : "Move to Trash"}
            </button>
          </div>
        </Modal>
      )}

      {/* Recipe preview */}
      {(preview || previewLoading) && (
        <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-none border border-[#102C26]/15 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {previewLoading || !preview ? (
              <div className="flex items-center justify-center py-24"><Loader2 size={26} className="animate-spin text-[#102C26]/40" /></div>
            ) : (() => {
              const a = oneAuthor(preview.author);
              const ingredients = toLines(preview.ingredients);
              const instructions = toLines(preview.instructions);
              return (
                <>
                  <div className="sticky top-0 bg-white border-b border-[#102C26]/10 px-6 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {preview.is_halal_verified ? <Badge label="Halal ✓" tone="green" /> : <Badge label="Unverified" tone="amber" />}
                        {preview.is_ai_generated && <Badge label="AI" tone="purple" />}
                        {preview.is_featured && <Badge label="Featured" tone="purple" />}
                        {!preview.is_published && <Badge label="Hidden" tone="gray" />}
                      </div>
                      <h3 className={`${display.className} text-lg font-bold text-[#102C26]`}>{preview.title}</h3>
                      <p className="text-xs text-gray-600">by {a?.full_name ?? (a?.username ? `@${a.username}` : "Unknown")}</p>
                    </div>
                    <button onClick={() => setPreview(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-none shrink-0"><X size={18} /></button>
                  </div>

                  <div className="px-6 py-5 space-y-5">
                    {preview.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview.image_url} alt={preview.title} className="w-full h-56 object-cover rounded-none border border-[#102C26]/10" />
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      {preview.cuisine && <span className="capitalize">{preview.cuisine}</span>}
                      {preview.difficulty && <span className="capitalize">· {preview.difficulty}</span>}
                      {(preview.prep_time_mins || preview.cook_time_mins) && (
                        <span className="inline-flex items-center gap-1"><Clock size={13} /> {(preview.prep_time_mins ?? 0) + (preview.cook_time_mins ?? 0)} min</span>
                      )}
                      {preview.servings && <span className="inline-flex items-center gap-1"><Users size={13} /> {preview.servings} servings</span>}
                    </div>

                    {preview.description && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{preview.description}</p>}

                    {ingredients.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Ingredients</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">{ingredients.map((l, i) => <li key={i}>{l}</li>)}</ul>
                      </div>
                    )}
                    {instructions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Instructions</p>
                        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-gray-700">{instructions.map((l, i) => <li key={i}>{l}</li>)}</ol>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
