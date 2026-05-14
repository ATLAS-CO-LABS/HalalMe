"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock, ChefHat, Search, Plus, ArrowLeft,
  Star, Users, Bookmark, Sparkles, Lock, Pencil, Trash2,
} from "lucide-react";
import { recipeService } from "@/services/recipeService";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useResumeKey } from "@/context/AppResumeContext";
import type { Recipe } from "@/types";

const BG      = '#1C1C1C';
const BG2     = '#161616';
const CREAM   = '#F7E7CE';
const MAGENTA = '#F03E9E';
const DEEP    = '#C41E73';

// Module-level cache - survives navigations within the same session
let _recipesCache: Recipe[] = [];

// ── Helpers ────────────────────────────────────────────────────────
function difficultyColor(d: string) {
  if (d === "easy")   return "text-green-400 bg-green-400/10";
  if (d === "medium") return "text-yellow-400 bg-yellow-400/10";
  return "text-red-400 bg-red-400/10";
}

function difficultyLabel(d: string) {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

function cookTimeLabel(mins: number | null) {
  if (!mins) return "-";
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`.trim() : `${mins} min`;
}

// ── Recipe card ────────────────────────────────────────────────────
function RecipeCard({
  recipe,
  index,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="relative group"
    >
      <Link href={`/kitchen/recipes/${recipe.id}`}>
        <motion.div
          className="overflow-hidden cursor-pointer transition-colors duration-300"
          style={{ backgroundColor: BG2, border: `1px solid ${CREAM}08` }}
          whileHover={{
            y: -4,
            borderColor: MAGENTA,
            boxShadow: `0 16px 40px -12px ${MAGENTA}40`,
          }}
        >
          {/* Image */}
          <div className="relative h-44 overflow-hidden" style={{ backgroundColor: '#080612' }}>
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority={index === 0}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-gray-600" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1.5">
              {recipe.is_ai_generated && (
                <span className="flex items-center gap-1 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5" style={{ backgroundColor: MAGENTA }}>
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
              {recipe.is_halal_verified && (
                <span className="text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 bg-emerald-600/90">
                  ✓ Halal
                </span>
              )}
            </div>

            {/* Rating */}
            {recipe.avg_rating && (
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-bold">{Number(recipe.avg_rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="text-sm font-extrabold uppercase tracking-tighter mb-1.5 line-clamp-1 transition-colors duration-300 group-hover:opacity-80" style={{ color: CREAM }}>
              {recipe.title}
            </h3>
            <p className="text-xs mb-3 line-clamp-2 font-normal" style={{ color: `${CREAM}50` }}>
              {recipe.description}
            </p>

            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: `${CREAM}50` }}>
                <Clock className="w-3.5 h-3.5" />
                <span>{cookTimeLabel(recipe.cook_time_mins)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: `${CREAM}50` }}>
                <Users className="w-3.5 h-3.5" />
                <span>{recipe.servings ?? "-"} servings</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {recipe.difficulty && (
                <span className={`px-2.5 py-0.5 text-xs font-semibold ${difficultyColor(recipe.difficulty)}`}>
                  {difficultyLabel(recipe.difficulty)}
                </span>
              )}
              <div className="flex items-center gap-1.5 ml-2 min-w-0">
                {recipe.profiles?.avatar_url ? (
                  <Image
                    src={recipe.profiles.avatar_url}
                    alt={recipe.profiles.username ?? ""}
                    width={18}
                    height={18}
                    className="rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${MAGENTA}, ${DEEP})` }}
                  >
                    <span className="text-[8px] font-bold text-white">
                      {(recipe.profiles?.username ?? "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-xs truncate" style={{ color: `${CREAM}30` }}>
                  {recipe.profiles?.username ?? "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Edit / Delete overlay - only rendered for My Recipes cards */}
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onEdit && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
              className="w-8 h-8 bg-black/70 backdrop-blur-sm border flex items-center justify-center text-white transition-colors"
              style={{ borderColor: `${CREAM}20` }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${MAGENTA}cc`; e.currentTarget.style.borderColor = MAGENTA; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'; e.currentTarget.style.borderColor = `${CREAM}20`; }}
              title="Edit recipe"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              className="w-8 h-8 bg-black/70 backdrop-blur-sm border flex items-center justify-center text-white hover:bg-red-600/80 hover:border-red-500 transition-colors"
              style={{ borderColor: `${CREAM}20` }}
              title="Delete recipe"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState({ tab, onUpload }: { tab: Tab; onUpload: () => void }) {
  if (tab === "mine") {
    return (
      <div className="text-center py-20">
        <Bookmark className="w-14 h-14 mx-auto mb-4" style={{ color: `${CREAM}15` }} />
        <h3 className="text-xl font-extrabold uppercase tracking-tighter mb-2" style={{ color: CREAM }}>
          No recipes yet
        </h3>
        <p className="text-sm mb-6" style={{ color: `${CREAM}50` }}>
          You haven&apos;t uploaded any recipes. Share your first halal creation!
        </p>
        <motion.button
          onClick={onUpload}
          className="inline-flex items-center gap-2 text-white px-6 py-3 font-extrabold uppercase tracking-tighter text-sm"
          style={{ backgroundColor: DEEP }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4" /> Upload your first recipe
        </motion.button>
      </div>
    );
  }
  if (tab === "saved") {
    return (
      <div className="text-center py-20">
        <Bookmark className="w-14 h-14 mx-auto mb-4" style={{ color: `${CREAM}15` }} />
        <h3 className="text-xl font-extrabold uppercase tracking-tighter mb-2" style={{ color: CREAM }}>
          No saved recipes
        </h3>
        <p className="text-sm" style={{ color: `${CREAM}50` }}>Tap the bookmark icon on any recipe to save it here.</p>
      </div>
    );
  }
  return (
    <div className="text-center py-20">
      <ChefHat className="w-14 h-14 mx-auto mb-4" style={{ color: `${CREAM}15` }} />
      <h3 className="text-xl font-extrabold uppercase tracking-tighter mb-2" style={{ color: CREAM }}>
        No recipes found
      </h3>
      <p className="text-sm" style={{ color: `${CREAM}50` }}>Try adjusting your search or filters.</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
type Tab = "all" | "mine" | "saved";

const CUISINES = ["All", "South Asian", "Middle Eastern", "Moroccan", "Turkish", "Mediterranean", "East Asian", "West African"];

function RecipesContent() {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const router = useRouter();
  const resumeKey = useResumeKey();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab]         = useState<Tab>(() => {
    const t = searchParams.get("tab");
    return t === "saved" ? "saved" : "all";
  });
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCuisine, setSelectedCuisine]       = useState("All");

  // Browse-all state - initialise from cache so back-navigation is instant
  const [allRecipes, setAllRecipes]       = useState<Recipe[]>(_recipesCache);
  const [allLoading, setAllLoading]       = useState(_recipesCache.length === 0);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(false);
  const [loadingMore, setLoadingMore]     = useState(false);

  // My-recipes state
  const [myRecipes, setMyRecipes]         = useState<Recipe[]>([]);
  const [myLoading, setMyLoading]         = useState(false);
  const [myLoaded, setMyLoaded]           = useState(false);

  // Saved recipes state
  const [savedRecipes, setSavedRecipes]   = useState<Recipe[]>([]);
  const [savedLoading, setSavedLoading]   = useState(false);
  const [savedLoaded, setSavedLoaded]     = useState(false);

  // Keep a ref to the latest filter values so loadAllRecipes can be called
  // from the resume effect without needing filters in its dependency array.
  const filtersRef = useRef({ searchQuery, selectedDifficulty, selectedCuisine });
  filtersRef.current = { searchQuery, selectedDifficulty, selectedCuisine };

  // ── Load browse-all from Supabase ─────────────────────────────
  const loadAllRecipes = useCallback(() => {
    const { searchQuery: sq, selectedDifficulty: sd, selectedCuisine: sc } = filtersRef.current;
    setAllLoading(true);
    setPage(1);
    recipeService
      .getRecipes({
        search: sq || undefined,
        difficulty: sd !== "All" ? sd.toLowerCase() : undefined,
        cuisine: sc !== "All" ? sc : undefined,
        page: 1,
      })
      .then(({ data, hasMore: more }) => { _recipesCache = data; setAllRecipes(data); setHasMore(more); })
      .catch((err) => { console.error("[recipes] getRecipes error:", err); })
      .finally(() => setAllLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadAllRecipes();
  }, [searchQuery, selectedDifficulty, selectedCuisine]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Refetch on app resume (BFCache / tab return / network restore) ──
  useEffect(() => {
    if (resumeKey === 0) return;
    _recipesCache = [];
    setMyLoaded(false);
    setSavedLoaded(false);
    if (activeTab === "all") {
      loadAllRecipes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeKey]);

  // ── Load more pages ───────────────────────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { data, hasMore: more } = await recipeService.getRecipes({
        search: searchQuery || undefined,
        difficulty: selectedDifficulty !== "All" ? selectedDifficulty.toLowerCase() : undefined,
        cuisine: selectedCuisine !== "All" ? selectedCuisine : undefined,
        page: nextPage,
      });
      setAllRecipes((prev) => {
        const existing = new Set(prev.map((r) => r.id));
        return [...prev, ...data.filter((r) => !existing.has(r.id))];
      });
      setPage(nextPage);
      setHasMore(more);
    } catch (err) {
      console.error("[recipes] loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, searchQuery, selectedDifficulty, selectedCuisine]);

  // ── Load my recipes when tab activates ────────────────────────
  const loadMyRecipes = useCallback(async () => {
    if (!user || myLoaded) return;
    setMyLoading(true);
    try {
      const { data } = await recipeService.getRecipes({ user_id: user.id });
      setMyRecipes(data);
      setMyLoaded(true);
    } catch (err) {
      console.error("[recipes] getMyRecipes error:", err);
      setMyLoaded(true);
    } finally {
      setMyLoading(false);
    }
  }, [user, myLoaded]);

  useEffect(() => {
    if (activeTab === "mine") loadMyRecipes();
  }, [activeTab, loadMyRecipes]);

  // ── Load saved (bookmarked) recipes when tab activates ─────────
  const loadSavedRecipes = useCallback(async () => {
    if (!user) return;
    setSavedLoading(true);
    try {
      const data = await recipeService.getFavorites(user.id);
      setSavedRecipes(data);
      setSavedLoaded(true);
    } catch (err) {
      console.error("[recipes] getSavedRecipes error:", err);
      setSavedLoaded(true);
    } finally {
      setSavedLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "saved") {
      setSavedLoaded(false); // always re-fetch when tab opens
      loadSavedRecipes();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Delete a recipe from My Recipes ──────────────────────────
  const handleDeleteRecipe = useCallback(async (recipeId: string) => {
    if (!window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) return;
    try {
      await recipeService.deleteRecipe(recipeId);
      setMyRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (err) {
      console.error("[recipes] deleteRecipe error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete recipe.");
    }
  }, []);

  // ── Client-side filter for browse-all ─────────────────────────
  const filteredAll = allRecipes;

  // ── Client-side filter for my recipes ────────────────────────
  const filteredMine = myRecipes.filter((r) => {
    const q = searchQuery.toLowerCase();
    return !q || r.title.toLowerCase().includes(q);
  });

  const filteredSaved = savedRecipes.filter((r) => {
    const q = searchQuery.toLowerCase();
    return !q || r.title.toLowerCase().includes(q);
  });

  const displayed = activeTab === "all" ? filteredAll : activeTab === "mine" ? filteredMine : filteredSaved;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="backdrop-blur-lg border-b sticky top-0 z-10"
        style={{ backgroundColor: `${BG}F5`, borderColor: `${CREAM}08` }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-5">

          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/kitchen">
                <motion.button
                  className="transition-colors"
                  style={{ color: `${CREAM}50` }}
                  onMouseEnter={e => e.currentTarget.style.color = CREAM}
                  onMouseLeave={e => e.currentTarget.style.color = `${CREAM}50`}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM }}>
                  {activeTab === "mine" ? "My Recipes" : activeTab === "saved" ? "Saved Recipes" : "Explore Recipes"}
                </h1>
                <p className="mt-0.5 text-sm font-normal" style={{ color: `${CREAM}45` }}>
                  {activeTab === "mine" ? "Manage your uploaded recipes" : activeTab === "saved" ? "Recipes you've bookmarked" : "Discover and share halal recipes"}
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => requireAuth(
                () => router.push("/kitchen/recipes/upload"),
                "Sign up to share your halal recipes",
              )}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-white px-6 py-2.5 font-extrabold uppercase tracking-tighter text-sm"
              style={{ backgroundColor: DEEP }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Plus className="w-4 h-4" /> Upload Recipe
            </motion.button>
          </div>

          {/* Tabs - underline style */}
          <div className="flex mb-4 border-b" style={{ borderColor: `${CREAM}08` }}>
            {(["all", "mine", "saved"] as Tab[]).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => {
                  if (tab === "mine") {
                    requireAuth(() => setActiveTab("mine"), "Sign in to see your recipes");
                  } else if (tab === "saved") {
                    requireAuth(() => setActiveTab("saved"), "Sign in to view saved recipes");
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className="relative px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.15em] transition-colors"
                style={{ color: activeTab === tab ? MAGENTA : `${CREAM}40` }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex items-center gap-1.5">
                  {(tab === "mine" || tab === "saved") && !user && <Lock className="w-3 h-3" />}
                  {tab === "all" ? "Browse All" : tab === "mine" ? "My Recipes" : "Saved"}
                  {tab === "mine" && myLoaded && myRecipes.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 font-bold" style={{ backgroundColor: `${MAGENTA}25`, color: MAGENTA }}>
                      {myRecipes.length}
                    </span>
                  )}
                  {tab === "saved" && savedLoaded && savedRecipes.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 font-bold" style={{ backgroundColor: `${MAGENTA}25`, color: MAGENTA }}>
                      {savedRecipes.length}
                    </span>
                  )}
                </span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: MAGENTA }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Search + difficulty filters */}
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${CREAM}35` }} />
              <input
                type="text"
                placeholder="Search recipes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-white text-sm pl-11 pr-5 py-2.5 border focus:outline-none transition-colors"
                style={{ backgroundColor: BG2, borderColor: `${CREAM}10`, caretColor: MAGENTA }}
                onFocus={e => e.target.style.borderColor = MAGENTA}
                onBlur={e => e.target.style.borderColor = `${CREAM}10`}
              />
            </div>
            {activeTab === "all" && (
              <div className="flex gap-1 overflow-x-auto scrollbar-hide shrink-0">
                {["All", "Easy", "Medium", "Hard"].map((d) => (
                  <motion.button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className="px-4 py-2 font-extrabold uppercase tracking-tighter whitespace-nowrap text-xs transition-all"
                    style={
                      selectedDifficulty === d
                        ? { backgroundColor: MAGENTA, color: 'white' }
                        : { backgroundColor: BG2, color: `${CREAM}45`, border: `1px solid ${CREAM}10` }
                    }
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  >
                    {d}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Cuisine filter - Browse All only */}
          {activeTab === "all" && (
            <div className="flex gap-1 overflow-x-auto scrollbar-hide mt-2 pb-0.5">
              {CUISINES.map((c) => (
                <motion.button
                  key={c}
                  onClick={() => setSelectedCuisine(c)}
                  className="px-3 py-1.5 font-bold uppercase tracking-tighter whitespace-nowrap text-[10px] transition-all"
                  style={
                    selectedCuisine === c
                      ? { backgroundColor: MAGENTA, color: 'white' }
                      : { backgroundColor: BG2, color: `${CREAM}35`, border: `1px solid ${CREAM}08` }
                  }
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                >
                  {c}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">

        {/* Session-expired edge case: user was on Mine/Saved tab and got signed out */}
        {(activeTab === "mine" || activeTab === "saved") && !user && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: `${CREAM}15` }} />
            <h3 className="text-xl font-extrabold uppercase tracking-tighter mb-2" style={{ color: CREAM }}>
              Sign in to see your recipes
            </h3>
            <p className="text-sm mb-6" style={{ color: `${CREAM}50` }}>
              Your uploaded and AI-generated recipes will appear here.
            </p>
            <motion.button
              onClick={() => requireAuth(
                () => setActiveTab(activeTab),
                activeTab === "mine" ? "Sign in to see your recipes" : "Sign in to view saved recipes",
              )}
              className="inline-flex items-center gap-2 text-white px-6 py-3 font-extrabold uppercase tracking-tighter text-sm"
              style={{ backgroundColor: DEEP }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Sign In
            </motion.button>
          </motion.div>
        )}

        {/* Loading skeleton - Browse All */}
        {allLoading && activeTab === "all" && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ gap: '1px', backgroundColor: `${CREAM}05` }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden animate-pulse" style={{ backgroundColor: BG2 }}>
                <div className="h-44" style={{ backgroundColor: '#080612' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4" style={{ backgroundColor: '#080612' }} />
                  <div className="h-3 w-full" style={{ backgroundColor: '#080612' }} />
                  <div className="h-3 w-1/2" style={{ backgroundColor: '#080612' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton - My Recipes / Saved */}
        {((myLoading && activeTab === "mine") || (savedLoading && activeTab === "saved")) && user && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ gap: '1px', backgroundColor: `${CREAM}05` }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden animate-pulse" style={{ backgroundColor: BG2 }}>
                <div className="h-44" style={{ backgroundColor: '#080612' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4" style={{ backgroundColor: '#080612' }} />
                  <div className="h-3 w-full" style={{ backgroundColor: '#080612' }} />
                  <div className="h-3 w-1/2" style={{ backgroundColor: '#080612' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipe grid */}
        {((!allLoading && activeTab === "all") ||
          (!myLoading && activeTab === "mine" && user) ||
          (!savedLoading && activeTab === "saved" && user)) && (
          <AnimatePresence mode="wait">
            {displayed.length === 0 ? (
              <EmptyState
                tab={activeTab}
                onUpload={() => requireAuth(() => router.push("/kitchen/recipes/upload"), "Sign up to share your halal recipes")}
              />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  style={{ gap: '1px', backgroundColor: `${CREAM}05` }}
                >
                  {displayed.map((recipe, i) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      index={i}
                      onEdit={activeTab === "mine" ? () => router.push(`/kitchen/recipes/upload?edit=${recipe.id}`) : undefined}
                      onDelete={activeTab === "mine" ? () => handleDeleteRecipe(recipe.id) : undefined}
                    />
                  ))}
                </div>

                {/* Load More - Browse All only */}
                {activeTab === "all" && hasMore && (
                  <div className="flex justify-center mt-10">
                    <motion.button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 border text-white px-8 py-3 font-extrabold uppercase tracking-tighter text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: BG2, borderColor: `${CREAM}10`, color: CREAM }}
                      onMouseEnter={e => !loadingMore && (e.currentTarget.style.borderColor = MAGENTA)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = `${CREAM}10`)}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    >
                      {loadingMore ? (
                        <>
                          <span
                            className="w-4 h-4 border-2 rounded-full animate-spin"
                            style={{ borderColor: `${CREAM}25`, borderTopColor: MAGENTA }}
                          />
                          Loading…
                        </>
                      ) : (
                        "Load More Recipes"
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense>
      <RecipesContent />
    </Suspense>
  );
}
