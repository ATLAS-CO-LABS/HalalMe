"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  BadgeCheck,
  ChefHat,
  Send,
} from "lucide-react";
import { mockPosts, mockComments, Comment } from "@/data/hubMockData";
import Avatar from "@/components/hub/Avatar";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const post = mockPosts.find((p) => p.id === id);

  const [postData, setPostData] = useState(post);
  const [comments, setComments] = useState<Comment[]>(
    mockComments.filter((c) => c.postId === id)
  );
  const [newComment, setNewComment] = useState("");

  if (!postData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Post not found</h2>
          <Link href="/hub/feed">
            <motion.button
              className="text-[#FF8A1E] hover:text-[#CC6A0F] transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Back to Feed
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    setPostData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      };
    });
  };

  const handleCommentLike = (commentId: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        postId: id,
        user: {
          id: "current-user",
          name: "You",
          username: "@you",
          avatar: "/images/services/kitchen.jpg",
        },
        content: newComment,
        likes: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        timestamp: "Just now",
      };
      setComments([...comments, comment]);
      setPostData((prev) => {
        if (!prev) return prev;
        return { ...prev, comments: prev.comments + 1 };
      });
      setNewComment("");
    }
  };

  const isRecipePost = postData.type === "recipe";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/hub/feed">
              <motion.button
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
            </Link>
            <h1
              className="text-xl md:text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Post
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-8">
        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden mb-6"
        >
          {/* User Info */}
          <div className="p-4 md:p-5 flex items-center gap-3">
            <Avatar src={postData.user.avatar} alt={postData.user.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className="font-semibold text-white text-base"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {postData.user.name}
                </h3>
                {postData.user.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-[#FF8A1E] fill-[#FF8A1E]" />
                )}
              </div>
              <p
                className="text-gray-400 text-sm font-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {postData.user.username} • {postData.timestamp}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 md:px-5 pb-4">
            <p
              className="text-white text-lg leading-relaxed font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {postData.content}
            </p>
          </div>

          {/* Recipe Badge */}
          {isRecipePost && postData.recipeTitle && (
            <div className="px-4 md:px-5 pb-4">
              <Link href={`/kitchen/recipes/${postData.recipeId}`}>
                <motion.div
                  className="bg-gradient-to-br from-[#FF8A1E]/20 to-[#CC6A0F]/20 border border-[#FF8A1E]/30 rounded-xl p-4 hover:border-[#FF8A1E] transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FF8A1E] p-3 rounded-lg">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#FF8A1E] text-xs font-semibold uppercase tracking-wide mb-1">
                        Recipe
                      </p>
                      <h4
                        className="text-white font-bold text-lg"
                        style={{ fontFamily: "var(--font-headline)" }}
                      >
                        {postData.recipeTitle}
                      </h4>
                    </div>
                    <div className="text-[#FF8A1E] text-sm font-semibold">
                      View Recipe →
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          )}

          {/* Post Image */}
          {postData.image && (
            <div className="relative w-full aspect-[16/10] bg-gray-700">
              <Image
                src={postData.image}
                alt="Post image"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="p-4 md:p-5 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <motion.button
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    postData.isLiked ? "text-red-500" : "text-gray-400"
                  } hover:text-red-500 transition-colors`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      postData.isLiked ? "fill-red-500" : ""
                    }`}
                  />
                  <span className="text-base font-semibold">
                    {postData.likes}
                  </span>
                </motion.button>

                <div className="flex items-center gap-2 text-gray-400">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-base font-semibold">
                    {postData.comments}
                  </span>
                </div>
              </div>

              <motion.button
                className="text-gray-400 hover:text-[#FF8A1E] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
        >
          {/* Add Comment */}
          <div className="p-4 md:p-5 border-b border-gray-700">
            <div className="flex items-start gap-3">
              <Avatar alt="You" size="md" />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A1E] font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                />
                <motion.button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className={`p-2.5 rounded-full ${
                    newComment.trim()
                      ? "bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] text-white"
                      : "bg-gray-700 text-gray-500"
                  }`}
                  whileHover={newComment.trim() ? { scale: 1.1 } : {}}
                  whileTap={newComment.trim() ? { scale: 0.9 } : {}}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="divide-y divide-gray-700">
            {comments.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p
                  className="text-gray-400 font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  No comments yet. Be the first to comment!
                </p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 md:p-5"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className="font-semibold text-white text-sm"
                          style={{ fontFamily: "var(--font-headline)" }}
                        >
                          {comment.user.name}
                        </h4>
                        <span
                          className="text-gray-400 text-xs font-normal"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {comment.timestamp}
                        </span>
                      </div>
                      <p
                        className="text-gray-300 text-sm mb-2 font-normal"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <motion.button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center gap-1 text-xs ${
                            comment.isLiked ? "text-red-500" : "text-gray-400"
                          } hover:text-red-500 transition-colors`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              comment.isLiked ? "fill-red-500" : ""
                            }`}
                          />
                          {comment.likes > 0 && (
                            <span className="font-semibold">
                              {comment.likes}
                            </span>
                          )}
                        </motion.button>
                        <button className="text-xs text-gray-400 hover:text-[#FF8A1E] transition-colors font-semibold">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
