"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChefHat, Sparkles, AlertCircle } from "lucide-react";
import type { RecipeSummary } from "@/types";
import { hubService } from "@/services/hubService";
import { cldUrl, CLD_AVATAR } from "@/lib/cldUrl";

const BG = "var(--hub-bg)";
const CREAM = "var(--hm-text)";
const SUBTLE = "var(--hm-text-subtle)";
const AMBER = "var(--hm-amber)";
const BORDER = "color-mix(in oklab, var(--hm-text) 9%, transparent)";

interface RecipePickerProps {
  userId: string;
  onSelect: (recipe: RecipeSummary) => void;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Choose the recipe a Recipe post shares: your own first (drafts included,
 * since that's where Assistant recipes land), or search published Kitchen
 * recipes by title.
 */
export default function RecipePicker({ userId, onSelect, invalid, describedBy }: RecipePickerProps) {
  const [query, setQuery] = useState("");
  const [own, setOwn] = useState<RecipeSummary[]>([]);
  const [community, setCommunity] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await hubService.getShareableRecipes(userId, query, controller.signal);
        if (controller.signal.aborted) return;
        setOwn(res.own);
        setCommunity(res.community);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 300 : 0);
    return () => { clearTimeout(t); controller.abort(); };
  }, [userId, query, attempt]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const empty = !loading && !error && own.length === 0 && community.length === 0;

  return (
    <div className="border" style={{ borderColor: invalid ? "rgb(248 113 113 / 0.6)" : BORDER, backgroundColor: BG }}>
      <div className="relative border-b" style={{ borderColor: BORDER }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: SUBTLE }} aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your recipes or Kitchen"
          aria-label="Search recipes"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="w-full bg-transparent pl-9 pr-3 py-3 text-base focus:outline-none"
          style={{ color: CREAM, caretColor: AMBER }}
        />
      </div>

      <div className="max-h-72 overflow-y-auto overscroll-contain" aria-live="polite" aria-busy={loading}>
        {loading && own.length === 0 && community.length === 0 ? (
          <ul className="p-2 space-y-1" aria-label="Loading recipes">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3 p-2">
                <div className="w-12 h-12 animate-pulse" style={{ backgroundColor: "color-mix(in oklab, var(--hm-text) 7%, transparent)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 animate-pulse" style={{ backgroundColor: "color-mix(in oklab, var(--hm-text) 7%, transparent)" }} />
                  <div className="h-3 w-1/3 animate-pulse" style={{ backgroundColor: "color-mix(in oklab, var(--hm-text) 4%, transparent)" }} />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="p-5 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-5 h-5 text-red-400" aria-hidden />
            <p className="text-sm" style={{ color: SUBTLE }}>Couldn&apos;t load recipes.</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 border border-[color-mix(in_oklab,var(--hm-text)_9%,transparent)] hover:border-(--hm-amber) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
              style={{ color: AMBER }}
            >
              Try again
            </button>
          </div>
        ) : empty ? (
          <div className="p-5 text-center space-y-2">
            <ChefHat className="w-6 h-6 mx-auto" style={{ color: AMBER }} aria-hidden />
            <p className="text-sm" style={{ color: CREAM }}>
              {query ? `No recipes match "${query}".` : "You haven't saved any recipes yet."}
            </p>
            {!query && (
              <p className="text-xs" style={{ color: SUBTLE }}>
                Ask the <Link href="/kitchen/ai-assistant" className="underline hover:text-(--hm-amber)">Assistant</Link> for one,{" "}
                <Link href="/kitchen/recipes/upload" className="underline hover:text-(--hm-amber)">upload your own</Link>, or search Kitchen above.
              </p>
            )}
          </div>
        ) : (
          <>
            <Section title="Your recipes" recipes={own} onSelect={onSelect} mine />
            <Section title="From Kitchen" recipes={community} onSelect={onSelect} />
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, recipes, onSelect, mine }: { title: string; recipes: RecipeSummary[]; onSelect: (r: RecipeSummary) => void; mine?: boolean }) {
  if (recipes.length === 0) return null;
  return (
    <div className="py-1">
      <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: SUBTLE }}>{title}</p>
      <ul>
        {recipes.map((r) => {
          const thumb = cldUrl(r.image_url, CLD_AVATAR);
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--hm-text)_4%,transparent)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--hm-amber)"
              >
                <span className="relative w-12 h-12 shrink-0 overflow-hidden flex items-center justify-center" style={{ backgroundColor: "color-mix(in oklab, var(--hm-amber) 8%, transparent)" }}>
                  {thumb ? <Image src={thumb} alt="" fill unoptimized sizes="48px" className="object-cover" /> : <ChefHat className="w-5 h-5" style={{ color: AMBER }} aria-hidden />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate" style={{ color: CREAM }}>{r.title}</span>
                  <span className="flex items-center gap-2 text-xs" style={{ color: SUBTLE }}>
                    {mine && !r.is_published && <span className="font-semibold uppercase tracking-wide">Draft</span>}
                    {r.is_ai_generated && <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3" aria-hidden />AI</span>}
                    {r.cuisine && <span className="capitalize truncate">{r.cuisine}</span>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
