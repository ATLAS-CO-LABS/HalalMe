"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import type { Post, PostType } from "@/types";
import { withTimeout } from "@/lib/withTimeout";
import { useModalDismiss } from "@/hooks/useModalDismiss";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { friendlyError } from "@/lib/friendlyError";
import { PostValidationError } from "@/services/hubService";
import { validateDraft, LIMITS } from "@/lib/socialComposer";

const BG = "var(--hub-bg)";
const BG2 = "var(--hub-bg2)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";
const MUTED = "var(--hm-text-muted)";
const SUBTLE = "var(--hm-text-subtle)";
const BORDER = "color-mix(in oklab, var(--hm-text) 8%, transparent)";
const DIVIDER = "color-mix(in oklab, var(--hm-text) 6%, transparent)";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  /** Saves the edit. Resolves when stored so the modal can show progress. */
  onSubmit: (changes: { content: string; title?: string | null }) => Promise<void>;
}

const CONTENT_LABEL: Record<PostType, string> = {
  general: "Post",
  recipe: "Caption",
  question: "Details",
  review: "Your review",
};

/**
 * Edits the text of a post. Type, recipe, rating and media are fixed once
 * posted (validate_post enforces that), so this only offers what can change,
 * and checks it against the same per-type rules as the composer.
 */
export default function EditPostModal({ isOpen, onClose, post, onSubmit }: EditPostModalProps) {
  const type = (post.post_type as PostType) ?? "general";
  const [content, setContent] = useState(post.content ?? "");
  const [title, setTitle] = useState(post.title ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      setContent(post.content ?? "");
      setTitle(post.title ?? "");
      setError(null);
    }
  }, [isOpen, post]);

  const errors = useMemo(() => validateDraft({
    type,
    content,
    title,
    reviewSubject: post.review_subject ?? "",
    rating: post.rating ?? 0,
    recipeId: post.recipe_id,
    mediaCount: post.media_urls?.length ?? 0,
  }), [type, content, title, post]);

  // Legacy recipe posts (from before recipes could be attached) have no
  // recipe_id; the only thing that can be checked on those is the text.
  const blocking = Object.entries(errors).filter(([k]) => !(k === "recipe" && !post.recipe_id));
  const unchanged = content === (post.content ?? "") && title === (post.title ?? "");

  const handleSubmit = async () => {
    if (isSubmitting || blocking.length || unchanged) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await withTimeout(onSubmit({ content: content.trim(), title: type === "question" ? title.trim() : undefined }), 10_000);
      onClose();
    } catch (err) {
      setError(err instanceof PostValidationError ? err.message : friendlyError(err, "Failed to save changes. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => { if (!isSubmitting) onClose(); };
  useModalDismiss(isOpen, handleClose, !isSubmitting);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 bg-black/70 z-90"
          />
          <div className="fixed inset-0 z-90 flex items-stretch sm:items-center justify-center sm:p-4" onClick={handleClose}>
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ type: "tween", duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl h-dvh sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col border shadow-2xl"
              style={{ backgroundColor: BG2, borderColor: BORDER }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ep-heading"
            >
              <div className="flex items-center justify-between px-4 md:px-5 py-3.5 border-b" style={{ borderColor: DIVIDER }}>
                <h2 id="ep-heading" className="text-base font-extrabold uppercase tracking-tight" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                  Edit post
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  aria-label="Close"
                  className="p-2 -mr-2 transition-colors hover:text-(--hm-text) disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ color: SUBTLE }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-5 py-4 space-y-4">
                {type === "question" && (
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <label htmlFor="ep-title" className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>Your question</label>
                      <span className="text-xs tabular-nums" style={{ color: SUBTLE }}>{title.trim().length}/{LIMITS.questionMax}</span>
                    </div>
                    <input
                      id="ep-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isSubmitting}
                      aria-invalid={!!errors.title || undefined}
                      aria-describedby={errors.title ? "ep-title-error" : undefined}
                      className={`w-full text-base px-3 py-2.5 border focus:outline-none ${errors.title ? "border-red-400/60 focus:border-red-400" : "border-[color-mix(in_oklab,var(--hm-text)_8%,transparent)] focus:border-(--hm-amber)"}`}
                      style={{ backgroundColor: BG, color: CREAM, caretColor: AMBER }}
                    />
                    {errors.title && <p id="ep-title-error" className="mt-1.5 text-sm text-red-400">{errors.title}</p>}
                  </div>
                )}

                {type === "review" && post.review_subject && (
                  <p className="text-sm" style={{ color: SUBTLE }}>
                    Reviewing <span className="font-semibold" style={{ color: CREAM }}>{post.review_subject}</span>. The rating can&apos;t be changed after posting.
                  </p>
                )}

                <div>
                  <label htmlFor="ep-content" className={`block mb-1.5 text-xs font-bold uppercase tracking-[0.12em] ${type === "general" ? "sr-only" : ""}`} style={{ color: MUTED }}>
                    {CONTENT_LABEL[type]}
                  </label>
                  <textarea
                    id="ep-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit(); } }}
                    placeholder="What's on your mind?"
                    rows={6}
                    autoFocus={type !== "question"}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.content || undefined}
                    aria-describedby={errors.content ? "ep-content-error" : undefined}
                    className={`w-full text-base resize-none focus:outline-none min-h-30 border p-3 leading-relaxed ${errors.content ? "border-red-400/60 focus:border-red-400" : "border-[color-mix(in_oklab,var(--hm-text)_8%,transparent)] focus:border-(--hm-amber)"}`}
                    style={{ backgroundColor: BG, color: CREAM, caretColor: AMBER, fontFamily: "var(--font-body)" }}
                  />
                  {errors.content && <p id="ep-content-error" className="mt-1.5 text-sm text-red-400">{errors.content}</p>}
                </div>

                {error && (
                  <p className="flex items-start gap-2 text-sm text-red-400" role="alert">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {error}
                  </p>
                )}
              </div>

              <div className="px-4 md:px-5 py-3.5 border-t flex items-center justify-end gap-2" style={{ borderColor: DIVIDER }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold transition-colors hover:text-(--hm-text) disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ color: MUTED }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || blocking.length > 0 || unchanged}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold uppercase tracking-tight disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)"
                  style={{ backgroundColor: AMBER, color: BG }}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
                  {isSubmitting ? "Saving" : "Save"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
