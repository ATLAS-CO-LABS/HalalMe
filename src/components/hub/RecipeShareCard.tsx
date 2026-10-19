"use client";

import Image from "next/image";
import Link from "next/link";
import { ChefHat, Clock, Users, Sparkles, ArrowUpRight, Lock } from "lucide-react";
import type { RecipeSummary } from "@/types";
import { cldUrl, CLD_RECIPE_CARD } from "@/lib/cldUrl";

const CREAM = "var(--hm-text)";
const SUBTLE = "var(--hm-text-subtle)";
const AMBER = "var(--hm-amber)";
const BORDER = "color-mix(in oklab, var(--hm-text) 9%, transparent)";

interface RecipeShareCardProps {
  /** null = the post points at a recipe that was deleted or made private. */
  recipe: RecipeSummary | null;
  /** "link" (feed, detail) navigates to the recipe; "static" is the composer preview. */
  mode?: "link" | "static";
  /** Smaller, for link previews under text posts. */
  compact?: boolean;
}

function totalTime(r: RecipeSummary): string | null {
  const mins = (r.prep_time_mins ?? 0) + (r.cook_time_mins ?? 0);
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/**
 * The recipe a Social post shares: photo, title, time, servings and the first
 * few ingredients, linking to the full recipe in Kitchen.
 *
 * The whole card is one <Link> with no buttons inside it. A nested interactive
 * element inside an anchor is invalid HTML and is exactly the kind of thing that
 * makes clicks land on the wrong target.
 */
export default function RecipeShareCard({ recipe, mode = "link", compact = false }: RecipeShareCardProps) {
  if (!recipe) {
    return (
      <div className="flex items-center gap-3 border px-4 py-3 text-sm" style={{ borderColor: BORDER, color: SUBTLE }}>
        <Lock className="w-4 h-4 shrink-0" aria-hidden />
        This recipe is no longer available.
      </div>
    );
  }

  const time = totalTime(recipe);
  const image = cldUrl(recipe.image_url, CLD_RECIPE_CARD);
  const preview = recipe.ingredient_names.slice(0, compact ? 3 : 4);
  const more = recipe.ingredient_count - preview.length;

  const body = (
    <div className={`flex ${compact ? "gap-3" : "flex-col sm:flex-row"} items-stretch`}>
      <div
        className={`relative shrink-0 overflow-hidden ${
          compact ? "w-20 h-20"
          : image ? "w-full sm:w-44 aspect-4/3 sm:aspect-auto sm:min-h-36"
          // No photo: a slim icon strip, not a big empty block.
          : "w-full h-16 sm:w-24 sm:h-auto"
        }`}
        style={{ backgroundColor: "color-mix(in oklab, var(--hm-amber) 8%, transparent)" }}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            unoptimized
            sizes={compact ? "80px" : "(min-width: 640px) 176px, 100vw"}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className={compact ? "w-6 h-6" : "w-9 h-9"} style={{ color: AMBER }} aria-hidden />
          </div>
        )}
      </div>

      <div className={`flex-1 min-w-0 ${compact ? "py-0.5 pr-2" : "p-4"}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: AMBER }}>
            Recipe
          </span>
          {recipe.is_ai_generated && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: SUBTLE }}>
              <Sparkles className="w-3 h-3" aria-hidden /> AI-assisted
            </span>
          )}
        </div>

        <h4
          className={`font-extrabold leading-snug ${compact ? "text-sm line-clamp-2" : "text-base md:text-lg line-clamp-2"}`}
          style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
        >
          {recipe.title}
        </h4>

        {(time || recipe.servings || recipe.cuisine) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: SUBTLE }}>
            {time && <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden />{time}</span>}
            {recipe.servings ? <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" aria-hidden />Serves {recipe.servings}</span> : null}
            {recipe.cuisine && !compact && <span className="capitalize">{recipe.cuisine}</span>}
          </div>
        )}

        {!compact && preview.length > 0 && (
          <p className="mt-2.5 text-sm leading-relaxed line-clamp-2" style={{ color: "var(--hm-text-muted)" }}>
            <span className="sr-only">Ingredients: </span>
            {preview.join(", ")}
            {more > 0 && <span style={{ color: SUBTLE }}>{` and ${more} more`}</span>}
          </p>
        )}

        {mode === "link" && !compact && (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide" style={{ color: AMBER }}>
            View full recipe <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );

  // Border colour in a class (not inline) so hover:border can override it.
  const frame = "group block overflow-hidden border border-[color-mix(in_oklab,var(--hm-amber)_22%,transparent)] transition-colors";
  const frameStyle = {
    backgroundColor: "color-mix(in oklab, var(--hm-amber) 4%, transparent)",
  };

  if (mode === "static") {
    return <div className={frame} style={frameStyle}>{body}</div>;
  }

  return (
    <Link
      href={`/kitchen/recipes/${recipe.id}`}
      className={`${frame} hover:border-(--hm-amber) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)`}
      style={frameStyle}
      aria-label={`View recipe: ${recipe.title}`}
    >
      {body}
    </Link>
  );
}
