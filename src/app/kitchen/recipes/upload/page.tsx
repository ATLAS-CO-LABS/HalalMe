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
  cuisineOther: string;
  prep_time_mins: string;
  cook_time_mins: string;
  servings: string;
  difficulty: "easy" | "medium" | "hard" | "";
  tags: string[];
  ingredients: IngredientRow[];
  instructions: string[];
  image: File | null;
  existingImageUrl: string | null;
}

// ── Styles ──────────────────────────────────────────────────────────
const fieldClass =
  "w-full text-white px-4 py-3 border focus:outline-none transition-colors text-base font-normal";
// Number inputs: strip the native up/down spinner arrows.
const numberFieldClass =
  `${fieldClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0`;
const labelClass = "block font-extrabold uppercase tracking-tighter mb-2 text-xs";

const fieldStyleBase = {
  backgroundColor: BG2,
  borderColor: `${CREAM}10`,
  caretColor: MAGENTA,
};

const CUISINES = [
  "Middle Eastern", "South Asian", "Turkish", "Moroccan", "Lebanese",
  "Egyptian", "Persian", "Malaysian", "Indonesian", "West African",
  "Mediterranean", "British", "Other",
];

// Known units → canonical form. Used to detect the unit token while parsing
// a free-text ingredient like "2 cups basmati rice".
const UNIT_ALIASES: Record<string, string> = {
  g: "g", gram: "g", grams: "g",
  kg: "kg", kilogram: "kg", kilograms: "kg",
  ml: "ml", milliliter: "ml", millilitre: "ml", milliliters: "ml", millilitres: "ml",
  l: "L", liter: "L", litre: "L", liters: "L", litres: "L",
  cup: "cup", cups: "cups",
  tbsp: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
  tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp",
  oz: "oz", ounce: "oz", ounces: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  piece: "piece", pieces: "pieces", pc: "piece", pcs: "pieces",
  slice: "slice", slices: "slices",
  clove: "clove", cloves: "cloves",
  pinch: "pinch", pinches: "pinch",
  can: "can", cans: "cans",
  handful: "handful", handfuls: "handfuls",
  dash: "dash", dashes: "dash",
  sprig: "sprig", sprigs: "sprigs",
  stick: "stick", sticks: "sticks",
};

