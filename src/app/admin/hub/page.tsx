"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search, AlertCircle, MessageSquare, FileText, MessagesSquare, Users,
  Image as ImageIcon, EyeOff, Eye, MoreVertical, Trash2, Loader2, TrendingUp,
  CheckSquare, X, Crown, Flag, RotateCcw, RefreshCw,
} from "lucide-react";
import { display } from "../_fonts";
import {
  fmtDateTime, useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge, Modal,
} from "../_ui";
import ReportsQueue from "../_ReportsQueue";

type Author = { id: string; full_name?: string; username?: string } | { id: string; full_name?: string; username?: string }[] | null;
function oneAuthor(a: Author) { return Array.isArray(a) ? a[0] : a; }

// Posts can carry video as well as images. Detect by extension or the
// Cloudinary video delivery path so we render a <video> player, not a broken <img>.
function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload");
}

interface PostRow {
  id: string;
  content: string;
  post_type: string;
  media_urls: string[] | null;
  is_published: boolean;
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  author: Author;
}
interface CommentRow {
  id: string;
  content: string;
  post_id: string;
  parent_id: string | null;
  like_count: number;
  created_at: string;
  author: Author;
}
interface PostStats { total: number; published: number; today: number; follows: number; }

const PUBLISHED_FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "unpublished", label: "Hidden" },
];
const POST_TYPE_TONE: Record<string, "blue" | "purple" | "amber" | "gray" | "green"> = {
  general: "blue", recipe: "purple", question: "amber", review: "green",
};

