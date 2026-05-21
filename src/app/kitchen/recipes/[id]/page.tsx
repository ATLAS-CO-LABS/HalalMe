"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cldUrl, CLD_RECIPE } from "@/lib/cldUrl";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Star,
  MessageCircle,
  Share2,
  Bookmark,
  Check,
  Loader2,
  X,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { recipeService } from "@/services/recipeService";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import type { Recipe, RecipeReview } from "@/types";

const BG = "#1C1C1C";
const BG2 = "#161616";
const CREAM = "#F7E7CE";
const MAGENTA = "#F03E9E";
const DEEP = "#C41E73";

// ── Helpers ─────────────────────────────────────────────────────────
function difficultyColor(d: string) {
  if (d === "easy") return "text-green-400 bg-green-400/10";
  if (d === "medium") return "text-yellow-400 bg-yellow-400/10";
  return "text-red-400 bg-red-400/10";
}

function cookTimeLabel(mins: number | null) {
  if (!mins) return "-";
  return mins >= 60
    ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`.trim()
    : `${mins} min`;
}

// ── Star selector ────────────────────────────────────────────────────
function StarSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
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
    <div
      className="p-4 border"
      style={{ backgroundColor: `${BG2}80`, borderColor: `${CREAM}08` }}
    >
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
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg, ${MAGENTA}, ${DEEP})`,
              }}
            >
              {initial}
            </div>
          )}
          <div>
            <p
              className="text-sm font-bold uppercase tracking-tight"
              style={{ color: CREAM }}
            >
              {review.profiles?.username ?? "User"}
            </p>
            <p className="text-xs" style={{ color: `${CREAM}35` }}>
              {new Date(review.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
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
        <p className="text-sm leading-relaxed" style={{ color: `${CREAM}70` }}>
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const userRef = useRef(user);
  userRef.current = user;

  // ── Recipe state ──────────────────────────────────────────────
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [recipeError, setRecipeError] = useState(false);

  // ── Ingredient/step checklist state ──────────────────────────
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  // ── Bookmark state ────────────────────────────────────────────
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState("");

  // ── Review state ──────────────────────────────────────────────
  const [reviews, setReviews] = useState<RecipeReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [userReviewId, setUserReviewId] = useState<string | null>(null);

  // ── Share state ───────────────────────────────────────────────
  const [copied, setCopied] = useState(false);

  const loadRecipe = useCallback(() => {
    setRecipeLoading(true);
    setRecipeError(false);
    recipeService
      .getRecipeById(id)
      .then((data) => setRecipe(data))
      .catch(() => setRecipeError(true))
      .finally(() => setRecipeLoading(false));
  }, [id]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

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
    recipeService
      .isFavorited(id, user.id)
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
      setBookmarkError(
        err instanceof Error ? err.message : "Failed to update bookmark.",
      );
      setTimeout(() => setBookmarkError(""), 3000);
    } finally {
      setBookmarkLoading(false);
    }
  };

  // ── Share ─────────────────────────────────────────────────────
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: recipe?.title ?? "HalalMe Recipe", text: `Check out this recipe on HalalMe`, url };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
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
        await recipeService.updateReview(
          userReviewId,
          reviewRating,
          reviewComment,
        );
      } else {
        await recipeService.createReview(
          id,
          currentUser.id,
          reviewRating,
          reviewComment,
        );
      }
      setReviewSuccess(true);
      await loadReviews();
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Failed to submit review.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    if (reviewRating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }
    requireAuth(doReviewSubmit, "Sign in to leave a review");
  };

  const toggleIngredient = (i: number) =>
    setCheckedIngredients((p) =>
      p.includes(i) ? p.filter((x) => x !== i) : [...p, i],
    );
  const toggleStep = (i: number) =>
    setCheckedSteps((p) =>
      p.includes(i) ? p.filter((x) => x !== i) : [...p, i],
    );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : recipe?.avg_rating
        ? Number(recipe.avg_rating).toFixed(1)
        : "-";

  // ── Loading state ─────────────────────────────────────────────
  if (recipeLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: BG }}
      >
        <Loader2
          className="w-10 h-10 animate-spin"
          style={{ color: MAGENTA }}
        />
      </div>
    );
  }

  // ── Not found / timed-out state ───────────────────────────────
  if (recipeError || !recipe) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: BG }}
      >
        <ChefHat className="w-16 h-16 text-gray-600" />
        <h2
          className="text-2xl font-extrabold uppercase tracking-tighter"
          style={{ color: CREAM }}
        >
          {recipeError ? "Couldn't load recipe" : "Recipe not found"}
        </h2>
        <p className="text-sm" style={{ color: `${CREAM}50` }}>
          Check your connection and try again.
        </p>
        <div className="flex gap-3">
          <motion.button
            onClick={loadRecipe}
            className="text-white px-5 py-2.5 font-bold uppercase tracking-tighter text-sm"
            style={{ backgroundColor: DEEP }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Retry
          </motion.button>
          <Link href="/kitchen/recipes">
            <motion.button
              className="text-white px-5 py-2.5 font-bold uppercase tracking-tighter text-sm border"
              style={{
                backgroundColor: BG2,
                borderColor: `${CREAM}15`,
                color: CREAM,
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Back to Recipes
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Normalise ingredients + instructions from DB schema ───────
  type IngredientRow =
    | { name: string; amount?: string; unit?: string }
    | string;
  type InstructionRow = { step: number; text: string } | string;

  const ingredients: string[] = (recipe.ingredients as IngredientRow[]).map(
    (ing) =>
      typeof ing === "string"
        ? ing
        : [ing.amount, ing.unit, ing.name].filter(Boolean).join(" "),
  );

  const steps: string[] = (recipe.instructions as InstructionRow[]).map(
    (ins) => (typeof ins === "string" ? ins : ins.text),
  );

  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* Hero image */}
      <div className="relative h-72 md:h-[420px] lg:h-[520px]">
        {recipe.image_url ? (
          <Image
            src={cldUrl(recipe.image_url, CLD_RECIPE) ?? recipe.image_url!}
            alt={recipe.title}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            loading="eager"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: BG2 }}
          >
            <ChefHat className="w-16 h-16 text-gray-600" />
          </div>
        )}
        {/* Top fade */}
        <div
          className="absolute inset-x-0 top-0 h-32"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)`,
          }}
        />
        {/* Bottom fade into page BG */}
        <div
          className="absolute inset-x-0 bottom-0 h-48"
          style={{
            background: `linear-gradient(to top, ${BG} 0%, ${BG}CC 30%, transparent 100%)`,
          }}
        />

        {/* Back */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6">
          <Link href="/kitchen/recipes">
            <motion.button
              className="bg-black/60 backdrop-blur-sm text-white p-2 md:p-3 border border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
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
            className="backdrop-blur-sm text-white p-2 md:p-3 border transition-colors"
            style={
              copied
                ? {
                    backgroundColor: "rgba(5,150,105,0.8)",
                    borderColor: "rgba(52,211,153,0.4)",
                  }
                : {
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderColor: "rgba(255,255,255,0.2)",
                  }
            }
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <Check className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <Share2 className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </motion.button>

          <motion.button
            onClick={() =>
              requireAuth(handleBookmark, "Sign in to bookmark recipes")
            }
            disabled={bookmarkLoading}
            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
            className="backdrop-blur-sm text-white p-2 md:p-3 border transition-colors disabled:opacity-50"
            style={
              isBookmarked
                ? {
                    backgroundColor: `${MAGENTA}cc`,
                    borderColor: `${MAGENTA}60`,
                  }
                : {
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderColor: "rgba(255,255,255,0.2)",
                  }
            }
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {bookmarkLoading ? (
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            ) : (
              <Bookmark
                className="w-5 h-5 md:w-6 md:h-6"
                fill={isBookmarked ? "white" : "transparent"}
              />
            )}
          </motion.button>
        </div>

        {/* Bookmark error toast */}
        {bookmarkError && (
          <div className="absolute bottom-4 right-4 bg-red-600/90 text-white text-xs px-3 py-2">
            {bookmarkError}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-8">
        {/* Title + meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {recipe.is_halal_verified && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 bg-emerald-600/90 text-white text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              Halal Verified
            </div>
          )}
          <h1
            className="text-2xl md:text-3xl lg:text-5xl font-extrabold uppercase tracking-tighter mb-3"
            style={{ color: CREAM }}
          >
            {recipe.title}
          </h1>
          {recipe.description && (
            <p
              className="text-base md:text-lg mb-6 font-normal"
              style={{ color: `${CREAM}60` }}
            >
              {recipe.description}
            </p>
          )}

          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ gap: "1px", backgroundColor: `${CREAM}08` }}
          >
            {[
              {
                icon: <Clock className="w-4 h-4 md:w-5 md:h-5" />,
                label: "Cook Time",
                value: cookTimeLabel(recipe.cook_time_mins),
              },
              {
                icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,
                label: "Servings",
                value: `${recipe.servings ?? "-"} people`,
              },
              {
                icon: <ChefHat className="w-4 h-4 md:w-5 md:h-5" />,
                label: "Difficulty",
                value: null,
                badge: recipe.difficulty,
              },
              {
                icon: (
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
                ),
                label: `Rating (${reviews.length})`,
                value: `${avgRating} / 5.0`,
              },
            ].map(({ icon, label, value, badge }, i) => (
              <div
                key={i}
                className="p-3 md:p-4"
                style={{ backgroundColor: BG2 }}
              >
                <div
                  className="flex items-center gap-2 mb-1"
                  style={{ color: `${CREAM}50` }}
                >
                  {icon}
                  <span className="text-xs md:text-sm uppercase tracking-wide font-bold">
                    {label}
                  </span>
                </div>
                {badge ? (
                  <span
                    className={`inline-block px-2 md:px-3 py-1 text-xs md:text-sm font-bold uppercase tracking-tight ${difficultyColor(badge)}`}
                  >
                    {badge.charAt(0).toUpperCase() + badge.slice(1)}
                  </span>
                ) : (
                  <p
                    className="font-extrabold text-base md:text-lg"
                    style={{ color: CREAM }}
                  >
                    {value}
                  </p>
                )}
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
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${MAGENTA}, ${DEEP})`,
                }}
              >
                <span className="text-sm font-bold text-white">
                  {(recipe.profiles?.username ?? "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p
                className="text-xs uppercase tracking-wide font-bold"
                style={{ color: `${CREAM}40` }}
              >
                Uploaded by
              </p>
              <div className="flex items-center gap-1.5">
                <p
                  className="font-extrabold uppercase tracking-tight text-sm"
                  style={{ color: CREAM }}
                >
                  {recipe.profiles?.username ?? "Community member"}
                </p>
                {recipe.profiles?.is_verified && (
                  <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: MAGENTA }} />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ask AI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Link href={`/kitchen/ai-assistant?recipe=${id}`}>
            <motion.button
              className="w-full text-white p-4 md:p-5 font-extrabold uppercase tracking-tighter text-base flex items-center justify-center gap-3"
              style={{ backgroundColor: DEEP }}
              whileHover={{ scale: 1.01, backgroundColor: MAGENTA }}
              whileTap={{ scale: 0.99 }}
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
              Ask AQI About Similar Recipes
            </motion.button>
          </Link>
        </motion.div>

        {/* Ingredients + Instructions */}
        <div
          className="grid md:grid-cols-2 mb-10"
          style={{ gap: "1px", backgroundColor: `${CREAM}08` }}
        >
          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6" style={{ backgroundColor: BG2 }}>
              <h2
                className="text-2xl font-extrabold uppercase tracking-tighter mb-6 flex items-center gap-3"
                style={{ color: CREAM }}
              >
                <span className="text-3xl">🥘</span> Ingredients
              </h2>
              {ingredients.length === 0 ? (
                <p className="text-sm" style={{ color: `${CREAM}40` }}>
                  No ingredients listed.
                </p>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((ing, i) => (
                    <motion.div
                      key={i}
                      onClick={() => toggleIngredient(i)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-start gap-3 p-3 cursor-pointer transition-all border"
                      style={
                        checkedIngredients.includes(i)
                          ? {
                              backgroundColor: `${MAGENTA}18`,
                              borderColor: MAGENTA,
                            }
                          : {
                              backgroundColor: `${BG}80`,
                              borderColor: `${CREAM}08`,
                            }
                      }
                    >
                      <div
                        className="mt-0.5 w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-all"
                        style={
                          checkedIngredients.includes(i)
                            ? { backgroundColor: MAGENTA, borderColor: MAGENTA }
                            : { borderColor: "#4B5563" }
                        }
                      >
                        {checkedIngredients.includes(i) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <p
                        className="text-sm font-normal"
                        style={{
                          color: checkedIngredients.includes(i)
                            ? `${CREAM}60`
                            : `${CREAM}80`,
                          textDecoration: checkedIngredients.includes(i)
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {ing}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-6" style={{ backgroundColor: BG2 }}>
              <h2
                className="text-2xl font-extrabold uppercase tracking-tighter mb-6 flex items-center gap-3"
                style={{ color: CREAM }}
              >
                <span className="text-3xl">👨‍🍳</span> Instructions
              </h2>
              {steps.length === 0 ? (
                <p className="text-sm" style={{ color: `${CREAM}40` }}>
                  No instructions listed.
                </p>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <motion.div
                      key={i}
                      onClick={() => toggleStep(i)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex gap-4 p-4 cursor-pointer transition-all border"
                      style={
                        checkedSteps.includes(i)
                          ? {
                              backgroundColor: `${MAGENTA}18`,
                              borderColor: MAGENTA,
                            }
                          : {
                              backgroundColor: `${BG}80`,
                              borderColor: `${CREAM}08`,
                            }
                      }
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center font-extrabold uppercase shrink-0 text-sm transition-all"
                        style={
                          checkedSteps.includes(i)
                            ? { backgroundColor: MAGENTA, color: "white" }
                            : { backgroundColor: BG, color: `${CREAM}50` }
                        }
                      >
                        {checkedSteps.includes(i) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <p
                        className="text-sm font-normal leading-relaxed"
                        style={{
                          color: checkedSteps.includes(i)
                            ? `${CREAM}50`
                            : `${CREAM}75`,
                          textDecoration: checkedSteps.includes(i)
                            ? "line-through"
                            : "none",
                        }}
                      >
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className="p-6 border"
            style={{ backgroundColor: BG2, borderColor: `${CREAM}08` }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-extrabold uppercase tracking-tighter flex items-center gap-3"
                style={{ color: CREAM }}
              >
                <span className="text-3xl">⭐</span>
                Reviews
                {reviews.length > 0 && (
                  <span
                    className="text-base font-normal"
                    style={{ color: `${CREAM}50` }}
                  >
                    ({reviews.length})
                  </span>
                )}
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span
                    className="font-extrabold text-lg"
                    style={{ color: CREAM }}
                  >
                    {avgRating}
                  </span>
                  <span className="text-sm" style={{ color: `${CREAM}50` }}>
                    / 5.0
                  </span>
                </div>
              )}
            </div>

            {/* Write a review form */}
            <form
              onSubmit={handleReviewSubmit}
              className="mb-6 p-4 border"
              style={{ backgroundColor: `${BG}80`, borderColor: `${CREAM}08` }}
            >
              <p
                className="text-sm font-extrabold uppercase tracking-tighter mb-3"
                style={{ color: CREAM }}
              >
                {userReviewId ? "Update your review" : "Write a review"}
              </p>

              <div className="mb-3">
                <StarSelector
                  value={reviewRating}
                  onChange={setReviewRating}
                  disabled={submitLoading}
                />
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this recipe… (optional)"
                rows={3}
                disabled={submitLoading}
                className="w-full text-white text-base px-4 py-3 border focus:outline-none transition-colors resize-none font-normal disabled:opacity-50"
                style={{
                  backgroundColor: BG2,
                  borderColor: `${CREAM}10`,
                  caretColor: MAGENTA,
                }}
                onFocus={(e) => (e.target.style.borderColor = MAGENTA)}
                onBlur={(e) => (e.target.style.borderColor = `${CREAM}10`)}
              />

              <AnimatePresence>
                {reviewError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs mt-2 flex items-center gap-1"
                  >
                    <X className="w-3 h-3 shrink-0" /> {reviewError}
                  </motion.p>
                )}
                {reviewSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
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
                  className="text-white px-5 py-2 text-sm font-extrabold uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: DEEP }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                    </>
                  ) : userReviewId ? (
                    "Update Review"
                  ) : (
                    "Submit Review"
                  )}
                </motion.button>
              </div>
            </form>

            {/* Review list */}
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  className="w-6 h-6 animate-spin"
                  style={{ color: MAGENTA }}
                />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-sm" style={{ color: `${CREAM}50` }}>
                  No reviews yet. Be the first!
                </p>
              </div>
            ) : (
              <div className="space-y-2" style={{ gap: "1px" }}>
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
