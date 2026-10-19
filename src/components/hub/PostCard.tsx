"use client";

import { useState, useEffect, useRef, type CSSProperties, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Heart, MessageCircle, Share2, Bookmark, ChefHat, BadgeCheck, MoreHorizontal, Edit2, Check,
  Trash2, Flag, Star, HelpCircle,
} from "lucide-react";
import type { Post } from "@/types";
import { formatRelativeTime } from "@/lib/relativeTime";
import { useAuthGate } from "@/hooks/useAuthGate";
import ReportModal from "@/components/common/ReportModal";
import Avatar from "./Avatar";
import { getFlairTheme } from "@/lib/flairTheme";
import ProfileLink from "./ProfileLink";
import PostBody from "./PostBody";

const BG2 = "var(--hub-bg2)";
const BG3 = "var(--hub-bg3)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";
const MUTED = "var(--hm-text-muted)";
const SUBTLE = "var(--hm-text-subtle)";
const DIVIDER = "color-mix(in oklab, var(--hm-text) 6%, transparent)";

export const TYPE_BADGE: Record<string, { icon: ComponentType<{ className?: string }>; label: string; color: string }> = {
  recipe:   { icon: ChefHat,    label: "Recipe",   color: "#F59E0B" },
  question: { icon: HelpCircle, label: "Question", color: "#60A5FA" },
  review:   { icon: Star,       label: "Review",   color: "#4ADE80" },
};

const ACTION_BTN =
  "inline-flex items-center gap-2 px-2 py-1.5 -mx-2 text-sm font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--hm-amber)";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string, currentIsLiked: boolean) => void;
  onBookmark?: (postId: string, currentIsBookmarked: boolean) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

