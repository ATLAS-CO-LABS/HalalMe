"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X, ImagePlus, Loader2, MessageSquare, ChefHat, HelpCircle, Star, RotateCcw, Film,
  AlertCircle, Gift, Info,
} from "lucide-react";
import type { Post, PostType, Profile, RecipeSummary } from "@/types";
import { hubService, PostValidationError, type RecipeShareStatus } from "@/services/hubService";
import { withTimeout, TimeoutError } from "@/lib/withTimeout";
import { friendlyError } from "@/lib/friendlyError";
import { useModalDismiss } from "@/hooks/useModalDismiss";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { usePostMediaUploads, type MediaItem } from "@/hooks/usePostMediaUploads";
import {
  validateDraft, sharePointsHint, LIMITS, IMAGE_TYPES, VIDEO_TYPES, type DraftField,
} from "@/lib/socialComposer";
import Avatar from "./Avatar";
import RecipePicker from "./RecipePicker";
import RecipeShareCard from "./RecipeShareCard";
import { StarInput } from "./StarRating";

const BG = "var(--hub-bg)";
const BG2 = "var(--hub-bg2)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";
const MUTED = "var(--hm-text-muted)";
const SUBTLE = "var(--hm-text-subtle)";
const BORDER = "color-mix(in oklab, var(--hm-text) 8%, transparent)";
const DIVIDER = "color-mix(in oklab, var(--hm-text) 6%, transparent)";

export interface PostedMeta {
  /** Points the recipe_share rule actually granted for this post (0 if none). */
  pointsAwarded: number;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPosted: (post: Post, meta: PostedMeta) => void;
  currentUser: Profile | null;
  /** Open on a specific type, e.g. from a "Share to Social" button. */
  initialType?: PostType;
  /** Preselect the recipe for a Recipe post. */
  initialRecipe?: RecipeSummary | null;
}

const TYPES: { value: PostType; label: string; hint: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "general",  label: "Post",     hint: "An update or a photo",   icon: MessageSquare },
  { value: "recipe",   label: "Recipe",   hint: "Share a Kitchen recipe", icon: ChefHat },
  { value: "question", label: "Question", hint: "Ask the community",      icon: HelpCircle },
  { value: "review",   label: "Review",   hint: "Rate a place or product", icon: Star },
];

const SUBMIT_LABEL: Record<PostType, string> = {
  general: "Post",
  recipe: "Share recipe",
  question: "Ask",
  review: "Post review",
};

const FIELD_ID: Record<DraftField, string> = {
  content: "cp-content",
  title: "cp-title",
  reviewSubject: "cp-subject",
  rating: "cp-rating",
  recipe: "cp-recipe",
  media: "cp-media",
};

const ACCEPT = [...IMAGE_TYPES, ...VIDEO_TYPES, ".heic", ".heif"].join(",");

/**
 * Composer for the four Social post types. Each one has its own fields,
 * validation and resulting post shape (see lib/socialComposer and the
 * validate_post() trigger), rather than one textarea with a label on top.
 *
 * Submission order is what keeps posts whole:
 *   1. Attachments upload as soon as they're picked, into the folder for this
 *      compose session's post id.
 *   2. Post is only enabled once every upload has finished.
 *   3. One insert creates the post with its media already attached. Retrying
 *      after a timeout reuses the same id, so it can't create a duplicate.
 */
export default function CreatePostModal(props: CreatePostModalProps) {
  return (
    <AnimatePresence>
      {props.isOpen && <Composer {...props} />}
    </AnimatePresence>
  );
}

