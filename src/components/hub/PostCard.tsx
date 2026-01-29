"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  ChefHat,
  BadgeCheck,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { Post } from "@/data/hubMockData";
import Avatar from "./Avatar";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  isOwnPost?: boolean;
}

export default function PostCard({
  post,
  onLike,
  onEdit,
  onDelete,
  onUserClick,
  isOwnPost = false,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isRecipePost = post.type === "recipe";

  return (
    <motion.div
      className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
      whileHover={{ y: -2 }}
    >
      {/* User Info */}
      <div className="p-4 md:p-5 flex items-center gap-3">
        <div
          onClick={() => onUserClick?.(post.user.id)}
          className="cursor-pointer"
        >
          <Avatar src={post.user.avatar} alt={post.user.name} size="lg" />
        </div>
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onUserClick?.(post.user.id)}
        >
          <div className="flex items-center gap-2">
            <h3
              className="font-semibold text-white text-base hover:text-[#FF8A1E] transition-colors"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {post.user.name}
            </h3>
            {post.user.isVerified && (
              <BadgeCheck className="w-4 h-4 text-[#FF8A1E] fill-[#FF8A1E]" />
            )}
          </div>
          <p
            className="text-gray-400 text-sm font-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {post.user.username} • {post.timestamp}
          </p>
        </div>

        {/* Three Dot Menu */}
        {isOwnPost && (
          <div className="relative">
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl border border-gray-700 shadow-xl overflow-hidden z-10"
                >
                  <button
                    onClick={() => {
                      onEdit?.(post.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">Edit Post</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(post.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-500 hover:bg-gray-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">Delete Post</span>
                  </button>
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

      {/* Recipe Badge (if recipe post) */}
      {isRecipePost && post.recipeTitle && (
        <div className="px-4 md:px-5 pb-4">
          <Link href={`/kitchen/recipes/${post.recipeId}`}>
            <motion.div
              className="bg-gradient-to-br from-[#FF8A1E]/20 to-[#CC6A0F]/20 border border-[#FF8A1E]/30 rounded-xl p-4 hover:border-[#FF8A1E] transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#FF8A1E] p-2 rounded-lg">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[#FF8A1E] text-xs font-semibold uppercase tracking-wide mb-1">
                    Recipe
                  </p>
                  <h4
                    className="text-white font-bold text-base"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {post.recipeTitle}
                  </h4>
                </div>
                <div className="text-[#FF8A1E] text-sm font-semibold">
                  View →
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      )}

      {/* Post Image */}
      {post.image && (
        <Link href={`/hub/post/${post.id}`}>
          <div className="relative w-full aspect-[16/10] bg-gray-700 cursor-pointer overflow-hidden group">
            <Image
              src={post.image}
              alt="Post image"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}

      {/* Actions */}
      <div className="p-4 md:p-5 border-t border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-2 ${
                post.isLiked ? "text-red-500" : "text-gray-400"
              } hover:text-red-500 transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                className={`w-5 h-5 ${post.isLiked ? "fill-red-500" : ""}`}
              />
              <span className="text-sm font-semibold">{post.likes}</span>
            </motion.button>

            <Link href={`/hub/post/${post.id}`}>
              <motion.button
                className="flex items-center gap-2 text-gray-400 hover:text-[#FF8A1E] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{post.comments}</span>
              </motion.button>
            </Link>
          </div>

          <motion.button
            className="text-gray-400 hover:text-[#FF8A1E] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Comment Preview */}
        {post.comments > 0 && (
          <Link href={`/hub/post/${post.id}`}>
            <motion.div
              className="text-gray-400 hover:text-gray-300 text-sm cursor-pointer font-normal"
              style={{ fontFamily: "var(--font-body)" }}
              whileHover={{ x: 4 }}
            >
              View all {post.comments} comments
            </motion.div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
