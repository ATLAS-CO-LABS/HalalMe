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
  existingImageUrl: string | null; // used in edit mode
}

// ── Styles ──────────────────────────────────────────────────────────
const fieldClass =
  "w-full bg-[#0C0918] text-white rounded-xl px-4 py-3 border border-white/8 focus:outline-none focus:border-fuchsia-500 transition-colors text-sm font-normal";
const labelClass = "block text-gray-300 font-semibold mb-2 text-sm";

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
      className={`flex items-start gap-3 p-4 rounded-xl border ${
        isSuccess
          ? "bg-emerald-900/20 border-emerald-500/20 text-emerald-300"
          : "bg-red-900/20 border-red-500/20 text-red-300"
      }`}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isSuccess ? "bg-emerald-500/20" : "bg-red-500/20"
      }`}>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#08060F' }}>
        <Loader2 className="w-8 h-8 text-fuchsia-400 animate-spin" />
      </div>
    }>
      <UploadRecipeInner />
    </Suspense>
  );
}

function UploadRecipeInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const editId       = searchParams.get("edit"); // null = create mode
  const isEditMode   = !!editId;

  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  // Stays current across renders so the doSubmit closure always gets fresh user.
  const userRef = useRef(user);
  userRef.current = user;

  const [loadingRecipe, setLoadingRecipe] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [notification, setNotification]   = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [ingredientRow, setIngredientRow]         = useState<IngredientRow>({ amount: "", unit: "", name: "" });
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
    if (!currentUser) return; // safety net — requireAuth guarantees this won't happen
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
      <div className="min-h-screen py-6 md:py-8 flex items-center justify-center" style={{ backgroundColor: '#08060F' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-fuchsia-400 animate-spin mx-auto mb-3" />
          <p className="text-[#F7E7CE]/60 text-sm">Loading recipe…</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen py-6 md:py-8" style={{ backgroundColor: '#08060F' }}>
      <div className="mx-auto max-w-4xl px-4 md:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 md:gap-4 mb-3">
            <Link href="/kitchen/recipes">
              <motion.button
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
            </Link>
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-bold text-white"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {isEditMode ? "Edit Recipe" : "Upload Your Recipe"}
            </h1>
          </div>
          <p className="text-sm text-[#F7E7CE]/60 font-normal ml-9 md:ml-10" style={{ fontFamily: "var(--font-body)" }}>
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

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Basic Info ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#130F1F] rounded-2xl p-6 border border-white/8"
          >
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-headline)" }}>
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className={labelClass}>Recipe Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g., Chicken Biryani"
                  className={fieldClass}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief description of your recipe..."
                  rows={3}
                  className={`${fieldClass} resize-none`}
                  required
                />
              </div>

              {/* Cuisine */}
              <div>
                <label className={labelClass}>Cuisine *</label>
                <div className="relative">
                  <select
                    value={form.cuisine}
                    onChange={(e) => set("cuisine", e.target.value)}
                    className={`${fieldClass} appearance-none pr-10`}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Prep Time (mins)</label>
                  <input
                    type="number"
                    value={form.prep_time_mins}
                    onChange={(e) => set("prep_time_mins", e.target.value)}
                    placeholder="15"
                    min="0"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cook Time (mins) *</label>
                  <input
                    type="number"
                    value={form.cook_time_mins}
                    onChange={(e) => set("cook_time_mins", e.target.value)}
                    placeholder="45"
                    min="1"
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Servings *</label>
                  <input
                    type="number"
                    value={form.servings}
                    onChange={(e) => set("servings", e.target.value)}
                    placeholder="4"
                    min="1"
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Difficulty *</label>
                  <div className="relative">
                    <select
                      value={form.difficulty}
                      onChange={(e) => set("difficulty", e.target.value as RecipeForm["difficulty"])}
                      className={`${fieldClass} appearance-none pr-10`}
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
            className="bg-[#130F1F] rounded-2xl p-6 border border-white/8"
          >
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-headline)" }}>
              Recipe Image
            </h2>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-44 bg-[#0C0918] border-2 border-dashed border-white/8 rounded-xl cursor-pointer hover:border-fuchsia-500 transition-colors"
            >
              {form.image ? (
                <div className="text-center">
                  <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">{form.image.name}</p>
                  <p className="text-[#F7E7CE]/60 text-xs mt-1">Click to change</p>
                </div>
              ) : form.existingImageUrl ? (
                <div className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.existingImageUrl}
                    alt="Current"
                    className="w-20 h-20 object-cover rounded-lg mx-auto mb-2 opacity-80"
                  />
                  <p className="text-[#F7E7CE]/60 text-xs">Current image — click to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">Upload Recipe Image</p>
                  <p className="text-[#F7E7CE]/60 text-xs mt-1">PNG, JPG — max 5 MB (optional)</p>
                </div>
              )}
            </label>
          </motion.div>

          {/* ── Ingredients ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#130F1F] rounded-2xl p-6 border border-white/8"
          >
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-headline)" }}>
              Ingredients *
            </h2>
            <p className="text-[#F7E7CE]/60 text-xs mb-5" style={{ fontFamily: "var(--font-body)" }}>
              Enter amount, unit (optional), and ingredient name
            </p>

            {/* Input row */}
            <div className="grid grid-cols-[80px_110px_1fr_auto] gap-2 mb-4">
              <input
                type="text"
                value={ingredientRow.amount}
                onChange={(e) => setIngredientRow((r) => ({ ...r, amount: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                placeholder="2"
                className={`${fieldClass} text-center`}
              />
              <div className="relative">
                <select
                  value={ingredientRow.unit}
                  onChange={(e) => setIngredientRow((r) => ({ ...r, unit: e.target.value }))}
                  className={`${fieldClass} appearance-none pr-7`}
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
              />
              <motion.button
                type="button"
                onClick={addIngredient}
                className="h-11.5 w-11.5 bg-linear-to-br from-fuchsia-600 to-pink-600 text-white rounded-xl flex items-center justify-center"
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
                  className="flex items-center justify-between bg-[#0C0918] rounded-lg px-4 py-2.5 border border-white/8 mb-2"
                >
                  <span className="text-gray-300 text-sm font-normal" style={{ fontFamily: "var(--font-body)" }}>
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
            className="bg-[#130F1F] rounded-2xl p-6 border border-white/8"
          >
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-headline)" }}>
              Instructions *
            </h2>

            <div className="flex gap-2 mb-4">
              <textarea
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); addInstruction(); } }}
                placeholder="Describe this cooking step… (Ctrl+Enter to add)"
                rows={2}
                className={`${fieldClass} flex-1 resize-none`}
              />
              <motion.button
                type="button"
                onClick={addInstruction}
                className="bg-linear-to-br from-fuchsia-600 to-pink-600 text-white rounded-xl px-5 font-semibold self-start h-11.5 flex items-center"
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
                  className="flex gap-3 bg-[#0C0918] rounded-lg p-4 border border-white/8 mb-2"
                >
                  <div className="w-7 h-7 bg-fuchsia-500 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {i + 1}
                  </div>
                  <p className="flex-1 text-gray-300 text-sm font-normal" style={{ fontFamily: "var(--font-body)" }}>
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
            className={`w-full rounded-2xl px-8 py-4 font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all ${
              isSubmitting
                ? "bg-[#130F1F] text-[#F7E7CE]/60 cursor-not-allowed"
                : "bg-linear-to-br from-fuchsia-600 to-pink-600 text-white"
            }`}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
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
