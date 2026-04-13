"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock, ChefHat, Search, Plus, ArrowLeft,
  Star, Users, Bookmark, Sparkles, Lock, Pencil, Trash2,
} from "lucide-react";
import { recipeService } from "@/services/recipeService";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import type { Recipe } from "@/types";

// Module-level cache — survives navigations within the same session
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
  if (!mins) return "—";
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
          className="bg-[#130F1F] rounded-2xl overflow-hidden border border-white/8 hover:border-fuchsia-500 transition-all cursor-pointer"
          whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(217,70,239,0.25)" }}
        >
          {/* Image */}
          <div className="relative h-44 bg-[#0C0918] overflow-hidden">
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                // First card is above the fold and the likely LCP element.
                // priority removes lazy loading so the browser fetches it immediately.
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
                <span className="flex items-center gap-1 bg-fuchsia-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
              {recipe.is_halal_verified && (
                <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Halal
                </span>
              )}
            </div>

            {/* Rating */}
            {recipe.avg_rating && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-semibold">{Number(recipe.avg_rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3
              className="text-base font-bold text-white mb-1.5 line-clamp-1 group-hover:text-fuchsia-400 transition-colors"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {recipe.title}
            </h3>
            <p className="text-[#F7E7CE]/60 text-xs mb-3 line-clamp-2 font-normal" style={{ fontFamily: "var(--font-body)" }}>
              {recipe.description}
            </p>

            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-[#F7E7CE]/60 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{cookTimeLabel(recipe.cook_time_mins)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F7E7CE]/60 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span>{recipe.servings ?? "—"} servings</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {recipe.difficulty && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${difficultyColor(recipe.difficulty)}`}>
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
                  <div className="w-[18px] h-[18px] rounded-full bg-linear-to-br from-fuchsia-600 to-pink-600 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-white">
                      {(recipe.profiles?.username ?? "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-white/30 text-xs truncate" style={{ fontFamily: "var(--font-body)" }}>
                  {recipe.profiles?.username ?? "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Edit / Delete overlay — only rendered for My Recipes cards */}
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onEdit && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
              className="w-8 h-8 bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-fuchsia-600/80 hover:border-fuchsia-500 transition-colors"
              title="Edit recipe"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              className="w-8 h-8 bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-red-600/80 hover:border-red-500 transition-colors"
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
        <Bookmark className="w-14 h-14 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-headline)" }}>
          No recipes yet
        </h3>
        <p className="text-gray-400 text-sm mb-6">You haven&apos;t uploaded any recipes. Share your first halal creation!</p>
        <motion.button
          onClick={onUpload}
          className="inline-flex items-center gap-2 bg-linear-to-br from-fuchsia-600 to-pink-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        >
          <Plus className="w-4 h-4" /> Upload your first recipe
        </motion.button>
      </div>
    );
  }
  if (tab === "saved") {
    return (
      <div className="text-center py-20">
        <Bookmark className="w-14 h-14 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-headline)" }}>
          No saved recipes
        </h3>
        <p className="text-gray-400 text-sm">Tap the bookmark icon on any recipe to save it here.</p>
      </div>
    );
  }
  return (
    <div className="text-center py-20">
      <ChefHat className="w-14 h-14 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-headline)" }}>
        No recipes found
      </h3>
      <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
type Tab = "all" | "mine" | "saved";

const CUISINES = ["All", "South Asian", "Middle Eastern", "Moroccan", "Turkish", "Mediterranean", "East Asian", "West African"];

