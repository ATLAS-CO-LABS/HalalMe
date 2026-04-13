"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import type { PostType, Profile } from "@/types";
import Avatar from "./Avatar";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the text content, optional media File, and post type.
   *  Should return a Promise so the modal can show a loading state. */
  onSubmit: (content: string, mediaFile?: File, postType?: PostType) => Promise<void>;
  currentUser: Profile | null;
}

const POST_TYPES: { value: PostType; label: string; emoji: string }[] = [
  { value: "general", label: "Post", emoji: "💬" },
  { value: "recipe",  label: "Recipe", emoji: "🍽️" },
  { value: "question", label: "Question", emoji: "❓" },
  { value: "review",  label: "Review", emoji: "⭐" },
];

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("general");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(content.trim(), selectedFile ?? undefined, postType);
      handleClose();
    } catch (err) {
      console.error("[CreatePost]", err);
      setError(err instanceof Error ? err.message : "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setContent("");
    setPostType("general");
    setSelectedFile(null);
    setImagePreview(null);
    setError(null);
    onClose();
  };

  const displayName = currentUser?.full_name ?? currentUser?.username ?? "You";
  const username = currentUser?.username ? `@${currentUser.username}` : null;
  const avatarUrl = currentUser?.avatar_url ?? undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "tween", duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-700">
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Create Post
                </h2>
                <motion.button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* User Info */}
              <div className="p-4 md:p-5 flex items-center gap-3 border-b border-gray-700">
                <Avatar src={avatarUrl} alt={displayName} size="lg" />
                <div>
                  <h3
                    className="font-semibold text-white"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {displayName}
                  </h3>
                  {username && (
                    <p
                      className="text-gray-400 text-sm font-normal"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {username}
                    </p>
                  )}
                </div>
              </div>

              {/* Post type selector */}
              <div className="px-4 md:px-5 pt-4 flex gap-2 flex-wrap">
                {POST_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setPostType(pt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      postType === pt.value
                        ? "bg-[#F59E0B] text-white"
                        : "bg-gray-700 text-gray-400 hover:text-white border border-gray-600"
                    }`}
                  >
                    <span>{pt.emoji}</span>
                    {pt.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none focus:outline-none min-h-30 font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                  autoFocus
                  disabled={isSubmitting}
                />

                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative mt-4 rounded-xl overflow-hidden"
                  >
                    <div className="relative w-full aspect-video">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                    <motion.button
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}

                {error && (
                  <p className="mt-3 text-red-400 text-sm font-normal">{error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 md:p-5 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/mp4"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="text-gray-400 hover:text-[#F59E0B] p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50"
                      title="Attach image"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isSubmitting}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${
                      content.trim() && !isSubmitting
                        ? "bg-linear-to-br from-[#F59E0B] to-[#D97706] text-white hover:shadow-lg"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                    whileHover={content.trim() && !isSubmitting ? { scale: 1.05 } : {}}
                    whileTap={content.trim() && !isSubmitting ? { scale: 0.95 } : {}}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "Posting..." : "Post"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