export default function HubPage() {
  const { toast, flash } = useToast();
  const [view, setView] = useState<"posts" | "comments" | "reported" | "deleted">("posts");
  // Bumping this tells the active sub-view to refetch (the header Refresh button).
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      <ToastView toast={toast} />

      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 pt-4 sm:pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-5 h-px bg-[#F59E0B]" />
              <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">Content Moderation</span>
            </div>
            <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Hub</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Moderate the community feed — posts and comments</p>
          </div>
          <button onClick={() => setReloadKey((k) => k + 1)} title="Refresh"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors shrink-0">
            <RefreshCw size={13} />
          </button>
        </div>

        <div className="flex items-center gap-0.5 mt-4 -mb-px">
          {([["posts", "Posts", FileText], ["comments", "Comments", MessagesSquare], ["reported", "Reported", Flag], ["deleted", "Trash", Trash2]] as const).map(([key, label, Icon]) => {
            const active = view === key;
            return (
              <button key={key} onClick={() => setView(key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${active ? "border-[#F59E0B] text-[#102C26]" : "border-transparent text-gray-500 hover:text-[#102C26]"}`}>
                <Icon size={15} className={active ? "text-[#F59E0B]" : ""} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5">
        {view === "posts" ? <PostsView flash={flash} reloadKey={reloadKey} />
          : view === "comments" ? <CommentsView flash={flash} reloadKey={reloadKey} />
          : view === "deleted" ? (
            <div className="space-y-8">
              <div>
                <h2 className={`${display.className} text-sm font-bold uppercase tracking-wide text-[#102C26]/70 mb-3`}>Deleted posts</h2>
                <PostsView flash={flash} deleted reloadKey={reloadKey} />
              </div>
              <div>
                <h2 className={`${display.className} text-sm font-bold uppercase tracking-wide text-[#102C26]/70 mb-3`}>Deleted comments</h2>
                <CommentsView flash={flash} deleted reloadKey={reloadKey} />
              </div>
            </div>
          )
          : <div className="space-y-5"><ReportsQueue type="post" /><ReportsQueue type="comment" /></div>}
      </div>
    </div>
  );
}

// ─── Posts ────────────────────────────────────────────────────────────────────
function PostsView({ flash, deleted = false, reloadKey = 0 }: { flash: (k: "ok" | "err", m: string) => void; deleted?: boolean; reloadKey?: number }) {
  const [rows, setRows] = useState<PostRow[]>([]);
  const [stats, setStats] = useState<PostStats | null>(null);
  const [types, setTypes] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("all");
  const [published, setPublished] = useState("all");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [topPosters, setTopPosters] = useState<{ id: string; name: string; posts: number }[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<string | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);

  const [menu, setMenu] = useState<{ post: PostRow; top: number; left: number } | null>(null);
  const [modal, setModal] = useState<PostRow | null>(null);
  const [modalBusy, setModalBusy] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [preview, setPreview] = useState<{ post: any; comments: any[] } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function openPreview(id: string) {
    setMenu(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/hub/posts/${id}`);
      if (!res.ok) throw new Error();
      setPreview(await res.json());
    } catch {
      flash("err", "Could not load post.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function fetchRows(p: number, t: string, pub: string, q: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) });
      if (deleted) params.set("deleted", "1");
      if (t !== "all") params.set("type", t);
      if (pub !== "all") params.set("published", pub);
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/hub/posts?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.posts); setStats(json.stats); setTotal(json.total);
      setPageSize(json.pageSize); setCanManage(!!json.canManage);
      setTopPosters(json.topPosters ?? []);
      // Canonical, complete type list from the API (mirrors the DB constraint).
      if (json.postTypes) setTypes(json.postTypes);
    } catch {
      setError("Could not load posts. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(page, type, published, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, type, published, deleted, reloadKey]);
  useEffect(() => { setPage(0); }, [type, published]);
  useEffect(() => { setSelectedIds(new Set()); setBulkDelete(false); }, [page, type, published, search]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleSelectAll() {
    if (selectedIds.size === rows.length && rows.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(rows.map((r) => r.id)));
  }
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  async function runBulk(action: "publish" | "unpublish" | "delete" | "restore" | "purge") {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(action);
    try {
      const res = await fetch("/api/admin/hub/posts/bulk", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json() as { updated: number };
      const verb = action === "delete" ? "moved to Trash" : action === "restore" ? "restored" : action === "purge" ? "permanently deleted" : "updated";
      flash("ok", `${json.updated} post${json.updated !== 1 ? "s" : ""} ${verb}.`);
      setSelectedIds(new Set()); setBulkDelete(false);
      fetchRows(page, type, published, search);
    } catch {
      flash("err", "Bulk action failed.");
    } finally {
      setBulkBusy(null);
    }
  }

  async function restoreOne(p: PostRow) {
    setMenu(null);
    const res = await fetch(`/api/admin/hub/posts/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }),
    });
    if (res.ok) { flash("ok", "Post restored."); fetchRows(page, type, published, search); }
    else flash("err", "Restore failed.");
  }

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
    searchTimer.current = setTimeout(() => { setPage(0); fetchRows(0, type, published, val); }, 300);
  }

  async function togglePublish(p: PostRow) {
    setMenu(null);
    const res = await fetch(`/api/admin/hub/posts/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_published: !p.is_published }),
    });
    if (res.ok) { flash("ok", p.is_published ? "Post hidden." : "Post published."); fetchRows(page, type, published, search); }
    else { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Update failed."); }
  }

  async function confirmDelete() {
    if (!modal) return;
    setModalBusy(true);
    try {
      const res = await fetch(`/api/admin/hub/posts/${modal.id}${deleted ? "?hard=1" : ""}`, { method: "DELETE" });
      if (res.ok) { flash("ok", deleted ? "Post permanently deleted." : "Post moved to Trash."); setModal(null); fetchRows(page, type, published, search); }
      else { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Delete failed."); }
    } finally {
      setModalBusy(false);
    }
  }

  function openMenu(e: React.MouseEvent, p: PostRow) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ post: p, top: rect.bottom + 4, left: Math.max(8, rect.right - 180) });
  }

  const typeFilters = [{ key: "all", label: "All types" }, ...types.map((t) => ({ key: t, label: t }))];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard label="Total Posts" value={stats?.total ?? "—"} sub="All posts" icon={FileText} tone="blue" />
        <StatCard label="Published" value={stats?.published ?? "—"} sub="Visible in feed" icon={Eye} tone="green" />
        <StatCard label="Posted Today" value={stats?.today ?? "—"} sub="Last 24 hours" icon={TrendingUp} tone="purple" />
        <StatCard label="Follow Connections" value={stats?.follows ?? "—"} sub="Across the network" icon={Users} tone="amber" />
      </div>

      {topPosters.length > 0 && (
        <div className="bg-white rounded-none border border-[#102C26]/12 p-4 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2.5 flex items-center gap-1.5"><Crown size={13} className="text-[#F59E0B]" /> Top posters</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {topPosters.map((u, i) => (
              <div key={u.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 tabular-nums">{i + 1}.</span>
                <span className="text-gray-800 truncate max-w-44" title={u.name}>{u.name}</span>
                <span className="text-gray-500 tabular-nums">· {u.posts} post{u.posts !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterPills options={PUBLISHED_FILTERS} value={published} onChange={setPublished} />
            {types.length > 0 && <><div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" /><FilterPills options={typeFilters} value={type} onChange={setType} /></>}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search post content or author…"
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
                {deleted ? (
                  <>
                    <button onClick={() => runBulk("restore")} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><RotateCcw size={14} /> Restore</button>
                    <button onClick={() => setBulkDelete((v) => !v)} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-white rounded-none text-sm font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"><Trash2 size={14} /> Delete forever</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => runBulk("publish")} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><Eye size={14} /> Publish</button>
                    <button onClick={() => runBulk("unpublish")} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><EyeOff size={14} /> Hide</button>
                    <button onClick={() => setBulkDelete((v) => !v)} disabled={!!bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-white rounded-none text-sm font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"><Trash2 size={14} /> Delete</button>
                  </>
                )}
              </div>
            </div>
            {bulkDelete && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-white/80 text-sm">
                  {deleted
                    ? `Permanently delete ${selectedIds.size} post${selectedIds.size !== 1 ? "s" : ""} and all their comments/likes? This can't be undone.`
                    : `Move ${selectedIds.size} post${selectedIds.size !== 1 ? "s" : ""} to Trash? You can restore them later.`}
                </span>
                <button onClick={() => runBulk(deleted ? "purge" : "delete")} disabled={!!bulkBusy}
                  className="px-4 py-2 bg-[#F7E7CE] text-[#102C26] rounded-none text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50">
                  {bulkBusy ? "Working…" : deleted ? "Delete forever" : "Move to Trash"}
                </button>
              </div>
            )}
          </div>
        )}

        {error ? (
          <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No posts found" hint="Posts from the community feed will appear here for moderation." />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#102C26]/8">
              {rows.map((p) => {
                const a = oneAuthor(p.author);
                const authorName = a?.full_name ?? (a?.username ? `@${a.username}` : "—");
                const hasMedia = (p.media_urls?.length ?? 0) > 0;
                const sel = selectedIds.has(p.id);
                return (
                  <div key={p.id} className={`px-4 py-4 ${sel ? "bg-[#102C26]/3" : ""}`}>
                    <div className="flex items-start gap-3">
                      {canManage && (
                        <div className="flex items-center justify-center w-6 h-6 shrink-0 mt-1" onClick={() => toggleSelect(p.id)}>
                          <input type="checkbox" checked={sel} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openPreview(p.id)}>
                        <div className="flex items-start gap-1.5">
                          {hasMedia && <ImageIcon size={13} className="text-gray-400 shrink-0 mt-0.5" />}
                          <p className={`line-clamp-2 text-[15px] ${p.is_published ? "text-gray-900" : "text-gray-400"}`}>{p.content?.trim() || <span className="italic text-gray-400">(no text)</span>}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap mt-2">
                          <Badge label={p.post_type} tone={POST_TYPE_TONE[p.post_type] ?? "gray"} />
                          {!p.is_published && <Badge label="Hidden" tone="gray" />}
                          <span className="text-[10px] text-gray-600">{authorName} · {p.like_count} ♥ · {p.comment_count} 💬</span>
                        </div>
                      </div>
                      {canManage && (
                        <button onClick={(e) => openMenu(e, p)} title="Actions"
                          className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-none text-gray-500 hover:bg-[#102C26] hover:text-white transition-all"><MoreVertical size={15} /></button>
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
                  <th className={`px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 ${canManage ? "" : "pl-4 lg:pl-5"}`}>Post</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Author</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Type</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Engagement</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden xl:table-cell">Posted</th>
                  <th className="px-4 lg:px-5 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102C26]/8">
                {rows.map((p) => {
                  const a = oneAuthor(p.author);
                  const authorName = a?.full_name ?? (a?.username ? `@${a.username}` : "—");
                  const hasMedia = (p.media_urls?.length ?? 0) > 0;
                  const sel = selectedIds.has(p.id);
                  return (
                    <tr key={p.id} onClick={() => openPreview(p.id)} className={`group cursor-pointer transition-colors ${sel ? "bg-[#102C26]/3" : "hover:bg-[#102C26]/2"}`}>
                      {canManage && (
                        <td className="pl-4 lg:pl-5 pr-2 py-3.5 w-10" onClick={(e) => { e.stopPropagation(); toggleSelect(p.id); }}>
                          <div className="flex items-center justify-center h-full">
                            <input type="checkbox" checked={sel} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                          </div>
                        </td>
                      )}
                      <td className={`px-2 py-3.5 ${canManage ? "" : "pl-4 lg:pl-5"}`}>
                        <div className="flex items-start gap-1.5">
                          {hasMedia && <ImageIcon size={13} className="text-gray-400 shrink-0 mt-0.5" />}
                          <p title={p.content?.trim() || undefined} className={`line-clamp-2 max-w-72 ${p.is_published ? "text-gray-900" : "text-gray-400"}`}>{p.content?.trim() || <span className="italic text-gray-400">(no text)</span>}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-gray-700 truncate max-w-40" title={authorName}>{authorName}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge label={p.post_type} tone={POST_TYPE_TONE[p.post_type] ?? "gray"} />
                          {!p.is_published && <Badge label="Hidden" tone="gray" />}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell tabular-nums text-gray-600 whitespace-nowrap">{p.like_count} ♥ · {p.comment_count} 💬</td>
                      <td className="px-4 py-3.5 hidden xl:table-cell text-gray-600 whitespace-nowrap">{fmtDateTime(p.created_at)}</td>
                      <td className="px-4 lg:px-5 py-3.5 text-right">
                        {canManage && (
                          <button onClick={(e) => openMenu(e, p)} title="Actions"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-[#102C26] hover:text-white transition-all"><MoreVertical size={15} /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} noun="post" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} onPageSize={(s) => { setPageSize(s); setPage(0); }} onJump={(p) => setPage(p)} />
          </>
        )}
      </div>

      {menu && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: menu.top, left: menu.left, width: 180 }}
          className="z-50 bg-white border border-[#102C26]/15 shadow-xl rounded-none py-1 text-sm">
          <button onClick={() => openPreview(menu.post.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"><FileText size={14} className="text-gray-500" /> View post</button>
          <div className="my-1 h-px bg-gray-100" />
          {deleted ? (
            <>
              <button onClick={() => restoreOne(menu.post)} className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"><RotateCcw size={14} className="text-gray-500" /> Restore</button>
              <button onClick={() => { setModal(menu.post); setMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-red-700 hover:bg-red-50 transition-colors"><Trash2 size={14} /> Delete forever</button>
            </>
          ) : (
            <>
              <button onClick={() => togglePublish(menu.post)} className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                {menu.post.is_published ? <EyeOff size={14} className="text-gray-500" /> : <Eye size={14} className="text-gray-500" />}
                {menu.post.is_published ? "Unpublish" : "Publish"}
              </button>
              <div className="my-1 h-px bg-gray-100" />
              <button onClick={() => { setModal(menu.post); setMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-red-700 hover:bg-red-50 transition-colors"><Trash2 size={14} /> Delete</button>
            </>
          )}
        </div>
      )}

      {modal && (
        <Modal open busy={modalBusy} onClose={() => setModal(null)} labelledBy="post-del-title" describedBy="post-del-desc" className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-none flex items-center justify-center shrink-0 bg-red-50 text-red-600"><Trash2 size={18} /></div>
            <div className="min-w-0">
              <h3 id="post-del-title" className={`${display.className} text-lg font-bold text-[#102C26]`}>{deleted ? "Delete forever?" : "Move to Trash?"}</h3>
              <p id="post-del-desc" className="text-sm text-gray-600 mt-1">
                {deleted
                  ? "This permanently removes the post and all its comments, likes and bookmarks. This cannot be undone."
                  : "The post will be hidden from the feed and moved to Trash. You can restore it later."}
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button onClick={() => setModal(null)} disabled={modalBusy} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
            <button onClick={confirmDelete} disabled={modalBusy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white rounded-none disabled:opacity-50 bg-red-600 hover:bg-red-700 transition-colors">
              {modalBusy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} {deleted ? "Delete forever" : "Move to Trash"}
            </button>
          </div>
        </Modal>
      )}

      {/* Post preview */}
      {(preview || previewLoading) && (
        <Modal open onClose={() => setPreview(null)} maxWidth="max-w-lg" className="max-h-[90vh] overflow-y-auto">
            {previewLoading || !preview ? (
              <div className="flex items-center justify-center py-24"><Loader2 size={26} className="animate-spin text-[#102C26]/40" /></div>
            ) : (() => {
              const a = oneAuthor(preview.post.author);
              const media: string[] = Array.isArray(preview.post.media_urls) ? preview.post.media_urls : [];
              return (
                <>
                  <div className="sticky top-0 bg-white border-b border-[#102C26]/10 px-6 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <Badge label={preview.post.post_type} tone={POST_TYPE_TONE[preview.post.post_type] ?? "gray"} />
                        {!preview.post.is_published && <Badge label="Hidden" tone="gray" />}
                      </div>
                      <h3 className={`${display.className} text-base font-bold text-[#102C26]`}>{a?.full_name ?? (a?.username ? `@${a.username}` : "Unknown")}</h3>
                      <p className="text-xs text-gray-600">{fmtDateTime(preview.post.created_at)} · {preview.post.like_count} ♥ · {preview.post.comment_count} 💬 · {preview.post.view_count} views</p>
                    </div>
                    <button onClick={() => setPreview(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-none shrink-0"><X size={18} /></button>
                  </div>

                  <div className="px-6 py-5 space-y-4">
                    {preview.post.content?.trim() && <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{preview.post.content}</p>}
                    {media.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {media.map((url, i) => (
                          isVideoUrl(url) ? (
                            <video key={i} src={url} controls playsInline className="w-full h-40 object-cover rounded-none border border-[#102C26]/10 bg-black col-span-2" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={url} alt={`media ${i + 1}`} className="w-full h-40 object-cover rounded-none border border-[#102C26]/10" />
                          )
                        ))}
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Recent comments</p>
                      {preview.comments.length === 0 ? (
                        <p className="text-sm text-gray-500">No comments.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {preview.comments.map((c) => {
                            const ca = oneAuthor(c.author);
                            return (
                              <div key={c.id} className="border-l-2 border-[#102C26]/10 pl-3">
                                <p className="text-xs font-semibold text-gray-700">{ca?.full_name ?? (ca?.username ? `@${ca.username}` : "Unknown")}</p>
                                <p className="text-sm text-gray-700">{c.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
        </Modal>
      )}
    </>
  );
}

// ─── Comments ───────────────────────────────────────────────────────────────
function CommentsView({ flash, deleted = false, reloadKey = 0 }: { flash: (k: "ok" | "err", m: string) => void; deleted?: boolean; reloadKey?: number }) {
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDelete, setBulkDelete] = useState(false);

  const [modal, setModal] = useState<CommentRow | null>(null);
  const [modalBusy, setModalBusy] = useState(false);

  async function fetchRows(p: number, q: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) });
      if (deleted) params.set("deleted", "1");
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/hub/comments?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.comments); setTotal(json.total); setTotalComments(json.totalComments);
      setPageSize(json.pageSize); setCanManage(!!json.canManage);
    } catch {
      setError("Could not load comments. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, deleted, reloadKey]);
  useEffect(() => { setSelectedIds(new Set()); setBulkDelete(false); }, [page, search]);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); fetchRows(0, val); }, 300);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleSelectAll() {
    if (selectedIds.size === rows.length && rows.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(rows.map((r) => r.id)));
  }
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  async function runBulk(action: "delete" | "restore" | "purge") {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/hub/comments/bulk", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json() as { updated: number };
      const verb = action === "delete" ? "moved to Trash" : action === "restore" ? "restored" : "permanently deleted";
      flash("ok", `${json.updated} comment${json.updated !== 1 ? "s" : ""} ${verb}.`);
      setSelectedIds(new Set()); setBulkDelete(false);
      fetchRows(page, search);
    } catch {
      flash("err", "Bulk action failed.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function restoreOne(c: CommentRow) {
    const res = await fetch(`/api/admin/hub/comments/${c.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }),
    });
    if (res.ok) { flash("ok", "Comment restored."); fetchRows(page, search); }
    else flash("err", "Restore failed.");
  }

  async function confirmDelete() {
    if (!modal) return;
    setModalBusy(true);
    try {
      const res = await fetch(`/api/admin/hub/comments/${modal.id}${deleted ? "?hard=1" : ""}`, { method: "DELETE" });
      if (res.ok) { flash("ok", deleted ? "Comment permanently deleted." : "Comment moved to Trash."); setModal(null); fetchRows(page, search); }
      else { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Delete failed."); }
    } finally {
      setModalBusy(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 max-w-md">
        <StatCard label="Total Comments" value={totalComments || "—"} sub="Across all posts" icon={MessagesSquare} tone="blue" />
        <StatCard label="On This Page" value={rows.length || "—"} sub={`of ${total.toLocaleString()}`} icon={MessageSquare} tone="purple" />
      </div>

      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search comment content or author…"
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
                {deleted && (
                  <button onClick={() => runBulk("restore")} disabled={bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><RotateCcw size={14} /> Restore</button>
                )}
                <button onClick={() => setBulkDelete((v) => !v)} disabled={bulkBusy} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-white rounded-none text-sm font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"><Trash2 size={14} /> {deleted ? "Delete forever" : "Delete"}</button>
              </div>
            </div>
            {bulkDelete && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-white/80 text-sm">
                  {deleted
                    ? `Permanently delete ${selectedIds.size} comment${selectedIds.size !== 1 ? "s" : ""} (and any replies)? This can't be undone.`
                    : `Move ${selectedIds.size} comment${selectedIds.size !== 1 ? "s" : ""} to Trash? You can restore them later.`}
                </span>
                <button onClick={() => runBulk(deleted ? "purge" : "delete")} disabled={bulkBusy}
                  className="px-4 py-2 bg-[#F7E7CE] text-[#102C26] rounded-none text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50">
                  {bulkBusy ? "Working…" : deleted ? "Delete forever" : "Move to Trash"}
                </button>
              </div>
            )}
          </div>
        )}

        {error ? (
          <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={MessagesSquare} title="No comments found" hint="Comments left on posts will appear here for moderation." />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#102C26]/8">
              {rows.map((c) => {
                const a = oneAuthor(c.author);
                const authorName = a?.full_name ?? (a?.username ? `@${a.username}` : "—");
                const sel = selectedIds.has(c.id);
                return (
                  <div key={c.id} className={`px-4 py-4 ${sel ? "bg-[#102C26]/3" : ""}`}>
                    <div className="flex items-start gap-3">
                      {canManage && (
                        <div className="flex items-center justify-center w-6 h-6 shrink-0 mt-1" onClick={() => toggleSelect(c.id)}>
                          <input type="checkbox" checked={sel} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 line-clamp-2 text-[15px]">{c.content}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          {c.parent_id && <Badge label="Reply" tone="gray" />}
                          <span className="text-[10px] text-gray-600">{authorName} · {c.like_count} ♥ · {fmtDateTime(c.created_at)}</span>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-1 shrink-0">
                          {deleted && (
                            <button onClick={() => restoreOne(c)} title="Restore"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-[#102C26] hover:text-white transition-all"><RotateCcw size={15} /></button>
                          )}
                          <button onClick={() => setModal(c)} title={deleted ? "Delete forever" : "Delete"}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={15} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                  {canManage && (
                    <th className="pl-4 lg:pl-5 pr-2 py-3 w-10 cursor-pointer" onClick={toggleSelectAll} title="Select / deselect page">
                      <div className="flex items-center justify-center">
                        <input type="checkbox" checked={allSelected} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                      </div>
                    </th>
                  )}
                  <th className={`px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 ${canManage ? "" : "pl-4 lg:pl-5"}`}>Comment</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Author</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Reply?</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden xl:table-cell">Likes</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden xl:table-cell">Posted</th>
                  <th className="px-4 lg:px-5 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102C26]/8">
                {rows.map((c) => {
                  const a = oneAuthor(c.author);
                  const authorName = a?.full_name ?? (a?.username ? `@${a.username}` : "—");
                  const sel = selectedIds.has(c.id);
                  return (
                    <tr key={c.id} className={`group transition-colors ${sel ? "bg-[#102C26]/3" : "hover:bg-[#102C26]/2"}`}>
                      {canManage && (
                        <td className="pl-4 lg:pl-5 pr-2 py-3.5 w-10" onClick={() => toggleSelect(c.id)}>
                          <div className="flex items-center justify-center h-full">
                            <input type="checkbox" checked={sel} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                          </div>
                        </td>
                      )}
                      <td className={`px-2 py-3.5 ${canManage ? "" : "pl-4 lg:pl-5"}`}><p title={c.content} className="text-gray-900 line-clamp-2 max-w-80">{c.content}</p></td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-gray-700 truncate max-w-40" title={authorName}>{authorName}</td>
                      <td className="px-4 py-3.5 hidden md:table-cell">{c.parent_id ? <Badge label="Reply" tone="gray" /> : <span className="text-gray-400">—</span>}</td>
                      <td className="px-4 py-3.5 text-right hidden xl:table-cell tabular-nums text-gray-600">{c.like_count}</td>
                      <td className="px-4 py-3.5 hidden xl:table-cell text-gray-600 whitespace-nowrap">{fmtDateTime(c.created_at)}</td>
                      <td className="px-4 lg:px-5 py-3.5 text-right">
                        {canManage && (
                          <div className="inline-flex items-center gap-1">
                            {deleted && (
                              <button onClick={() => restoreOne(c)} title="Restore"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-[#102C26] hover:text-white transition-all"><RotateCcw size={15} /></button>
                            )}
                            <button onClick={() => setModal(c)} title={deleted ? "Delete forever" : "Delete"}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={15} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} noun="comment" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} onPageSize={(s) => { setPageSize(s); setPage(0); }} onJump={(p) => setPage(p)} />
          </>
        )}
      </div>

      {modal && (
        <Modal open busy={modalBusy} onClose={() => setModal(null)} labelledBy="comment-del-title" describedBy="comment-del-desc" className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-none flex items-center justify-center shrink-0 bg-red-50 text-red-600"><Trash2 size={18} /></div>
            <div className="min-w-0">
              <h3 id="comment-del-title" className={`${display.className} text-lg font-bold text-[#102C26]`}>{deleted ? "Delete forever?" : "Move to Trash?"}</h3>
              <p id="comment-del-desc" className="text-sm text-gray-600 mt-1 wrap-break-word">&ldquo;{modal.content.slice(0, 120)}{modal.content.length > 120 ? "…" : ""}&rdquo;</p>
              <p className="text-xs text-gray-500 mt-1.5">{deleted ? "This permanently removes the comment and any replies. This cannot be undone." : "The comment will be hidden and moved to Trash. You can restore it later."}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button onClick={() => setModal(null)} disabled={modalBusy} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
            <button onClick={confirmDelete} disabled={modalBusy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white rounded-none disabled:opacity-50 bg-red-600 hover:bg-red-700 transition-colors">
              {modalBusy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} {deleted ? "Delete forever" : "Move to Trash"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