export default function RecipesPage() {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const router = useRouter();

  const [activeTab, setActiveTab]         = useState<Tab>("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCuisine, setSelectedCuisine]       = useState("All");

  // Browse-all state — initialise from cache so back-navigation is instant
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

  // ── Load browse-all from Supabase ─────────────────────────────
  useEffect(() => {
    setAllLoading(true);
    setPage(1);
    recipeService
      .getRecipes({
        search: searchQuery || undefined,
        difficulty: selectedDifficulty !== "All" ? selectedDifficulty.toLowerCase() : undefined,
        cuisine: selectedCuisine !== "All" ? selectedCuisine : undefined,
        page: 1,
      })
      .then(({ data, hasMore: more }) => { _recipesCache = data; setAllRecipes(data); setHasMore(more); })
      .catch((err) => { console.error("[recipes] getRecipes error:", err); })
      .finally(() => setAllLoading(false));
  }, [searchQuery, selectedDifficulty, selectedCuisine]);

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
  // (server already filters by difficulty/cuisine/search, but keep for instant responsiveness)
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
    <div className="min-h-screen" style={{ backgroundColor: '#08060F' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-[#08060F]/95 backdrop-blur-lg border-b border-white/8 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-5">

          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/kitchen">
                <motion.button className="text-[#F7E7CE]/60 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white"
                  style={{ fontFamily: "var(--font-headline)" }}>
                  {activeTab === "mine" ? "My Recipes" : activeTab === "saved" ? "Saved Recipes" : "Explore Recipes"}
                </h1>
                <p className="text-[#F7E7CE]/60 mt-0.5 text-sm font-normal" style={{ fontFamily: "var(--font-body)" }}>
                  {activeTab === "mine" ? "Manage your uploaded recipes" : activeTab === "saved" ? "Recipes you've bookmarked" : "Discover and share halal recipes"}
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => requireAuth(
                () => router.push("/kitchen/recipes/upload"),
                "Sign up to share your halal recipes",
              )}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-linear-to-br from-fuchsia-600 to-pink-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg text-sm"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" /> Upload Recipe
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-[#130F1F] p-1 rounded-xl w-fit">
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
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all relative ${
                  activeTab === tab ? "text-white" : "text-[#F7E7CE]/60 hover:text-white"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-linear-to-br from-fuchsia-600 to-pink-600 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {(tab === "mine" || tab === "saved") && !user && <Lock className="w-3 h-3" />}
                  {tab === "all" ? "Browse All" : tab === "mine" ? "My Recipes" : "Saved"}
                  {tab === "mine" && myLoaded && myRecipes.length > 0 && (
                    <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {myRecipes.length}
                    </span>
                  )}
                  {tab === "saved" && savedLoaded && savedRecipes.length > 0 && (
                    <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {savedRecipes.length}
                    </span>
                  )}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Search + difficulty filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F7E7CE]/40" />
              <input
                type="text"
                placeholder="Search recipes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0C0918] text-white text-sm rounded-full pl-11 pr-5 py-2.5 border border-white/8 focus:outline-none focus:border-fuchsia-500 transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>
            {activeTab === "all" && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                {["All", "Easy", "Medium", "Hard"].map((d) => (
                  <motion.button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition-all ${
                      selectedDifficulty === d
                        ? "bg-linear-to-br from-fuchsia-600 to-pink-600 text-white"
                        : "bg-[#130F1F] text-[#F7E7CE]/60 border border-white/8"
                    }`}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  >
                    {d}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Cuisine filter — Browse All only */}
          {activeTab === "all" && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-3 pb-0.5">
              {CUISINES.map((c) => (
                <motion.button
                  key={c}
                  onClick={() => setSelectedCuisine(c)}
                  className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition-all ${
                    selectedCuisine === c
                      ? "bg-linear-to-br from-fuchsia-600 to-pink-600 text-white"
                      : "bg-[#130F1F] text-[#F7E7CE]/60 border border-white/8"
                  }`}
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
            <Lock className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-headline)" }}>
              Sign in to see your recipes
            </h3>
            <p className="text-[#F7E7CE]/60 text-sm mb-6">
              Your uploaded and AI-generated recipes will appear here.
            </p>
            <motion.button
              onClick={() => requireAuth(
                () => setActiveTab(activeTab),
                activeTab === "mine" ? "Sign in to see your recipes" : "Sign in to view saved recipes",
              )}
              className="inline-flex items-center gap-2 bg-linear-to-br from-fuchsia-600 to-pink-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            >
              Sign In
            </motion.button>
          </motion.div>
        )}

        {/* Loading skeleton — Browse All */}
        {allLoading && activeTab === "all" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#130F1F] rounded-2xl overflow-hidden border border-white/8 animate-pulse">
                <div className="h-44 bg-[#0C0918]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#0C0918] rounded w-3/4" />
                  <div className="h-3 bg-[#0C0918] rounded w-full" />
                  <div className="h-3 bg-[#0C0918] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton — My Recipes / Saved */}
        {((myLoading && activeTab === "mine") || (savedLoading && activeTab === "saved")) && user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#130F1F] rounded-2xl overflow-hidden border border-white/8 animate-pulse">
                <div className="h-44 bg-[#0C0918]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#0C0918] rounded w-3/4" />
                  <div className="h-3 bg-[#0C0918] rounded w-full" />
                  <div className="h-3 bg-[#0C0918] rounded w-1/2" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

                {/* Load More — Browse All only */}
                {activeTab === "all" && hasMore && (
                  <div className="flex justify-center mt-10">
                    <motion.button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 bg-[#130F1F] border border-white/8 text-white px-8 py-3 rounded-full font-semibold text-sm hover:border-fuchsia-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    >
                      {loadingMore ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-fuchsia-400 rounded-full animate-spin" /> Loading…</>
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