function Composer({ onClose, onPosted, currentUser, initialType = "general", initialRecipe = null }: CreatePostModalProps) {
  // A fresh id per open: the upload folder and the idempotency key.
  const [postId] = useState(() => crypto.randomUUID());
  const [type, setType] = useState<PostType>(initialRecipe ? "recipe" : initialType);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(0);
  const [recipe, setRecipe] = useState<RecipeSummary | null>(initialRecipe);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [shareStatus, setShareStatus] = useState<RecipeShareStatus | null>(null);
  const [dragging, setDragging] = useState(false);

  const media = usePostMediaUploads(postId);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useFocusTrap(dialogRef, true);

  const liveMedia = media.items.filter((i) => i.status !== "error");
  const hasPhoto = liveMedia.some((i) => i.kind === "image");
  const hasVideo = liveMedia.some((i) => i.kind === "video");
  const canAddMore = !hasVideo && liveMedia.length < LIMITS.mediaMax;

  const errors = useMemo(
    () => validateDraft({ type, content, title, reviewSubject: subject, rating, recipeId: recipe?.id ?? null, mediaCount: liveMedia.length }),
    [type, content, title, subject, rating, recipe?.id, liveMedia.length],
  );
  const shown = showErrors ? errors : {};

  const dirty = !!(content.trim() || title.trim() || subject.trim() || rating || media.items.length || (recipe && recipe.id !== initialRecipe?.id));

  // What sharing this recipe would earn. Evaluated server-side by the same
  // check the post trigger uses, so the hint can't promise points that won't
  // arrive.
  useEffect(() => {
    if (type !== "recipe" || !recipe) { setShareStatus(null); return; }
    const controller = new AbortController();
    hubService.getRecipeShareStatus(recipe.id, controller.signal).then((s) => {
      if (!controller.signal.aborted) setShareStatus(s);
    });
    return () => controller.abort();
  }, [type, recipe]);

  const hint = type === "recipe" ? sharePointsHint(shareStatus, hasPhoto) : { tone: "none" as const, text: "" };
  const isOwnDraft = !!recipe && !recipe.is_published && recipe.user_id === currentUser?.id;

  const close = () => {
    media.discardAll();
    onClose();
  };

  const requestClose = () => {
    if (submitting) return;
    if (dirty && !confirmDiscard) { setConfirmDiscard(true); return; }
    close();
  };

  // Escape: first press asks to discard a non-empty draft, second confirms.
  useModalDismiss(true, requestClose, !submitting);

  const switchType = (t: PostType) => {
    setType(t);
    setShowErrors(false);
    setSubmitError(null);
  };

  const addFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const rejected = media.addFiles(files);
    setMediaNotice(rejected.length ? rejected.join(" ") : null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const focusField = (field: DraftField) => {
    const el = document.getElementById(FIELD_ID[field]);
    const target = el?.matches("input,textarea,button") ? el : el?.querySelector<HTMLElement>("input,textarea,button");
    target?.focus();
  };

  const submit = async () => {
    if (submitting || !currentUser) return;
    setShowErrors(true);
    setSubmitError(null);

    const firstInvalid = (Object.keys(errors) as DraftField[])[0];
    if (firstInvalid) { focusField(firstInvalid); return; }
    if (media.busy) { setSubmitError("Hang on, your attachments are still uploading."); return; }
    if (media.failed) { setSubmitError("Some attachments didn't upload. Retry or remove them first."); return; }

    setSubmitting(true);
    const input = {
      id: postId,
      postType: type,
      content: content.trim(),
      title,
      reviewSubject: subject,
      rating,
      recipeId: recipe?.id ?? null,
      media: media.uploaded,
    };

    try {
      const create = () => withTimeout(hubService.createPost(currentUser.id, input), 20_000);
      let post: Post;
      try {
        post = await create();
      } catch (err) {
        // Same id, so if the first insert did land this returns it instead of
        // creating a second post.
        if (!(err instanceof TimeoutError)) throw err;
        post = await create();
      }
      media.commit();

      let pointsAwarded = 0;
      if (type === "recipe" && recipe && hint.tone === "earn") {
        pointsAwarded = await hubService.getRecipeSharePointsAwarded(currentUser.id, recipe.id).catch(() => 0);
      }

      onPosted(
        {
          ...post,
          profiles: post.profiles ?? {
            username: currentUser.username, full_name: currentUser.full_name, avatar_url: currentUser.avatar_url,
            is_verified: currentUser.is_verified, profile_flair: currentUser.profile_flair,
          },
        },
        { pointsAwarded },
      );
      onClose();
    } catch (err) {
      console.error("[CreatePost]", err);
      setSubmitError(
        err instanceof PostValidationError ? err.message : friendlyError(err, "Couldn't publish your post. Please try again."),
      );
      setSubmitting(false);
    }
  };

  const displayName = currentUser?.full_name ?? currentUser?.username ?? "You";
  const submitDisabled = submitting || media.busy;
  const submitLabel = submitting ? "Posting" : media.busy ? "Uploading" : SUBMIT_LABEL[type];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed inset-0 bg-black/70 z-90"
      />

      {/* The wrapper, not the backdrop beneath it, is what an outside click
          actually lands on, so it owns the dismiss. */}
      <div className="fixed inset-0 z-90 flex items-stretch sm:items-center justify-center sm:p-4" onClick={requestClose}>
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          transition={{ type: "tween", duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl h-dvh sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col border shadow-2xl"
          style={{ backgroundColor: BG2, borderColor: BORDER }}
          onClick={(e) => e.stopPropagation()}
          onDragOver={(e) => { if (canAddMore && e.dataTransfer.types.includes("Files")) { e.preventDefault(); setDragging(true); } }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cp-heading"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-b" style={{ borderColor: DIVIDER }}>
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={currentUser?.avatar_url ?? undefined} alt={displayName} size="md" flair={currentUser?.profile_flair} />
              <div className="min-w-0">
                <h2 id="cp-heading" className="text-base font-extrabold uppercase tracking-tight leading-tight" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                  Create post
                </h2>
                <p className="text-xs truncate" style={{ color: SUBTLE }}>Posting as {displayName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestClose}
              disabled={submitting}
              aria-label="Close"
              className="p-2 -mr-2 transition-colors hover:text-(--hm-text) disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
              style={{ color: SUBTLE }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type selector */}
          <div className="px-4 md:px-5 pt-4">
            <div
              role="tablist"
              aria-label="Post type"
              className="grid grid-cols-4 border"
              style={{ borderColor: BORDER }}
              onKeyDown={(e) => {
                const i = TYPES.findIndex((t) => t.value === type);
                const next = e.key === "ArrowRight" ? (i + 1) % TYPES.length : e.key === "ArrowLeft" ? (i + TYPES.length - 1) % TYPES.length : -1;
                if (next < 0) return;
                e.preventDefault();
                switchType(TYPES[next].value);
                document.getElementById(`cp-tab-${TYPES[next].value}`)?.focus();
              }}
            >
              {TYPES.map((t, i) => {
                const active = t.value === type;
                return (
                  <button
                    key={t.value}
                    id={`cp-tab-${t.value}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="cp-panel"
                    tabIndex={active ? 0 : -1}
                    disabled={submitting}
                    onClick={() => switchType(t.value)}
                    className={`flex flex-col items-center gap-1 px-1 py-2.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--hm-amber) ${i > 0 ? "border-l" : ""}`}
                    style={{
                      borderColor: BORDER,
                      backgroundColor: active ? AMBER : "transparent",
                      color: active ? BG : MUTED,
                    }}
                  >
                    <t.icon className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs" style={{ color: SUBTLE }} aria-live="polite">
              {TYPES.find((t) => t.value === type)?.hint}
            </p>
          </div>

          {/* Fields */}
          <div id="cp-panel" role="tabpanel" aria-labelledby={`cp-tab-${type}`} className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-5 py-4 space-y-4">
            {type === "recipe" && (
              <Field label="Recipe" error={shown.recipe} id={FIELD_ID.recipe}>
                {recipe ? (
                  <div className="space-y-2">
                    <RecipeShareCard recipe={recipe} mode="static" />
                    <div className="flex items-start justify-between gap-3">
                      {isOwnDraft ? (
                        <p className="text-xs leading-relaxed" style={{ color: SUBTLE }}>
                          This recipe is a draft. People can open it from your post, but it stays out of Explore until you publish it with a photo.
                        </p>
                      ) : <span />}
                      <button
                        type="button"
                        onClick={() => setRecipe(null)}
                        disabled={submitting}
                        className="shrink-0 text-xs font-bold uppercase tracking-wide hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                        style={{ color: AMBER }}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : currentUser ? (
                  <RecipePicker
                    userId={currentUser.id}
                    onSelect={setRecipe}
                    invalid={!!shown.recipe}
                    describedBy={shown.recipe ? `${FIELD_ID.recipe}-error` : undefined}
                  />
                ) : null}
              </Field>
            )}

            {type === "question" && (
              <Field label="Your question" error={shown.title} id={FIELD_ID.title} counter={`${title.trim().length}/${LIMITS.questionMax}`}>
                <input
                  id={FIELD_ID.title}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={LIMITS.questionMax + 20}
                  placeholder="e.g. Where can I buy halal gelatine in Leeds?"
                  disabled={submitting}
                  autoFocus
                  aria-invalid={!!shown.title || undefined}
                  aria-describedby={shown.title ? `${FIELD_ID.title}-error` : undefined}
                  className={inputClass(!!shown.title)}
                  style={inputStyle}
                />
              </Field>
            )}

            {type === "review" && (
              <>
                <Field label="What are you reviewing?" error={shown.reviewSubject} id={FIELD_ID.reviewSubject}>
                  <input
                    id={FIELD_ID.reviewSubject}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={LIMITS.subjectMax + 10}
                    placeholder="A restaurant, takeaway, butcher or product"
                    disabled={submitting}
                    autoFocus
                    aria-invalid={!!shown.reviewSubject || undefined}
                    aria-describedby={shown.reviewSubject ? `${FIELD_ID.reviewSubject}-error` : undefined}
                    className={inputClass(!!shown.reviewSubject)}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Rating" error={shown.rating} id={FIELD_ID.rating}>
                  <div id={FIELD_ID.rating}>
                    <StarInput
                      value={rating}
                      onChange={setRating}
                      disabled={submitting}
                      invalid={!!shown.rating}
                      describedBy={shown.rating ? `${FIELD_ID.rating}-error` : undefined}
                    />
                  </div>
                </Field>
              </>
            )}

            <Field
              label={
                type === "general" ? "Post"
                : type === "recipe" ? "Caption (optional)"
                : type === "question" ? "Details (optional)"
                : "Your review"
              }
              hideLabel={type === "general"}
              error={shown.content}
              id={FIELD_ID.content}
              counter={content.length > LIMITS.contentMax * 0.8 ? `${content.length.toLocaleString("en-GB")}/${LIMITS.contentMax.toLocaleString("en-GB")}` : undefined}
            >
              <textarea
                id={FIELD_ID.content}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={(e) => { if (e.clipboardData.files.length && canAddMore) { e.preventDefault(); addFiles(e.clipboardData.files); } }}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }}
                placeholder={
                  type === "general" ? "What's on your mind?"
                  : type === "recipe" ? "What makes this one worth cooking?"
                  : type === "question" ? "Add context: where you are, what you've already tried"
                  : "What was good, what wasn't, and was it halal-certified?"
                }
                rows={type === "general" ? 5 : 4}
                disabled={submitting}
                autoFocus={type === "general"}
                aria-invalid={!!shown.content || undefined}
                aria-describedby={shown.content ? `${FIELD_ID.content}-error` : undefined}
                className={`${inputClass(!!shown.content)} resize-none min-h-28 leading-relaxed`}
                style={inputStyle}
              />
            </Field>

            {/* Attachments */}
            {(media.items.length > 0 || dragging) && (
              <div id={FIELD_ID.media}>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: SUBTLE }}>
                  {hasVideo ? "Video" : `Photos ${liveMedia.length}/${LIMITS.mediaMax}`}
                </p>
                <ul className="grid grid-cols-4 gap-2" aria-label="Attachments">
                  {media.items.map((it) => (
                    <MediaTile key={it.key} item={it} disabled={submitting} onRetry={() => media.retry(it.key)} onRemove={() => media.remove(it.key)} />
                  ))}
                  {dragging && canAddMore && (
                    <li className="aspect-square border-2 border-dashed flex items-center justify-center text-xs font-semibold" style={{ borderColor: AMBER, color: AMBER }}>
                      Drop to add
                    </li>
                  )}
                </ul>
              </div>
            )}
            {mediaNotice && (
              <p className="flex items-start gap-2 text-sm text-red-400" role="alert">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {mediaNotice}
              </p>
            )}

            {hint.tone !== "none" && (
              <p
                className="flex items-start gap-2 text-sm px-3 py-2.5 border"
                style={
                  hint.tone === "earn"
                    ? { color: CREAM, borderColor: "color-mix(in oklab, var(--hm-amber) 35%, transparent)", backgroundColor: "color-mix(in oklab, var(--hm-amber) 8%, transparent)" }
                    : { color: MUTED, borderColor: BORDER }
                }
              >
                {hint.tone === "earn"
                  ? <Gift className="w-4 h-4 mt-0.5 shrink-0" style={{ color: AMBER }} aria-hidden />
                  : <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />}
                {hint.text}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 md:px-5 py-3.5 border-t" style={{ borderColor: DIVIDER }}>
            {submitError && (
              <p className="mb-3 flex items-start gap-2 text-sm text-red-400" role="alert">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {submitError}
              </p>
            )}

            {confirmDiscard ? (
              <div className="flex flex-wrap items-center justify-between gap-3" role="alertdialog" aria-label="Discard post?">
                <p className="text-sm font-semibold" style={{ color: CREAM }}>Discard this post?</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDiscard(false)}
                    autoFocus
                    className="px-4 py-2 text-sm font-semibold hover:text-(--hm-text) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                    style={{ color: MUTED }}
                  >
                    Keep editing
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT}
                    multiple
                    onChange={(e) => addFiles(e.target.files)}
                    className="hidden"
                    disabled={submitting || !canAddMore}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={submitting || !canAddMore}
                    aria-label={type === "recipe" ? "Add a photo of your dish" : "Add photos or a video"}
                    title={canAddMore ? (type === "recipe" ? "Add a photo of your dish" : "Add photos or a video") : "Attachment limit reached"}
                    className="inline-flex items-center gap-2 px-2.5 py-2 text-sm font-semibold transition-colors hover:text-(--hm-amber) disabled:opacity-40 disabled:hover:text-inherit focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                    style={{ color: MUTED }}
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="hidden sm:inline">{type === "recipe" ? "Add dish photo" : "Photo / video"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={submitDisabled}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold uppercase tracking-tight transition-opacity disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)"
                  style={{ backgroundColor: AMBER, color: BG }}
                >
                  {(submitting || media.busy) && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
                  {submitLabel}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

// Border colour lives in classes, not inline style: an inline borderColor
// outranks focus:border-*, which silently removed the focus state.
const inputClass = (invalid: boolean) =>
  "w-full text-base px-3 py-2.5 border focus:outline-none transition-colors font-normal disabled:opacity-60 " +
  (invalid
    ? "border-red-400/60 focus:border-red-400"
    : "border-[color-mix(in_oklab,var(--hm-text)_8%,transparent)] focus:border-(--hm-amber)");
const inputStyle: React.CSSProperties = {
  backgroundColor: BG,
  color: CREAM,
  caretColor: AMBER,
  fontFamily: "var(--font-body)",
};

function Field({
  label, hideLabel, error, id, counter, children,
}: { label: string; hideLabel?: boolean; error?: string; id: string; counter?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className={`flex items-baseline justify-between mb-1.5 ${hideLabel ? "sr-only" : ""}`}>
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>{label}</label>
        {counter && <span className="text-xs tabular-nums" style={{ color: SUBTLE }}>{counter}</span>}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

function MediaTile({ item, disabled, onRetry, onRemove }: { item: MediaItem; disabled: boolean; onRetry: () => void; onRemove: () => void }) {
  const label = item.kind === "video" ? "video" : "photo";
  return (
    <li className="relative aspect-square overflow-hidden border" style={{ borderColor: item.status === "error" ? "rgb(248 113 113 / 0.6)" : BORDER, backgroundColor: BG }}>
      {item.kind === "image" ? (
        <Image src={item.previewUrl} alt="" fill unoptimized sizes="120px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <video src={item.previewUrl} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
          <Film className="relative w-6 h-6 text-white drop-shadow" aria-hidden />
        </div>
      )}

      {(item.status === "processing" || item.status === "uploading") && (
        <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1.5 px-2" aria-live="polite">
          <span className="text-xs font-bold text-white tabular-nums">
            {item.status === "processing" ? "Preparing" : `${item.progress}%`}
          </span>
          <div className="w-full h-1 bg-white/25 overflow-hidden" role="progressbar" aria-label={`Uploading ${label}`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full transition-[width] duration-150" style={{ width: `${item.status === "processing" ? 4 : item.progress}%`, backgroundColor: AMBER }} />
          </div>
        </div>
      )}

      {item.status === "error" && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 p-1.5 text-center">
          <span className="text-[11px] leading-tight text-red-300 line-clamp-3" title={item.error ?? undefined}>{item.error}</span>
          <button
            type="button"
            onClick={onRetry}
            disabled={disabled}
            className="mt-0.5 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold uppercase text-white border border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
          >
            <RotateCcw className="w-3 h-3" aria-hidden /> Retry
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${label}`}
        className="absolute top-1 right-1 p-1 bg-black/65 text-white hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-(--hm-amber) disabled:opacity-50"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
