"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChefHat,
  BadgeCheck,
  MoreHorizontal,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { Post } from "@/types";
import { formatRelativeTime } from "@/lib/relativeTime";
import Avatar from "./Avatar";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string, currentIsLiked: boolean) => void;
  onBookmark?: (postId: string, currentIsBookmarked: boolean) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onBookmark,
  onEdit,
  onDelete,
  onUserClick,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isOwnPost = !!currentUserId && currentUserId === post.user_id;
  const isRecipePost = post.post_type === "recipe";

  const TYPE_BADGE: Record<string, { emoji: string; label: string; className: string }> = {
    recipe:   { emoji: "🍽️", label: "Recipe",   className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    question: { emoji: "❓", label: "Question", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    review:   { emoji: "⭐", label: "Review",   className: "bg-green-500/15 text-green-400 border-green-500/30" },
  };
  const typeBadge = post.post_type && post.post_type !== "general" ? TYPE_BADGE[post.post_type] : null;
  const displayName = post.profiles?.full_name ?? post.profiles?.username ?? "Unknown";
  const username = post.profiles?.username ? `@${post.profiles.username}` : null;
  const avatarUrl = post.profiles?.avatar_url ?? undefined;
  const isVerified = post.profiles?.is_verified ?? false;
  const firstImage = post.media_urls?.[0] ?? null;

  const handleShare = async () => {
    const url = `${window.location.origin}/hub/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers that block clipboard
    }
  };

  const handleDeleteConfirm = () => {
    onDelete?.(post.id);
    setMenuOpen(false);
    setConfirmingDelete(false);
  };

  return (
    <motion.div
      className="bg-[#111418] rounded-2xl border border-gray-800 overflow-hidden hover:border-amber-500/30 transition-colors"
      whileHover={{ y: -2 }}
    >
      {/* User Info */}
      <div className="p-4 md:p-5 flex items-center gap-3">
        <div
          onClick={() => onUserClick?.(post.user_id)}
          className="cursor-pointer shrink-0"
        >
          <Avatar src={avatarUrl} alt={displayName} size="lg" />
        </div>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onUserClick?.(post.user_id)}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3
              className="font-semibold text-white text-base hover:text-[#F59E0B] transition-colors truncate"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {displayName}
            </h3>
            {isVerified && (
              <BadgeCheck className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-gray-400 text-sm font-normal truncate"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {username && <span>{username} • </span>}
              {formatRelativeTime(post.created_at)}
            </p>
            {typeBadge && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeBadge.className}`}>
                {typeBadge.emoji} {typeBadge.label}
              </span>
            )}
          </div>
        </div>

        {/* Three-dot menu - own posts only */}
        {isOwnPost && (
          <div className="relative shrink-0">
            <motion.button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setConfirmingDelete(false);
              }}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
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
                  className="absolute right-0 mt-2 w-52 bg-[#0D1012] rounded-xl border border-gray-800 shadow-xl overflow-hidden z-10"
                >
                  {!confirmingDelete ? (
                    <>
                      <button
                        onClick={() => {
                          onEdit?.(post);
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-white hover:bg-gray-800/60 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">Edit Post</span>
                      </button>
                      <button
                        onClick={() => setConfirmingDelete(true)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-500 hover:bg-gray-800/60 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">Delete Post</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-4">
                      <p className="text-white text-sm font-semibold mb-3">
                        Delete this post?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmingDelete(false)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white text-sm font-semibold transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteConfirm}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 md:px-5 pb-4">
        <p
          className="text-white text-base leading-relaxed font-normal"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {post.content}
        </p>
      </div>

      {/* Recipe badge */}
      {isRecipePost && post.recipe_id && (
        <div className="px-4 md:px-5 pb-4">
          <Link href={`/kitchen/recipes/${post.recipe_id}`}>
            <motion.div
              className="bg-linear-to-br from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/30 rounded-xl p-4 hover:border-[#F59E0B] transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#F59E0B] p-2 rounded-lg shrink-0">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F59E0B] text-xs font-semibold uppercase tracking-wide mb-0.5">
                    Recipe
                  </p>
                  <p
                    className="text-white text-sm font-normal truncate"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    View linked recipe
                  </p>
                </div>
                <span className="text-[#F59E0B] text-sm font-semibold shrink-0">
                  View →
                </span>
              </div>
            </motion.div>
          </Link>
        </div>
      )}

      {/* Post image (first from media_urls) */}
      {firstImage && (
        <Link href={`/hub/post/${post.id}`}>
          <div className="relative w-full aspect-16/10 bg-gray-700 cursor-pointer overflow-hidden group">
            <Image
              src={firstImage}
              alt="Post image"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Multi-image indicator */}
            {(post.media_urls?.length ?? 0) > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                1/{post.media_urls!.length}
              </div>
            )}
          </div>
        </Link>
      )}

      {/* Actions */}
      <div className="p-4 md:p-5 border-t border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5">
            <motion.button
              onClick={() => onLike(post.id, !!post.is_liked)}
              className={`flex items-center gap-2 transition-colors ${
                post.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-5 h-5 ${post.is_liked ? "fill-red-500" : ""}`} />
              <span className="text-sm font-semibold">{post.like_count}</span>
            </motion.button>

            <Link href={`/hub/post/${post.id}`}>
              <motion.button
                className="flex items-center gap-2 text-gray-400 hover:text-[#F59E0B] transition-colors"
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
                onClick={() => onBookmark(post.id, !!post.is_bookmarked)}
                className={`transition-colors ${
                  post.is_bookmarked
                    ? "text-[#F59E0B]"
                    : "text-gray-400 hover:text-[#F59E0B]"
                }`}
                title={post.is_bookmarked ? "Remove bookmark" : "Bookmark"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bookmark className={`w-5 h-5 ${post.is_bookmarked ? "fill-[#F59E0B]" : ""}`} />
              </motion.button>
            )}
            <motion.button
              onClick={handleShare}
              className="text-gray-400 hover:text-[#F59E0B] transition-colors"
              title="Copy link"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Comment preview link */}
        {post.comment_count > 0 && (
          <Link href={`/hub/post/${post.id}`}>
            <motion.div
              className="text-gray-400 hover:text-gray-300 text-sm cursor-pointer font-normal"
              style={{ fontFamily: "var(--font-body)" }}
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
