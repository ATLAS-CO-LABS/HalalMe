"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Upload, Plus, X, Image as ImageIcon,
  Check, Loader2, ChevronDown, Pencil,
} from "lucide-react";
import { recipeService } from "@/services/recipeService";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import AuthGuard from "@/components/auth/AuthGuard";

const BG      = '#1C1C1C';
const BG2     = '#161616';
const CREAM   = '#F7E7CE';
const MAGENTA = '#F03E9E';
const DEEP    = '#C41E73';

// ── Types ───────────────────────────────────────────────────────────
interface IngredientRow {
  amount: string;
  unit: string;
  name: string;
}

interface RecipeForm {
  title: string;
  description: string;
  cuisine: string;
  prep_time_mins: string;
  cook_time_mins: string;
  servings: string;
  difficulty: "easy" | "medium" | "hard" | "";
  ingredients: IngredientRow[];
  instructions: string[];
  image: File | null;
  existingImageUrl: string | null;
}

// ── Styles ──────────────────────────────────────────────────────────
const fieldClass =
  "w-full text-white px-4 py-3 border focus:outline-none transition-colors text-base font-normal";
const labelClass = "block font-extrabold uppercase tracking-tighter mb-2 text-xs";

const CUISINES = [
  "Middle Eastern", "South Asian", "Turkish", "Moroccan", "Lebanese",
  "Egyptian", "Persian", "Malaysian", "Indonesian", "West African",
  "Mediterranean", "British", "Other",
];

const COMMON_UNITS = ["", "g", "kg", "ml", "L", "cup", "cups", "tbsp", "tsp", "piece", "pieces", "slice", "slices"];

// ── Inline notification ─────────────────────────────────────────────
function Notification({
  type, message, onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const isSuccess = type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-3 p-4 border"
      style={
        isSuccess
          ? { backgroundColor: 'rgba(6,78,59,0.2)', borderColor: 'rgba(52,211,153,0.2)', color: 'rgb(110,231,183)' }
          : { backgroundColor: 'rgba(127,29,29,0.2)', borderColor: 'rgba(248,113,113,0.2)', color: 'rgb(252,165,165)' }
      }
    >
      <div
        className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: isSuccess ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)' }}
      >
        {isSuccess
          ? <Check className="w-3 h-3 text-emerald-400" />
          : <X className="w-3 h-3 text-red-400" />}
      </div>
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Helper: normalise ingredients from DB ────────────────────────────
function normaliseIngredients(raw: unknown): IngredientRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return { amount: "", unit: "", name: item };
    const obj = item as Record<string, unknown>;
    return {
      amount: String(obj.amount ?? ""),
      unit:   String(obj.unit   ?? ""),
      name:   String(obj.name   ?? ""),
    };
  });
}

// ── Helper: normalise instructions from DB ───────────────────────────
function normaliseInstructions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return item;
    const obj = item as Record<string, unknown>;
    return String(obj.text ?? obj.step ?? "");
  }).filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════════
export default function UploadRecipePage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: MAGENTA }} />
        </div>
      }>
        <UploadRecipeInner />
      </Suspense>
    </AuthGuard>
  );
}

function UploadRecipeInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const editId       = searchParams.get("edit");
  const isEditMode   = !!editId;

  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const userRef = useRef(user);
  userRef.current = user;

  const [loadingRecipe, setLoadingRecipe] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [notification, setNotification]   = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [ingredientRow, setIngredientRow]           = useState<IngredientRow>({ amount: "", unit: "", name: "" });
  const [currentInstruction, setCurrentInstruction] = useState("");

  const [form, setForm] = useState<RecipeForm>({
    title:            "",
    description:      "",
    cuisine:          "",
    prep_time_mins:   "",
    cook_time_mins:   "",
    servings:         "",
    difficulty:       "",
    ingredients:      [],
    instructions:     [],
    image:            null,
    existingImageUrl: null,
  });

  // ── Load recipe in edit mode ──────────────────────────────────────
  const loadRecipe = useCallback(async () => {
    if (!editId) return;
    setLoadingRecipe(true);
    try {
      const recipe = await recipeService.getRecipeById(editId);
      setForm({
        title:            recipe.title ?? "",
        description:      recipe.description ?? "",
        cuisine:          recipe.cuisine ?? "",
        prep_time_mins:   recipe.prep_time_mins != null ? String(recipe.prep_time_mins) : "",
        cook_time_mins:   recipe.cook_time_mins != null ? String(recipe.cook_time_mins) : "",
        servings:         recipe.servings       != null ? String(recipe.servings)       : "",
        difficulty:       (recipe.difficulty as RecipeForm["difficulty"]) ?? "",
        ingredients:      normaliseIngredients(recipe.ingredients),
        instructions:     normaliseInstructions(recipe.instructions),
        image:            null,
        existingImageUrl: recipe.image_url ?? null,
      });
    } catch {
      setNotification({ type: "error", message: "Failed to load recipe for editing." });
    } finally {
      setLoadingRecipe(false);
    }
  }, [editId]);

  useEffect(() => {
    if (isEditMode) loadRecipe();
  }, [isEditMode, loadRecipe]);

  // ── Field helpers ─────────────────────────────────────────────────
  const set = (field: keyof RecipeForm, value: RecipeForm[keyof RecipeForm]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Ingredients ───────────────────────────────────────────────────
  const addIngredient = () => {
    if (!ingredientRow.name.trim()) return;
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...ingredientRow, name: ingredientRow.name.trim() }],
    }));
    setIngredientRow({ amount: "", unit: "", name: "" });
  };

  const removeIngredient = (index: number) =>
    setForm((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));

  // ── Instructions ──────────────────────────────────────────────────
  const addInstruction = () => {
    if (!currentInstruction.trim()) return;
    setForm((prev) => ({
      ...prev,
      instructions: [...prev.instructions, currentInstruction.trim()],
    }));
    setCurrentInstruction("");
  };

  const removeInstruction = (index: number) =>
    setForm((prev) => ({ ...prev, instructions: prev.instructions.filter((_, i) => i !== index) }));

  // ── Image ─────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      setNotification({ type: "error", message: "Image must be under 5 MB." });
      return;
    }
    set("image", file);
  };

  // ── Validation ────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!form.title.trim())       return "Recipe title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.cuisine)            return "Please select a cuisine.";
    if (!form.difficulty)         return "Please select a difficulty level.";
    if (!form.cook_time_mins || isNaN(Number(form.cook_time_mins)))
                                  return "Cook time must be a number (minutes).";
    if (!form.servings || isNaN(Number(form.servings)))
                                  return "Servings must be a number.";
    if (form.ingredients.length === 0) return "Add at least one ingredient.";
    if (form.instructions.length === 0) return "Add at least one instruction step.";
    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────
  const doSubmit = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const recipeData = {
        title:            form.title.trim(),
        description:      form.description.trim(),
        cuisine:          form.cuisine,
        difficulty:       form.difficulty as "easy" | "medium" | "hard",
        prep_time_mins:   form.prep_time_mins ? Number(form.prep_time_mins) : null,
        cook_time_mins:   Number(form.cook_time_mins),
        servings:         Number(form.servings),
        ingredients:      form.ingredients,
        instructions:     form.instructions.map((text, i) => ({ step: i + 1, text })),
        is_published:     true,
        is_ai_generated:  false,
        is_halal_verified: false,
        tags:             [] as string[],
        nutrition:        null,
        image_url:        form.existingImageUrl ?? null,
        image_public_id:  null,
      };

      let recipeId: string;

      if (isEditMode && editId) {
        await recipeService.updateRecipe(editId, recipeData);
        recipeId = editId;
      } else {
        const created = await recipeService.createRecipe(recipeData, currentUser.id);
        recipeId = created.id;
      }

      if (form.image && recipeId) {
        await recipeService.uploadRecipeImage(recipeId, form.image);
      }

      setNotification({
        type: "success",
        message: isEditMode ? "Recipe updated successfully!" : "Recipe uploaded successfully!",
      });
      setTimeout(() => router.push("/kitchen/recipes"), 1500);
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save recipe. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isEditMode, editId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    const validationError = validate();
    if (validationError) {
      setNotification({ type: "error", message: validationError });
      return;
    }
    requireAuth(doSubmit, "Sign up to upload your halal recipes");
  };

  // ── Loading skeleton (edit mode only) ────────────────────────────
  if (loadingRecipe) {
    return (
      <div className="min-h-screen py-6 md:py-8 flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: MAGENTA }} />
          <p className="text-sm" style={{ color: `${CREAM}50` }}>Loading recipe…</p>
        </div>
      </div>
    );
  }

  // ── Input field styles (applied inline for theming) ──────────────
  const fieldStyle = {
    backgroundColor: BG2,
    borderColor: `${CREAM}10`,
    caretColor: MAGENTA,
  };
  const fieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = MAGENTA);
  const fieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = `${CREAM}10`);

  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen py-6 md:py-8" style={{ backgroundColor: BG }}>
      <div className="mx-auto max-w-4xl px-4 md:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 md:gap-4 mb-3">
            <Link href="/kitchen/recipes">
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
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM }}>
              {isEditMode ? "Edit Recipe" : "Upload Your Recipe"}
            </h1>
          </div>
          <p className="text-sm font-normal ml-9 md:ml-10" style={{ color: `${CREAM}45` }}>
            {isEditMode
              ? "Update your recipe details below"
              : "Share your halal culinary creation with the community"}
          </p>
        </motion.div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <div className="mb-5">
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
              />
            </div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-px" style={{ backgroundColor: `${CREAM}05` }}>

          {/* ── Basic Info ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6"
            style={{ backgroundColor: BG2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px" style={{ backgroundColor: MAGENTA }} />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.25em]" style={{ color: MAGENTA }}>
                Basic Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className={labelClass} style={{ color: `${CREAM}60` }}>Recipe Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g., Chicken Biryani"
                  className={fieldClass}
                  style={fieldStyle}
                  onFocus={fieldFocus}
                  onBlur={fieldBlur}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass} style={{ color: `${CREAM}60` }}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief description of your recipe..."
                  rows={3}
                  className={`${fieldClass} resize-none`}
                  style={fieldStyle}
                  onFocus={fieldFocus}
                  onBlur={fieldBlur}
                  required
                />
              </div>

              {/* Cuisine */}
              <div>
                <label className={labelClass} style={{ color: `${CREAM}60` }}>Cuisine *</label>
                <div className="relative">
                  <select
                    value={form.cuisine}
                    onChange={(e) => set("cuisine", e.target.value)}
                    className={`${fieldClass} appearance-none pr-10`}
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                    required
                  >
                    <option value="">Select cuisine…</option>
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Time + Servings + Difficulty */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: `${CREAM}05` }}>
                <div className="p-3" style={{ backgroundColor: BG2 }}>
                  <label className={labelClass} style={{ color: `${CREAM}60` }}>Prep Time (mins)</label>
                  <input
                    type="number"
                    value={form.prep_time_mins}
                    onChange={(e) => set("prep_time_mins", e.target.value)}
                    placeholder="15"
                    min="0"
                    className={fieldClass}
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                  />
                </div>
                <div className="p-3" style={{ backgroundColor: BG2 }}>
                  <label className={labelClass} style={{ color: `${CREAM}60` }}>Cook Time (mins) *</label>
                  <input
                    type="number"
                    value={form.cook_time_mins}
                    onChange={(e) => set("cook_time_mins", e.target.value)}
                    placeholder="45"
                    min="1"
                    className={fieldClass}
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                    required
                  />
                </div>
                <div className="p-3" style={{ backgroundColor: BG2 }}>
                  <label className={labelClass} style={{ color: `${CREAM}60` }}>Servings *</label>
                  <input
                    type="number"
                    value={form.servings}
                    onChange={(e) => set("servings", e.target.value)}
                    placeholder="4"
                    min="1"
                    className={fieldClass}
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                    required
                  />
                </div>
                <div className="p-3" style={{ backgroundColor: BG2 }}>
                  <label className={labelClass} style={{ color: `${CREAM}60` }}>Difficulty *</label>
                  <div className="relative">
                    <select
                      value={form.difficulty}
                      onChange={(e) => set("difficulty", e.target.value as RecipeForm["difficulty"])}
                      className={`${fieldClass} appearance-none pr-10`}
                      style={fieldStyle}
                      onFocus={fieldFocus}
                      onBlur={fieldBlur}
                      required
                    >
                      <option value="">Select…</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Image ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-6"
            style={{ backgroundColor: BG2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px" style={{ backgroundColor: MAGENTA }} />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.25em]" style={{ color: MAGENTA }}>
                Recipe Image
              </h2>
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed cursor-pointer transition-colors"
              style={{ backgroundColor: BG, borderColor: `${CREAM}10` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = MAGENTA)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = `${CREAM}10`)}
            >
              {form.image ? (
                <div className="text-center">
                  <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-extrabold uppercase tracking-tight text-sm" style={{ color: CREAM }}>{form.image.name}</p>
                  <p className="text-xs mt-1" style={{ color: `${CREAM}40` }}>Click to change</p>
                </div>
              ) : form.existingImageUrl ? (
                <div className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.existingImageUrl}
                    alt="Current"
                    className="w-20 h-20 object-cover mx-auto mb-2 opacity-80"
                  />
                  <p className="text-xs" style={{ color: `${CREAM}40` }}>Current image - click to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="font-extrabold uppercase tracking-tight text-sm" style={{ color: CREAM }}>Upload Recipe Image</p>
                  <p className="text-xs mt-1" style={{ color: `${CREAM}35` }}>PNG, JPG - max 5 MB (optional)</p>
                </div>
              )}
            </label>
          </motion.div>

          {/* ── Ingredients ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6"
            style={{ backgroundColor: BG2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px" style={{ backgroundColor: MAGENTA }} />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.25em]" style={{ color: MAGENTA }}>
                Ingredients *
              </h2>
            </div>
            <p className="text-xs mb-5 ml-9" style={{ color: `${CREAM}40` }}>
              Enter amount, unit (optional), and ingredient name
            </p>

            {/* Input row */}
            <div className="grid grid-cols-[80px_110px_1fr_auto] gap-1 mb-3">
              <input
                type="text"
                value={ingredientRow.amount}
                onChange={(e) => setIngredientRow((r) => ({ ...r, amount: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                placeholder="2"
                className={`${fieldClass} text-center`}
                style={fieldStyle}
                onFocus={fieldFocus}
                onBlur={fieldBlur}
              />
              <div className="relative">
                <select
                  value={ingredientRow.unit}
                  onChange={(e) => setIngredientRow((r) => ({ ...r, unit: e.target.value }))}
                  className={`${fieldClass} appearance-none pr-7`}
                  style={fieldStyle}
                  onFocus={fieldFocus}
                  onBlur={fieldBlur}
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>{u || "unit"}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                value={ingredientRow.name}
                onChange={(e) => setIngredientRow((r) => ({ ...r, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                placeholder="e.g., basmati rice"
                className={fieldClass}
                style={fieldStyle}
                onFocus={fieldFocus}
                onBlur={fieldBlur}
              />
              <motion.button
                type="button"
                onClick={addIngredient}
                className="w-11 flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: DEEP }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = MAGENTA)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = DEEP)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Ingredient list */}
            <AnimatePresence>
              {form.ingredients.map((ing, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between px-4 py-2.5 border mb-1"
                  style={{ backgroundColor: BG, borderColor: `${CREAM}08` }}
                >
                  <span className="text-sm font-normal" style={{ color: `${CREAM}75` }}>
                    {[ing.amount, ing.unit, ing.name].filter(Boolean).join(" ")}
                  </span>
                  <button type="button" onClick={() => removeIngredient(i)}
                    className="text-red-400 hover:text-red-300 transition-colors ml-3">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ── Instructions ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="p-6"
            style={{ backgroundColor: BG2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px" style={{ backgroundColor: MAGENTA }} />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.25em]" style={{ color: MAGENTA }}>
                Instructions *
              </h2>
            </div>

            <div className="flex gap-1 mb-3">
              <textarea
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); addInstruction(); } }}
                placeholder="Describe this cooking step… (Ctrl+Enter to add)"
                rows={2}
                className={`${fieldClass} flex-1 resize-none`}
                style={fieldStyle}
                onFocus={fieldFocus}
                onBlur={fieldBlur}
              />
              <motion.button
                type="button"
                onClick={addInstruction}
                className="text-white px-5 font-extrabold uppercase tracking-tighter self-start h-11.5 flex items-center"
                style={{ backgroundColor: DEEP }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = MAGENTA)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = DEEP)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>

            <AnimatePresence>
              {form.instructions.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex gap-3 p-4 border mb-1"
                  style={{ backgroundColor: BG, borderColor: `${CREAM}08` }}
                >
                  <div
                    className="w-7 h-7 flex items-center justify-center font-extrabold text-white text-sm shrink-0"
                    style={{ backgroundColor: MAGENTA }}
                  >
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm font-normal" style={{ color: `${CREAM}75` }}>
                    {step}
                  </p>
                  <button type="button" onClick={() => removeInstruction(i)}
                    className="text-red-400 hover:text-red-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ── Submit ──────────────────────────────────────────── */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 font-extrabold uppercase tracking-tighter text-base flex items-center justify-center gap-3 transition-all"
            style={
              isSubmitting
                ? { backgroundColor: BG2, color: `${CREAM}40`, cursor: 'not-allowed' }
                : { backgroundColor: DEEP, color: 'white' }
            }
            whileHover={!isSubmitting ? { scale: 1.01 } : {}}
            whileTap={!isSubmitting ? { scale: 0.99 } : {}}
          >
            {isSubmitting ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> {isEditMode ? "Saving…" : "Uploading…"}</>
            ) : isEditMode ? (
              <><Pencil className="w-6 h-6" /> Save Changes</>
            ) : (
              <><Upload className="w-6 h-6" /> Upload Recipe</>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