/** Native share sheet, then clipboard, then a prompt as the last resort. */
export async function sharePostLink(post: Post): Promise<"shared" | "copied" | "prompted"> {
  const url = `${window.location.origin}/social/post/${post.id}`;
  const text = post.title ?? post.review_subject ?? post.recipe?.title ?? post.content?.slice(0, 100);
  const shareData = { title: "HalalMe Social", text, url };
  try {
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch (err) {
    // Dismissing the native share sheet is not a failure.
    if (err instanceof DOMException && err.name === "AbortError") return "shared";
    window.prompt("Copy this link:", url);
    return "prompted";
  }
}

export default function PostCard({ post, currentUserId, onLike, onBookmark, onEdit, onDelete }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { requireAuth } = useAuthGate();

  const isOwnPost = !!currentUserId && currentUserId === post.user_id;
  const typeBadge = post.post_type && post.post_type !== "general" ? TYPE_BADGE[post.post_type] : null;
  const displayName = post.profiles?.full_name ?? post.profiles?.username ?? "Unknown";
  const username = post.profiles?.username ? `@${post.profiles.username}` : null;
  const authorFlair = post.profiles?.profile_flair ?? null;
  const flairTheme = getFlairTheme(authorFlair);
  const isVerified = post.profiles?.is_verified ?? false;
  const isQuestion = post.post_type === "question";
  const commentNoun = isQuestion ? "answer" : "comment";

  // Close the menu on an outside click or Escape. It used to stay open until
  // its own toggle was pressed again.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleShare = async () => {
    const result = await sharePostLink(post);
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete?.(post.id);
    setMenuOpen(false);
    setConfirmingDelete(false);
  };

  return (
    <article
      // Border colour via classes so the hover state can win; a flair keeps its
      // own fixed border.
      className={`overflow-hidden border transition-[border-color,box-shadow] duration-200 ${
        flairTheme ? "" : "border-[color-mix(in_oklab,var(--hm-text)_6%,transparent)] hover:border-[color-mix(in_oklab,var(--hm-amber)_22%,transparent)]"
      }`}
      style={{
        backgroundColor: BG2,
        borderColor: flairTheme ? flairTheme.cardBorder : undefined,
        boxShadow: flairTheme ? `0 12px 28px -14px ${flairTheme.glow}` : undefined,
      }}
      aria-labelledby={`post-${post.id}-author`}
    >
      {/* Author */}
      <header className="p-4 md:p-5 flex items-center gap-3">
        <ProfileLink userId={post.user_id} username={post.profiles?.username} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)" ariaLabel={`${displayName}'s profile`}>
          <Avatar src={post.profiles?.avatar_url ?? undefined} alt="" size="lg" flair={authorFlair} />
        </ProfileLink>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <ProfileLink
              userId={post.user_id}
              username={post.profiles?.username}
              className="min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)"
            >
              <h3
                id={`post-${post.id}-author`}
                className="font-extrabold text-base hover:text-(--flair-accent) transition-colors truncate"
                style={{ color: CREAM, fontFamily: "var(--font-headline)", "--flair-accent": flairTheme?.accent ?? AMBER } as CSSProperties}
              >
                {displayName}
              </h3>
            </ProfileLink>
            {isVerified && <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: AMBER }} aria-label="Verified" />}
            {post.is_featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5" style={{ backgroundColor: CREAM, color: "#1C1C1C" }}>
                <Star className="w-2.5 h-2.5 fill-[#1C1C1C]" aria-hidden /> Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-normal truncate" style={{ color: SUBTLE, fontFamily: "var(--font-body)" }}>
              {username && <span>{username} · </span>}
              <Link href={`/social/post/${post.id}`} className="hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)">
                <time dateTime={post.created_at}>{formatRelativeTime(post.created_at)}</time>
              </Link>
            </p>
            {typeBadge && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border"
                style={{ color: typeBadge.color, borderColor: `${typeBadge.color}40`, backgroundColor: `${typeBadge.color}15` }}
              >
                <typeBadge.icon className="w-2.5 h-2.5" /> {typeBadge.label}
              </span>
            )}
          </div>
        </div>

        {/* Options: own posts edit/delete, others report */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => { setMenuOpen((v) => !v); setConfirmingDelete(false); }}
            aria-label="Post options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="p-2 -mr-2 transition-colors hover:text-(--hm-text) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
            style={{ color: SUBTLE }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-2 w-52 overflow-hidden z-10 border shadow-xl"
                style={{ backgroundColor: BG3, borderColor: DIVIDER }}
              >
                {isOwnPost ? (
                  <>
                    <MenuItem icon={Edit2} label="Edit Post" onClick={() => { onEdit?.(post); setMenuOpen(false); }} />
                    <MenuItem icon={Trash2} label="Delete Post" danger onClick={() => { setMenuOpen(false); setConfirmingDelete(true); }} />
                  </>
                ) : (
                  <MenuItem
                    icon={Flag}
                    label="Report Post"
                    danger
                    onClick={() => { setMenuOpen(false); requireAuth(() => setReportOpen(true), "Sign in to report content"); }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} contentType="post" contentId={post.id} contentLabel="post" />
      <DeletePostConfirm open={confirmingDelete} onCancel={() => setConfirmingDelete(false)} onConfirm={handleDeleteConfirm} />

      <PostBody post={post} />

      {/* Actions */}
      <footer className="px-4 md:px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: DIVIDER }}>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => requireAuth(() => onLike(post.id, !!post.is_liked), "Sign in to like posts")}
            aria-pressed={!!post.is_liked}
            aria-label={`${post.is_liked ? "Unlike" : "Like"} post, ${post.like_count} like${post.like_count === 1 ? "" : "s"}`}
            className={`${ACTION_BTN} ${post.is_liked ? "" : "hover:text-red-400"}`}
            style={{ color: post.is_liked ? "#EF4444" : SUBTLE }}
          >
            <Heart className={`w-5 h-5 transition-transform active:scale-90 ${post.is_liked ? "fill-red-500" : ""}`} aria-hidden />
            <span className="tabular-nums" aria-hidden>{post.like_count}</span>
          </button>

          <Link
            href={`/social/post/${post.id}`}
            aria-label={`${post.comment_count} ${commentNoun}${post.comment_count === 1 ? "" : "s"}, open post`}
            className={`${ACTION_BTN} hover:text-(--hm-amber)`}
            style={{ color: SUBTLE }}
          >
            <MessageCircle className="w-5 h-5" aria-hidden />
            <span className="tabular-nums" aria-hidden>{post.comment_count}</span>
            {isQuestion && <span className="hidden sm:inline font-medium" aria-hidden>{post.comment_count === 1 ? "answer" : "answers"}</span>}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {onBookmark && (
            <button
              type="button"
              onClick={() => requireAuth(() => onBookmark(post.id, !!post.is_bookmarked), "Sign in to save posts")}
              aria-pressed={!!post.is_bookmarked}
              aria-label={post.is_bookmarked ? "Remove from saved" : "Save post"}
              title={post.is_bookmarked ? "Saved" : "Save"}
              className={`${ACTION_BTN} hover:text-(--hm-amber)`}
              style={{ color: post.is_bookmarked ? AMBER : SUBTLE }}
            >
              <Bookmark className={`w-5 h-5 ${post.is_bookmarked ? "fill-(--hm-amber)" : ""}`} aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            aria-label={copied ? "Link copied" : "Share post"}
            title={copied ? "Link copied" : "Share"}
            className={`${ACTION_BTN} hover:text-(--hm-amber)`}
            style={{ color: copied ? AMBER : SUBTLE }}
          >
            {copied ? <Check className="w-5 h-5" aria-hidden /> : <Share2 className="w-5 h-5" aria-hidden />}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span>
        </div>
      </footer>

      {post.comment_count > 0 && (
        <Link
          href={`/social/post/${post.id}`}
          className="block px-4 md:px-5 pb-4 -mt-1 text-sm hover:underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--hm-amber)"
          style={{ color: MUTED, fontFamily: "var(--font-body)" }}
        >
          View {post.comment_count === 1 ? `1 ${commentNoun}` : `all ${post.comment_count} ${commentNoun}s`}
        </Link>
      )}
    </article>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: ComponentType<{ className?: string }>; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--hm-text)_4%,transparent)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--hm-amber) ${danger ? "text-red-400" : ""}`}
      style={danger ? undefined : { color: CREAM }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

// Standalone centered dialog, portalled to document.body so no transformed
// ancestor can trap its `position: fixed`.
function DeletePostConfirm({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-80 bg-black/70 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-post-title"
        aria-describedby="delete-post-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm border shadow-2xl overflow-hidden"
        style={{ backgroundColor: BG3, borderColor: DIVIDER }}
      >
        <div className="px-5 py-5 flex items-start gap-3">
          <span className="w-9 h-9 flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
            <Trash2 className="w-4 h-4 text-red-400" aria-hidden />
          </span>
          <div>
            <h2 id="delete-post-title" className="font-extrabold text-base" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
              Delete this post?
            </h2>
            <p id="delete-post-desc" className="text-sm mt-1" style={{ color: SUBTLE }}>
              You can undo this for a few seconds after.
            </p>
          </div>
        </div>
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2" style={{ borderColor: DIVIDER }}>
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="px-4 py-2.5 text-sm font-semibold transition-colors hover:text-(--hm-text) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
            style={{ color: MUTED }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            <Trash2 className="w-4 h-4" aria-hidden /> Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