// Matches a leading quantity: 2 · 1.5 · 1,5 · 1/2 · ½ · 2-3
const AMOUNT_RE = /^(\d+(?:[.,]\d+)?|\d*\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?$/;

// Parse "2 cups basmati rice" → { amount: "2", unit: "cups", name: "basmati rice" }.
// Forgiving: missing amount/unit are fine, and anything unrecognised stays in the name.
function parseIngredient(input: string): IngredientRow {
  const text = input.trim();
  if (!text) return { amount: "", unit: "", name: "" };

  let tokens = text.split(/\s+/);
  let amount = "";
  let unit = "";

  if (tokens.length > 1 && AMOUNT_RE.test(tokens[0])) {
    amount = tokens[0];
    tokens = tokens.slice(1);
    // Mixed number: "1 1/2 cups"
    if (tokens.length > 1 && /^\d+\/\d+$/.test(tokens[0]) && /^\d+$/.test(amount)) {
      amount = `${amount} ${tokens[0]}`;
      tokens = tokens.slice(1);
    }
  }

  if (tokens.length > 1) {
    const candidate = tokens[0].toLowerCase().replace(/\.$/, "");
    if (UNIT_ALIASES[candidate]) {
      unit = UNIT_ALIASES[candidate];
      tokens = tokens.slice(1);
    }
  }

  const name = tokens.join(" ").trim();
  // Nothing usable left as a name → keep the whole input as the name.
  if (!name) return { amount: "", unit: "", name: text };
  return { amount, unit, name };
}

const MAX_TAGS = 8;

// ── Custom themed dropdown (replaces native <select>) ────────────────
function Dropdown({
  value, onChange, options, placeholder, compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const hasValue = !!selected && selected.value !== "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${compact ? "px-3 py-3" : "px-4 py-3"} w-full border focus:outline-none transition-colors text-base font-normal flex items-center justify-between text-left`}
        style={{ ...fieldStyleBase, borderColor: open ? MAGENTA : `${CREAM}10` }}
      >
        <span className="truncate" style={{ color: hasValue || selected ? "#fff" : `${CREAM}35` }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0 ml-1.5 transition-transform duration-200`}
          style={{ color: `${CREAM}50`, transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border shadow-2xl"
            style={{ backgroundColor: BG2, borderColor: `${CREAM}15` }}
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <li key={o.value || "__empty"} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between"
                    style={{
                      color: active ? MAGENTA : `${CREAM}80`,
                      backgroundColor: active ? `${MAGENTA}14` : "transparent",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${CREAM}08`)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = active ? `${MAGENTA}14` : "transparent")}
                  >
                    {o.label}
                    {active && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [notification, setNotification]   = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [ingredientInput, setIngredientInput]       = useState("");
  const [currentInstruction, setCurrentInstruction] = useState("");
  const [currentTag, setCurrentTag]                 = useState("");
  const ingredientInputRef                          = useRef<HTMLInputElement>(null);
  const instructionInputRef                         = useRef<HTMLTextAreaElement>(null);
  const [editingIngredient, setEditingIngredient]   = useState<number | null>(null);
  const [editingInstruction, setEditingInstruction] = useState<number | null>(null);

  const [form, setForm] = useState<RecipeForm>({
    title:            "",
    description:      "",
    cuisine:          "",
    cuisineOther:     "",
    prep_time_mins:   "",
    cook_time_mins:   "",
    servings:         "",
    difficulty:       "",
    tags:             [],
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
      const loadedCuisine = recipe.cuisine ?? "";
      const isKnownCuisine = CUISINES.includes(loadedCuisine);
      setForm({
        title:            recipe.title ?? "",
        description:      recipe.description ?? "",
        cuisine:          loadedCuisine ? (isKnownCuisine ? loadedCuisine : "Other") : "",
        cuisineOther:     loadedCuisine && !isKnownCuisine ? loadedCuisine : "",
        prep_time_mins:   recipe.prep_time_mins != null ? String(recipe.prep_time_mins) : "",
        cook_time_mins:   recipe.cook_time_mins != null ? String(recipe.cook_time_mins) : "",
        servings:         recipe.servings       != null ? String(recipe.servings)       : "",
        difficulty:       (recipe.difficulty as RecipeForm["difficulty"]) ?? "",
        tags:             Array.isArray(recipe.tags) ? recipe.tags : [],
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
    const parsed = parseIngredient(ingredientInput);
    if (!parsed.name.trim()) return;
    setForm((prev) => {
      if (editingIngredient !== null) {
        const next = [...prev.ingredients];
        next[editingIngredient] = parsed;            // replace in place
        return { ...prev, ingredients: next };
      }
      return { ...prev, ingredients: [...prev.ingredients, parsed] };
    });
    setEditingIngredient(null);
    setIngredientInput("");
    // Keep focus for rapid, keyboard-only entry (esp. on mobile).
    ingredientInputRef.current?.focus();
  };

  const editIngredient = (index: number) => {
    const ing = form.ingredients[index];
    setIngredientInput([ing.amount, ing.unit, ing.name].filter(Boolean).join(" "));
    setEditingIngredient(index);
    ingredientInputRef.current?.focus();
  };

  const removeIngredient = (index: number) =>
    setForm((prev) => {
      // Editing the row being removed → cancel edit; clear the input too.
      if (editingIngredient === index) { setEditingIngredient(null); setIngredientInput(""); }
      else if (editingIngredient !== null && index < editingIngredient) setEditingIngredient(editingIngredient - 1);
      return { ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) };
    });

  // ── Instructions ──────────────────────────────────────────────────
  const addInstruction = () => {
    const text = currentInstruction.trim();
    if (!text) return;
    setForm((prev) => {
      if (editingInstruction !== null) {
        const next = [...prev.instructions];
        next[editingInstruction] = text;             // replace in place (keeps step order)
        return { ...prev, instructions: next };
      }
      return { ...prev, instructions: [...prev.instructions, text] };
    });
    setEditingInstruction(null);
    setCurrentInstruction("");
    // Keep focus for rapid, keyboard-only entry (esp. on mobile).
    instructionInputRef.current?.focus();
  };

  const editInstruction = (index: number) => {
    setCurrentInstruction(form.instructions[index]);
    setEditingInstruction(index);
    instructionInputRef.current?.focus();
  };

  const removeInstruction = (index: number) =>
    setForm((prev) => {
      if (editingInstruction === index) { setEditingInstruction(null); setCurrentInstruction(""); }
      else if (editingInstruction !== null && index < editingInstruction) setEditingInstruction(editingInstruction - 1);
      return { ...prev, instructions: prev.instructions.filter((_, i) => i !== index) };
    });

  // ── Tags ──────────────────────────────────────────────────────────
  const addTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (!tag) return;
    setForm((prev) => {
      if (prev.tags.includes(tag) || prev.tags.length >= MAX_TAGS) return prev;
      return { ...prev, tags: [...prev.tags, tag] };
    });
    setCurrentTag("");
  };

  const removeTag = (index: number) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));

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
    if (form.cuisine === "Other" && !form.cuisineOther.trim())
                                  return "Please enter your cuisine.";
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
        cuisine:          form.cuisine === "Other" ? form.cuisineOther.trim() : form.cuisine,
        difficulty:       form.difficulty as "easy" | "medium" | "hard",
        prep_time_mins:   form.prep_time_mins ? Number(form.prep_time_mins) : null,
        cook_time_mins:   Number(form.cook_time_mins),
        servings:         Number(form.servings),
        ingredients:      form.ingredients,
        instructions:     form.instructions.map((text, i) => ({ step: i + 1, text })),
        is_published:     true,
        is_ai_generated:  false,
        is_halal_verified: false,
        tags:             form.tags,
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
        setUploadProgress(0);
        await recipeService.uploadRecipeImage(recipeId, form.image, setUploadProgress);
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
      setUploadProgress(null);
    }
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
  const fieldStyle = fieldStyleBase;
  const fieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = MAGENTA);
  const fieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
                  maxLength={120}
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
                  maxLength={500}
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
                <Dropdown
                  value={form.cuisine}
                  onChange={(v) => set("cuisine", v)}
                  placeholder="Select cuisine…"
                  options={CUISINES.map((c) => ({ value: c, label: c }))}
                />
                <AnimatePresence>
                  {form.cuisine === "Other" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        value={form.cuisineOther}
                        onChange={(e) => set("cuisineOther", e.target.value)}
                        placeholder="Enter your cuisine…"
                        maxLength={40}
                        className={`${fieldClass} mt-2`}
                        style={fieldStyle}
                        onFocus={fieldFocus}
                        onBlur={fieldBlur}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    inputMode="numeric"
                    className={numberFieldClass}
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
                    inputMode="numeric"
                    className={numberFieldClass}
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
                    inputMode="numeric"
                    className={numberFieldClass}
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                    required
                  />
                </div>
                <div className="p-3" style={{ backgroundColor: BG2 }}>
                  <label className={labelClass} style={{ color: `${CREAM}60` }}>Difficulty *</label>
                  <Dropdown
                    value={form.difficulty}
                    onChange={(v) => set("difficulty", v as RecipeForm["difficulty"])}
                    placeholder="Select…"
                    compact
                    options={[
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" },
                    ]}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={labelClass} style={{ color: `${CREAM}60` }}>
                  Tags <span style={{ color: `${CREAM}35` }}>(optional · helps people find your recipe)</span>
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder={form.tags.length >= MAX_TAGS ? "Tag limit reached" : "e.g., spicy, vegetarian, ramadan"}
                    disabled={form.tags.length >= MAX_TAGS}
                    maxLength={24}
                    className={`${fieldClass} flex-1 disabled:opacity-50`}
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                  />
                  <motion.button
                    type="button"
                    onClick={addTag}
                    disabled={form.tags.length >= MAX_TAGS}
                    className="w-11 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: DEEP }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = MAGENTA)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = DEEP)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <AnimatePresence>
                      {form.tags.map((tag, i) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                          style={{ backgroundColor: `${MAGENTA}18`, color: CREAM }}
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(i)}
                            className="opacity-60 hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
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
              Type it naturally — e.g. “2 cups basmati rice”, then press Enter
            </p>

            {/* Single smart input — parses amount + unit + name */}
            <div className="flex gap-1 mb-3">
              <input
                ref={ingredientInputRef}
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIngredient(); } }}
                placeholder={editingIngredient !== null ? "Edit ingredient…" : "e.g., 2 cups basmati rice"}
                enterKeyHint="done"
                autoCapitalize="none"
                autoComplete="off"
                className={`${fieldClass} flex-1`}
                style={fieldStyle}
                onFocus={fieldFocus}
                onBlur={fieldBlur}
              />
              <motion.button
                type="button"
                onClick={addIngredient}
                aria-label={editingIngredient !== null ? "Save ingredient" : "Add ingredient"}
                className="w-12 shrink-0 flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: DEEP }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = MAGENTA)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = DEEP)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                {editingIngredient !== null ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
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
                  style={{ backgroundColor: BG, borderColor: editingIngredient === i ? MAGENTA : `${CREAM}08` }}
                >
                  <span className="text-sm font-normal" style={{ color: `${CREAM}75` }}>
                    {[ing.amount, ing.unit, ing.name].filter(Boolean).join(" ")}
                  </span>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button type="button" onClick={() => editIngredient(i)} aria-label="Edit ingredient"
                      className="transition-colors" style={{ color: `${CREAM}45` }}
                      onMouseEnter={e => (e.currentTarget.style.color = MAGENTA)}
                      onMouseLeave={e => (e.currentTarget.style.color = `${CREAM}45`)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => removeIngredient(i)} aria-label="Remove ingredient"
                      className="text-red-400 hover:text-red-300 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
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
                ref={instructionInputRef}
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addInstruction(); } }}
                placeholder={editingInstruction !== null
                  ? "Edit this step… (Enter to save)"
                  : "Describe this step, then press Enter (Shift+Enter for a new line)"}
                rows={2}
                enterKeyHint="done"
                className={`${fieldClass} flex-1 resize-none`}
                style={fieldStyle}
                onFocus={fieldFocus}
                onBlur={fieldBlur}
              />
              <motion.button
                type="button"
                onClick={addInstruction}
                aria-label={editingInstruction !== null ? "Save step" : "Add step"}
                className="text-white px-5 font-extrabold uppercase tracking-tighter self-start h-11.5 flex items-center"
                style={{ backgroundColor: DEEP }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = MAGENTA)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = DEEP)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                {editingInstruction !== null ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
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
                  style={{ backgroundColor: BG, borderColor: editingInstruction === i ? MAGENTA : `${CREAM}08` }}
                >
                  <div
                    className="w-7 h-7 flex items-center justify-center font-extrabold text-white text-sm shrink-0"
                    style={{ backgroundColor: MAGENTA }}
                  >
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm font-normal whitespace-pre-wrap" style={{ color: `${CREAM}75` }}>
                    {step}
                  </p>
                  <div className="flex items-start gap-2 shrink-0">
                    <button type="button" onClick={() => editInstruction(i)} aria-label="Edit step"
                      className="transition-colors" style={{ color: `${CREAM}45` }}
                      onMouseEnter={e => (e.currentTarget.style.color = MAGENTA)}
                      onMouseLeave={e => (e.currentTarget.style.color = `${CREAM}45`)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => removeInstruction(i)} aria-label="Remove step"
                      className="text-red-400 hover:text-red-300 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ── Submit ──────────────────────────────────────────── */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="relative w-full px-8 py-4 font-extrabold uppercase tracking-tighter text-base flex items-center justify-center gap-3 transition-all overflow-hidden"
            style={
              isSubmitting
                ? { backgroundColor: BG2, color: `${CREAM}40`, cursor: 'not-allowed' }
                : { backgroundColor: DEEP, color: 'white' }
            }
            whileHover={!isSubmitting ? { scale: 1.01 } : {}}
            whileTap={!isSubmitting ? { scale: 0.99 } : {}}
          >
            {isSubmitting && uploadProgress !== null && (
              <span
                className="absolute inset-y-0 left-0 transition-all duration-150"
                style={{ width: `${uploadProgress}%`, backgroundColor: `${MAGENTA}20` }}
              />
            )}
            <span className="relative flex items-center justify-center gap-3">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {uploadProgress !== null
                    ? `Uploading… ${uploadProgress}%`
                    : isEditMode ? "Saving…" : "Uploading…"}
                </>
              ) : isEditMode ? (
                <><Pencil className="w-6 h-6" /> Save Changes</>
              ) : (
                <><Upload className="w-6 h-6" /> Upload Recipe</>
              )}
            </span>
          </motion.button>
        </form>
      </div>
    </div>
  );
}
