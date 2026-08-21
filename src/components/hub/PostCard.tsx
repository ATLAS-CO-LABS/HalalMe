"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cldUrl, CLD_POST_IMG, isVideoUrl, cldVideoUrl, cldVideoPoster } from "@/lib/cldUrl";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChefHat,
  BadgeCheck,
  MoreHorizontal,
  Edit2,
  Check,
  Trash2,
  Flag,
  Star,
  HelpCircle,
} from "lucide-react";
import type { ComponentType } from "react";
import type { Post } from "@/types";
import { formatRelativeTime } from "@/lib/relativeTime";
import { useAuthGate } from "@/hooks/useAuthGate";
import ReportModal from "@/components/common/ReportModal";
import Avatar from "./Avatar";
import { getFlairTheme } from "@/lib/flairTheme";
import ProfileLink from "./ProfileLink";

const BG = "var(--hub-bg)";
const BG2 = "var(--hub-bg2)";
const BG3 = "var(--hub-bg3)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";
const MUTED = "var(--hm-text-muted)";
const SUBTLE = "var(--hm-text-subtle)";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string, currentIsLiked: boolean) => void;
  onBookmark?: (postId: string, currentIsBookmarked: boolean) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onBookmark,
  onEdit,
  onDelete,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { requireAuth } = useAuthGate();

  const isOwnPost = !!currentUserId && currentUserId === post.user_id;
  const isRecipePost = post.post_type === "recipe";

  const TYPE_BADGE: Record<string, { icon: ComponentType<{ className?: string }>; label: string; color: string }> = {
    recipe:   { icon: ChefHat,     label: "Recipe",   color: "#F59E0B" },
    question: { icon: HelpCircle,  label: "Question", color: "#60A5FA" },
    review:   { icon: Star,        label: "Review",   color: "#4ADE80" },
  };
  const typeBadge = post.post_type && post.post_type !== "general" ? TYPE_BADGE[post.post_type] : null;
  const displayName = post.profiles?.full_name ?? post.profiles?.username ?? "Unknown";
  const username = post.profiles?.username ? `@${post.profiles.username}` : null;
  const avatarUrl = post.profiles?.avatar_url ?? undefined;
  const authorFlair = post.profiles?.profile_flair ?? null;
  const flairTheme = getFlairTheme(authorFlair);
  const isVerified = post.profiles?.is_verified ?? false;
  const firstMedia = post.media_urls?.[0] ?? null;
  const mediaIsVideo = isVideoUrl(firstMedia);
  const firstImage = !mediaIsVideo ? (cldUrl(firstMedia, CLD_POST_IMG) ?? null) : null;
  const videoSrc = mediaIsVideo ? (cldVideoUrl(firstMedia) ?? null) : null;
  const videoPoster = mediaIsVideo ? cldVideoPoster(firstMedia) : undefined;

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/social/post/${post.id}`;
    const shareData = { title: post.profiles?.username ?? "HalalMe", text: post.content?.slice(0, 100), url };
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

  const handleDeleteConfirm = () => {
    onDelete?.(post.id);
    setMenuOpen(false);
    setConfirmingDelete(false);
  };

  return (
    <motion.div
      className="overflow-hidden transition-colors border"
      style={{ backgroundColor: BG2, borderColor: flairTheme ? flairTheme.cardBorder : `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}
      whileHover={{ y: -2, boxShadow: flairTheme ? `0 14px 32px -10px ${flairTheme.glow}` : undefined }}
      onMouseEnter={(e) => { if (!flairTheme) e.currentTarget.style.borderColor = `color-mix(in oklab, var(--hm-amber) 19%, transparent)`; }}
      onMouseLeave={(e) => { if (!flairTheme) e.currentTarget.style.borderColor = `color-mix(in oklab, var(--hm-text) 6%, transparent)`; }}
    >
      {/* User Info */}
      <div className="p-4 md:p-5 flex items-center gap-3">
        <ProfileLink userId={post.user_id} username={post.profiles?.username} className="shrink-0">
          <Avatar src={avatarUrl} alt={displayName} size="lg" flair={authorFlair} />
        </ProfileLink>

        <ProfileLink userId={post.user_id} username={post.profiles?.username} className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3
              className="font-extrabold text-base hover:text-(--flair-accent) transition-colors truncate"
              style={{ color: CREAM, fontFamily: "var(--font-headline)", "--flair-accent": flairTheme?.accent ?? AMBER } as CSSProperties}
            >
              {displayName}
            </h3>
            {isVerified && (
              <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: AMBER }} />
            )}
            {post.is_featured && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5" style={{ backgroundColor: CREAM, color: "#1C1C1C" }}>
                <Star className="w-2.5 h-2.5 fill-[#1C1C1C]" /> Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-normal truncate"
              style={{ color: SUBTLE, fontFamily: "var(--font-body)" }}
            >
              {username && <span>{username} • </span>}
              {formatRelativeTime(post.created_at)}
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
        </ProfileLink>

        {/* Three-dot menu — own posts: edit/delete · others: report */}
        <div className="relative shrink-0">
          <motion.button
            onClick={() => {
              setMenuOpen(!menuOpen);
              setConfirmingDelete(false);
            }}
            aria-label="Post options"
            className="p-2 transition-colors"
            style={{ color: SUBTLE }}
            onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
            onMouseLeave={(e) => (e.currentTarget.style.color = SUBTLE)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 mt-2 w-52 overflow-hidden z-10 border shadow-xl"
                style={{ backgroundColor: BG3, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}
              >
                {isOwnPost ? (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.(post);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors"
                      style={{ color: CREAM }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `color-mix(in oklab, var(--hm-text) 3%, transparent)`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Edit Post</span>
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setConfirmingDelete(true); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-500 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `color-mix(in oklab, var(--hm-text) 3%, transparent)`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Delete Post</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      requireAuth(() => setReportOpen(true), "Sign in to report content");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-400 transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `color-mix(in oklab, var(--hm-text) 3%, transparent)`)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Flag className="w-4 h-4" />
                    <span className="text-sm font-semibold">Report Post</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        contentType="post"
        contentId={post.id}
        contentLabel="post"
      />

      <DeletePostConfirm
        open={confirmingDelete}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Post Content */}
      <div className="px-4 md:px-5 pb-4">
        <p
          className="text-base leading-relaxed font-normal"
          style={{ color: CREAM, fontFamily: "var(--font-body)" }}
        >
          {post.content}
        </p>
      </div>

      {/* Recipe badge */}
      {isRecipePost && post.recipe_id && (
        <div className="px-4 md:px-5 pb-4">
          <Link href={`/kitchen/recipes/${post.recipe_id}`}>
            <motion.div
              className="p-4 border transition-colors cursor-pointer"
              style={{ backgroundColor: `color-mix(in oklab, var(--hm-amber) 7%, transparent)`, borderColor: `color-mix(in oklab, var(--hm-amber) 19%, transparent)` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = AMBER)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = `color-mix(in oklab, var(--hm-amber) 19%, transparent)`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 shrink-0" style={{ backgroundColor: AMBER }}>
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: AMBER }}>
                    Recipe
                  </p>
                  <p
                    className="text-sm font-normal truncate"
                    style={{ color: CREAM, fontFamily: "var(--font-body)" }}
                  >
                    View linked recipe
                  </p>
                </div>
                <span className="text-sm font-semibold shrink-0" style={{ color: AMBER }}>
                  View →
                </span>
              </div>
            </motion.div>
          </Link>
        </div>
      )}

      {/* Post media — video plays inline; image shows uncropped (natural aspect, capped height) */}
      {videoSrc ? (
        <div className="w-full bg-black flex items-center justify-center">
          <video
            src={videoSrc}
            poster={videoPoster}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-[75vh] object-contain bg-black"
          />
        </div>
      ) : firstImage ? (
        <Link href={`/social/post/${post.id}`}>
          <div className="relative w-full flex items-center justify-center cursor-pointer overflow-hidden group" style={{ backgroundColor: BG }}>
            <Image
              src={firstImage}
              alt="Post image"
              width={0}
              height={0}
              sizes="100vw"
              unoptimized
              className="w-full h-auto max-h-[75vh] object-contain group-hover:opacity-95 transition-opacity duration-300"
            />
            {/* Multi-image indicator */}
            {(post.media_urls?.length ?? 0) > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1">
                1/{post.media_urls!.length}
              </div>
            )}
          </div>
        </Link>
      ) : null}

      {/* Actions */}
      <div className="p-4 md:p-5 border-t" style={{ borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5">
            <motion.button
              onClick={() => requireAuth(() => onLike(post.id, !!post.is_liked), "Sign in to like posts")}
              className="flex items-center gap-2 transition-colors"
              style={{ color: post.is_liked ? "#EF4444" : SUBTLE }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-5 h-5 ${post.is_liked ? "fill-red-500" : ""}`} />
              <span className="text-sm font-semibold">{post.like_count}</span>
            </motion.button>

            <Link href={`/social/post/${post.id}`}>
              <motion.button
                className="flex items-center gap-2 transition-colors"
                style={{ color: SUBTLE }}
                onMouseEnter={(e) => (e.currentTarget.style.color = AMBER)}
                onMouseLeave={(e) => (e.currentTarget.style.color = SUBTLE)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{post.comment_count}</span>
              </motion.button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {onBookmark && (
              <motion.button
                onClick={() => requireAuth(() => onBookmark(post.id, !!post.is_bookmarked), "Sign in to bookmark posts")}
                className="transition-colors"
                style={{ color: post.is_bookmarked ? AMBER : SUBTLE }}
                title={post.is_bookmarked ? "Remove bookmark" : "Bookmark"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bookmark className={`w-5 h-5 ${post.is_bookmarked ? "fill-(--hm-amber)" : ""}`} />
              </motion.button>
            )}
            <motion.button
              onClick={handleShare}
              className="transition-colors"
              style={{ color: copied ? AMBER : SUBTLE }}
              title={copied ? "Copied!" : "Share"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Comment preview link */}
        {post.comment_count > 0 && (
          <Link href={`/social/post/${post.id}`}>
            <motion.div
              className="text-sm cursor-pointer font-normal transition-colors"
              style={{ color: SUBTLE, fontFamily: "var(--font-body)" }}
              whileHover={{ x: 4 }}
            >
              View all {post.comment_count} comment{post.comment_count !== 1 ? "s" : ""}
            </motion.div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// Standalone centered dialog (not the cramped inline swap that used to live
// inside the 208px-wide three-dot menu). Portalled to document.body for the
// same reason as ReportModal: PostCard gains an inline `transform` on hover,
// which traps `position: fixed` descendants inside its own box.
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm border shadow-2xl overflow-hidden"
        style={{ backgroundColor: BG3, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}
      >
        <div className="px-5 py-5 flex items-start gap-3">
          <span className="w-9 h-9 flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
            <Trash2 className="w-4 h-4 text-red-400" />
          </span>
          <div>
            <h2 id="delete-post-title" className="font-extrabold text-base" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
              Delete this post?
            </h2>
            <p className="text-sm mt-1" style={{ color: SUBTLE }}>
              You can undo this for a few seconds after.
            </p>
          </div>
        </div>
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2" style={{ borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{ color: MUTED }}
            onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
            onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
