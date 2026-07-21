"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Users, Store, LifeBuoy, Heart, CornerDownLeft } from "lucide-react";
import { Z } from "./_ui";

type Hit = { type: "user" | "merchant" | "ticket" | "charity"; id: string; label: string; sub: string | null; href: string };

const TYPE_META: Record<Hit["type"], { icon: React.ElementType; label: string }> = {
  user: { icon: Users, label: "Users" },
  merchant: { icon: Store, label: "Merchants" },
  ticket: { icon: LifeBuoy, label: "Tickets" },
  charity: { icon: Heart, label: "Charities" },
};
const TYPE_ORDER: Hit["type"][] = ["user", "merchant", "ticket", "charity"];

// Global ⌘K / Ctrl-K command palette: cross-module record search (users,
// merchants, tickets, charities) that jumps straight to a record's page.
// Mounted once by the admin layout.
export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  // Open on ⌘K / Ctrl-K (and "/" when not typing); toggle.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    // Also openable from a UI trigger (sidebar / mobile bar) via a custom event.
    const onTrigger = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("admin:search", onTrigger);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("admin:search", onTrigger);
    };
  }, []);

  // Reset + focus when opened/closed.
  useEffect(() => {
    if (open) {
      setQ(""); setHits([]); setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced search.
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (debounce.current) clearTimeout(debounce.current);
    if (term.length < 2) { setHits([]); setLoading(false); return; }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      const id = ++reqId.current;
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`);
        const json = await res.json();
        if (id === reqId.current) { setHits(res.ok ? (json.results ?? []) : []); setActive(0); }
      } catch {
        if (id === reqId.current) setHits([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 200);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [q, open]);

  const go = useCallback((hit: Hit) => {
    setOpen(false);
    router.push(hit.href);
  }, [router]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && hits[active]) { e.preventDefault(); go(hits[active]); }
  }

  if (!open) return null;

  // Group hits by type, preserving a flat index for keyboard selection.
  let flatIndex = -1;

  return (
    <div className={`fixed inset-0 ${Z.modal} bg-black/40 flex items-start justify-center p-4 pt-[12vh]`} onClick={() => setOpen(false)}>
      <div
        role="dialog" aria-modal="true" aria-label="Search"
        className="bg-white rounded-none border border-[#102C26]/15 shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2.5 px-4 border-b border-[#102C26]/10">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users, merchants, tickets, charities…"
            className="flex-1 py-3.5 text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
          />
          {loading && <Loader2 size={15} className="animate-spin text-gray-400 shrink-0" />}
          <kbd className="hidden sm:inline text-[10px] font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">ESC</kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto overscroll-contain">
          {q.trim().length < 2 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">Type at least 2 characters to search across the platform.</p>
          ) : hits.length === 0 && !loading ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">No matches for &ldquo;{q.trim()}&rdquo;.</p>
          ) : (
            TYPE_ORDER.map((type) => {
              const group = hits.filter((h) => h.type === type);
              if (group.length === 0) return null;
              const Meta = TYPE_META[type];
              return (
                <div key={type} className="py-1.5">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">{Meta.label}</p>
                  {group.map((h) => {
                    flatIndex++;
                    const idx = flatIndex;
                    const isActive = idx === active;
                    const Icon = Meta.icon;
                    return (
                      <button
                        key={`${h.type}-${h.id}`}
                        onClick={() => go(h)}
                        onMouseEnter={() => setActive(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? "bg-[#102C26]/8" : "hover:bg-gray-50"}`}
                      >
                        <span className="w-8 h-8 rounded-none bg-[#102C26]/6 flex items-center justify-center shrink-0"><Icon size={14} className="text-[#102C26]/70" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-900 truncate">{h.label}</span>
                          {h.sub && <span className="block text-xs text-gray-500 truncate">{h.sub}</span>}
                        </span>
                        {isActive && <CornerDownLeft size={13} className="text-gray-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
