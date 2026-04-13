"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Clock, Users, ChefHat, Star,
  MessageCircle, Share2, Bookmark, Check, Loader2, X,
} from "lucide-react";
import { recipeService } from "@/services/recipeService";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import type { Recipe, RecipeReview } from "@/types";

// ── Helpers ─────────────────────────────────────────────────────────
function difficultyColor(d: string) {
  if (d === "easy")   return "text-green-400 bg-green-400/10";
  if (d === "medium") return "text-yellow-400 bg-yellow-400/10";
  return "text-red-400 bg-red-400/10";
}

function cookTimeLabel(mins: number | null) {
  if (!mins) return "—";
  return mins >= 60
    ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`.trim()
    : `${mins} min`;
}

// ── Star selector ────────────────────────────────────────────────────
function StarSelector({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="disabled:cursor-not-allowed"
        >
          <Star
            className="w-6 h-6 transition-colors"
            fill={(hovered || value) >= s ? "#FBBF24" : "transparent"}
            stroke={(hovered || value) >= s ? "#FBBF24" : "#6B7280"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

// ── Review card ──────────────────────────────────────────────────────
function ReviewCard({ review }: { review: RecipeReview }) {
  const initial = review.profiles?.username?.charAt(0).toUpperCase() ?? "U";
  return (
    <div className="p-4 bg-[#0C0918]/50 rounded-xl border border-white/8">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {review.profiles?.avatar_url ? (
            <Image
              src={review.profiles.avatar_url}
              alt={review.profiles.username ?? ""}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-linear-to-br from-fuchsia-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initial}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {review.profiles?.username ?? "User"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(review.created_at).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className="w-3.5 h-3.5"
              fill={review.rating >= s ? "#FBBF24" : "transparent"}
              stroke={review.rating >= s ? "#FBBF24" : "#6B7280"}
              strokeWidth={1.5}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  // Always reflects the latest user value — closures stored in pendingRef read
  // this ref so they get fresh state even after being created pre-login.
  const userRef = useRef(user);
  userRef.current = user;

  // ── Recipe state ──────────────────────────────────────────────
  const [recipe, setRecipe]             = useState<Recipe | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [recipeError, setRecipeError]   = useState(false);

  // ── Ingredient/step checklist state ──────────────────────────
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps]             = useState<number[]>([]);

  // ── Bookmark state ────────────────────────────────────────────
  const [isBookmarked, setIsBookmarked]       = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError]     = useState("");

  // ── Review state ──────────────────────────────────────────────
  const [reviews, setReviews]                   = useState<RecipeReview[]>([]);
  const [reviewsLoading, setReviewsLoading]     = useState(true);
  const [reviewRating, setReviewRating]         = useState(0);
  const [reviewComment, setReviewComment]       = useState("");
  const [submitLoading, setSubmitLoading]       = useState(false);
  const [reviewError, setReviewError]           = useState("");
  const [reviewSuccess, setReviewSuccess]       = useState(false);
  const [userReviewId, setUserReviewId]         = useState<string | null>(null);

  // ── Share state ───────────────────────────────────────────────
  const [copied, setCopied] = useState(false);

  const loadRecipe = useCallback(() => {
    setRecipeLoading(true);
    setRecipeError(false);
    recipeService.getRecipeById(id)
      .then((data) => setRecipe(data))
      .catch(() => setRecipeError(true))
      .finally(() => setRecipeLoading(false));
  }, [id]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  // ── Load reviews + bookmark status on mount ───────────────────
  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await recipeService.getReviews(id);
      setReviews(data);
      if (user) {
        const mine = data.find((r) => r.user_id === user.id);
        if (mine) {
          setUserReviewId(mine.id);
          setReviewRating(mine.rating);
          setReviewComment(mine.comment ?? "");
        }
      }
    } catch {
      // silent
    } finally {
      setReviewsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (!user) return;
    recipeService.isFavorited(id, user.id)
      .then(setIsBookmarked)
      .catch(() => {});
  }, [id, user]);

  // ── Bookmark toggle ───────────────────────────────────────────
  const handleBookmark = async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    setBookmarkLoading(true);
    setBookmarkError("");
    try {
      if (isBookmarked) {
        await recipeService.removeFavorite(id, currentUser.id);
        setIsBookmarked(false);
      } else {
        await recipeService.addFavorite(id, currentUser.id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error("[bookmark]", err);
      setBookmarkError(err instanceof Error ? err.message : "Failed to update bookmark.");
      setTimeout(() => setBookmarkError(""), 3000);
    } finally {
      setBookmarkLoading(false);
    }
  };

  // ── Share ─────────────────────────────────────────────────────
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fallback prompt
      window.prompt("Copy this link:", url);
    }
  };

  // ── Submit review ─────────────────────────────────────────────
  const doReviewSubmit = async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    setSubmitLoading(true);
    setReviewError("");
    try {
      if (userReviewId) {
        await recipeService.updateReview(userReviewId, reviewRating, reviewComment);
      } else {
        await recipeService.createReview(id, currentUser.id, reviewRating, reviewComment);
      }
      setReviewSuccess(true);
      await loadReviews();
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    if (reviewRating === 0) { setReviewError("Please select a star rating."); return; }
    requireAuth(doReviewSubmit, "Sign in to leave a review");
  };

  const toggleIngredient = (i: number) =>
    setCheckedIngredients((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  const toggleStep = (i: number) =>
    setCheckedSteps((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : recipe?.avg_rating ? Number(recipe.avg_rating).toFixed(1) : "—";

  // ── Loading state ─────────────────────────────────────────────
  if (recipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#08060F' }}>
        <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin" />
      </div>
    );
  }

  // ── Not found / timed-out state ──────────────────────────────
  if (recipeError || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#08060F' }}>
        <ChefHat className="w-16 h-16 text-gray-600" />
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-headline)" }}>
          {recipeError ? "Couldn't load recipe" : "Recipe not found"}
        </h2>
        <p className="text-[#F7E7CE]/60 text-sm">Check your connection and try again.</p>
        <div className="flex gap-3">
          <motion.button
            onClick={loadRecipe}
            className="bg-linear-to-br from-fuchsia-600 to-pink-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          >
            Retry
          </motion.button>
          <Link href="/kitchen/recipes">
            <motion.button
              className="bg-[#130F1F] text-white px-5 py-2.5 rounded-full font-semibold text-sm border border-white/8"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            >
              Back to Recipes
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Normalise ingredients + instructions from DB schema ───────
  type IngredientRow = { name: string; amount?: string; unit?: string } | string;
  type InstructionRow = { step: number; text: string } | string;

  const ingredients: string[] = (recipe.ingredients as IngredientRow[]).map((ing) =>
    typeof ing === "string"
      ? ing
      : [ing.amount, ing.unit, ing.name].filter(Boolean).join(" ")
  );

  const steps: string[] = (recipe.instructions as InstructionRow[]).map((ins) =>
    typeof ins === "string" ? ins : ins.text
  );

  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#08060F' }}>

      {/* Hero image */}
      <div className="relative h-64 md:h-80 lg:h-96">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-[#130F1F] flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-gray-900" />

        {/* Back */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6">
          <Link href="/kitchen/recipes">
            <motion.button
              className="bg-black/60 backdrop-blur-sm text-white rounded-full p-2 md:p-3 border border-white/20"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </Link>
        </div>

        {/* Actions */}
        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex gap-2 md:gap-3">
          <motion.button
            onClick={handleShare}
            title={copied ? "Copied!" : "Copy link"}
            className={`backdrop-blur-sm text-white rounded-full p-2 md:p-3 border transition-colors ${
              copied
                ? "bg-emerald-600/80 border-emerald-400/40"
                : "bg-black/60 border-white/20 hover:bg-black/80"
            }`}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          >
            {copied ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Share2 className="w-5 h-5 md:w-6 md:h-6" />}
          </motion.button>

          <motion.button
            onClick={() => requireAuth(handleBookmark, "Sign in to bookmark recipes")}
            disabled={bookmarkLoading}
            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
            className={`backdrop-blur-sm text-white rounded-full p-2 md:p-3 border transition-colors ${
              isBookmarked
                ? "bg-fuchsia-600/80 border-fuchsia-400/40"
                : "bg-black/60 border-white/20 hover:bg-black/80"
            } disabled:opacity-50`}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          >
            {bookmarkLoading
              ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              : <Bookmark className="w-5 h-5 md:w-6 md:h-6" fill={isBookmarked ? "white" : "transparent"} />
            }
          </motion.button>
        </div>
        {/* Bookmark error toast */}
        {bookmarkError && (
          <div className="absolute bottom-4 right-4 bg-red-600/90 text-white text-xs px-3 py-2 rounded-lg">
            {bookmarkError}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-8">

        {/* Title + meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1
            className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="text-base md:text-lg text-gray-300 mb-6 font-normal" style={{ fontFamily: "var(--font-body)" }}>
              {recipe.description}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: <Clock className="w-4 h-4 md:w-5 md:h-5" />,  label: "Cook Time",  value: cookTimeLabel(recipe.cook_time_mins) },
              { icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,  label: "Servings",   value: `${recipe.servings ?? "—"} people` },
              { icon: <ChefHat className="w-4 h-4 md:w-5 md:h-5" />, label: "Difficulty", value: null, badge: recipe.difficulty },
              { icon: <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />, label: `Rating (${reviews.length})`, value: `${avgRating} / 5.0` },
            ].map(({ icon, label, value, badge }, i) => (
              <div key={i} className="bg-[#130F1F] rounded-xl p-3 md:p-4 border border-white/8">
                <div className="flex items-center gap-2 text-[#F7E7CE]/60 mb-1">
                  {icon}
                  <span className="text-xs md:text-sm">{label}</span>
                </div>
                {badge
                  ? <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${difficultyColor(badge)}`}>{badge.charAt(0).toUpperCase() + badge.slice(1)}</span>
                  : <p className="text-white font-semibold text-base md:text-lg">{value}</p>
                }
              </div>
            ))}
          </div>

          {/* Author */}
          <div className="mt-4 flex items-center gap-3">
            {recipe.profiles?.avatar_url ? (
              <Image
                src={recipe.profiles.avatar_url}
                alt={recipe.profiles.username ?? "Author"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 bg-linear-to-br from-fuchsia-600 to-pink-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white">
                  {(recipe.profiles?.username ?? "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-[#F7E7CE]/60 text-xs">Uploaded by</p>
              <p className="text-white font-semibold text-sm">
                {recipe.profiles?.username ?? "Community member"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ask AI */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Link href={`/kitchen/ai-assistant?recipe=${id}`}>
            <motion.button
              className="w-full bg-linear-to-br from-fuchsia-600 to-pink-600 text-white rounded-2xl p-4 md:p-5 font-semibold text-base flex items-center justify-center gap-3 shadow-xl"
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(217,70,239,0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
              Ask AI About This Recipe
            </motion.button>
          </Link>
        </motion.div>

        {/* Ingredients + Instructions */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10">

          {/* Ingredients */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-[#130F1F] rounded-2xl p-6 border border-white/8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-headline)" }}>
                <span className="text-3xl">🥘</span> Ingredients
              </h2>
              {ingredients.length === 0 ? (
                <p className="text-gray-500 text-sm">No ingredients listed.</p>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((ing, i) => (
                    <motion.div
                      key={i}
                      onClick={() => toggleIngredient(i)}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        checkedIngredients.includes(i)
                          ? "bg-fuchsia-600/20 border border-fuchsia-500"
                          : "bg-[#0C0918]/50 border border-white/8 hover:bg-[#0C0918]"
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        checkedIngredients.includes(i) ? "bg-fuchsia-500 border-fuchsia-500" : "border-gray-600"
                      }`}>
                        {checkedIngredients.includes(i) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p className={`text-sm font-normal ${checkedIngredients.includes(i) ? "text-white line-through opacity-60" : "text-gray-300"}`}
                        style={{ fontFamily: "var(--font-body)" }}>
                        {ing}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-[#130F1F] rounded-2xl p-6 border border-white/8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-headline)" }}>
                <span className="text-3xl">👨‍🍳</span> Instructions
              </h2>
              {steps.length === 0 ? (
                <p className="text-gray-500 text-sm">No instructions listed.</p>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <motion.div
                      key={i}
                      onClick={() => toggleStep(i)}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className={`flex gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        checkedSteps.includes(i)
                          ? "bg-fuchsia-600/20 border border-fuchsia-500"
                          : "bg-[#0C0918]/50 border border-white/8 hover:bg-[#0C0918]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-sm ${
                        checkedSteps.includes(i) ? "bg-fuchsia-500 text-white" : "bg-[#0C0918] text-[#F7E7CE]/60"
                      }`}>
                        {checkedSteps.includes(i) ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <p className={`text-sm font-normal leading-relaxed ${checkedSteps.includes(i) ? "text-white line-through opacity-60" : "text-gray-300"}`}
                        style={{ fontFamily: "var(--font-body)" }}>
                        {step}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Reviews ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="bg-[#130F1F] rounded-2xl p-6 border border-white/8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "var(--font-headline)" }}>
                <span className="text-3xl">⭐</span>
                Reviews
                {reviews.length > 0 && (
                  <span className="text-base font-normal text-[#F7E7CE]/60">({reviews.length})</span>
                )}
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-lg">{avgRating}</span>
                  <span className="text-[#F7E7CE]/60 text-sm">/ 5.0</span>
                </div>
              )}
            </div>

            {/* Write a review form — visible to all; submit is auth-gated */}
            <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-[#0C0918]/60 rounded-xl border border-white/8">
              <p className="text-sm font-semibold text-white mb-3">
                {userReviewId ? "Update your review" : "Write a review"}
              </p>

              <div className="mb-3">
                <StarSelector value={reviewRating} onChange={setReviewRating} disabled={submitLoading} />
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this recipe… (optional)"
                rows={3}
                disabled={submitLoading}
                className="w-full bg-[#0C0918] text-white text-sm rounded-xl px-4 py-3 border border-white/8 focus:outline-none focus:border-fuchsia-500 transition-colors resize-none font-normal disabled:opacity-50"
                style={{ fontFamily: "var(--font-body)" }}
              />

              <AnimatePresence>
                {reviewError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-red-400 text-xs mt-2 flex items-center gap-1"
                  >
                    <X className="w-3 h-3 shrink-0" /> {reviewError}
                  </motion.p>
                )}
                {reviewSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-emerald-400 text-xs mt-2 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 shrink-0" /> Review submitted!
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex justify-end mt-3">
                <motion.button
                  type="submit"
                  disabled={submitLoading || reviewRating === 0}
                  className="bg-linear-to-br from-fuchsia-600 to-pink-600 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                >
                  {submitLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                    : userReviewId ? "Update Review" : "Submit Review"
                  }
                </motion.button>
              </div>
            </form>

            {/* Review list */}
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-fuchsia-400 animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-[#F7E7CE]/60 text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
