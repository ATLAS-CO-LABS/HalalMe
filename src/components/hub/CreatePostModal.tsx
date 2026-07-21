"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import type { PostType, Profile } from "@/types";
import { withTimeout } from "@/lib/withTimeout";
import { friendlyError } from "@/lib/friendlyError";
import Avatar from "./Avatar";

const BG = "#0B0D0F";
const BG2 = "#111418";
const AMBER = "#F59E0B";
const CREAM = "#F7E7CE";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the text content, optional media File, and post type.
   *  Should return a Promise so the modal can show a loading state. */
  onSubmit: (
    content: string,
    mediaFile?: File,
    postType?: PostType,
    onProgress?: (percent: number) => void
  ) => Promise<void>;
  currentUser: Profile | null;
}

const POST_TYPES: { value: PostType; label: string; emoji: string }[] = [
  { value: "general",  label: "Post",     emoji: "💬" },
  { value: "recipe",   label: "Recipe",   emoji: "🍽️" },
  { value: "question", label: "Question", emoji: "❓" },
  { value: "review",   label: "Review",   emoji: "⭐" },
];

const PLACEHOLDERS: Record<PostType, string> = {
  general:  "What's on your mind?",
  recipe:   "Share a recipe or cooking tip...",
  question: "Ask the community something...",
  review:   "Write your review...",
};

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
    if (selectedFile) setUploadProgress(0);
    try {
      // Media uploads (esp. video on mobile) can take a while — give them room.
      // Text-only posts keep the tight 30s timeout.
      const timeoutMs = selectedFile ? 120_000 : 30_000;
      await withTimeout(
        onSubmit(content.trim(), selectedFile ?? undefined, postType, selectedFile ? setUploadProgress : undefined),
        timeoutMs
      );
      handleClose();
    } catch (err) {
      console.error("[CreatePost]", err);
      setError(friendlyError(err, "Failed to create post. Please try again."));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
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
            className="fixed inset-0 bg-black/70 z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "tween", duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border shadow-2xl"
              style={{ backgroundColor: BG2, borderColor: `${CREAM}12` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b" style={{ borderColor: `${CREAM}10` }}>
                <h2
                  className="text-lg md:text-xl font-extrabold uppercase tracking-tight"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  Create Post
                </h2>
                <motion.button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="transition-colors disabled:opacity-50"
                  style={{ color: `${CREAM}45` }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}45`)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* User Info */}
              <div className="p-4 md:p-5 flex items-center gap-3 border-b" style={{ borderColor: `${CREAM}10` }}>
                <Avatar src={avatarUrl} alt={displayName} size="lg" />
                <div>
                  <h3
                    className="font-semibold"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    {displayName}
                  </h3>
                  {username && (
                    <p
                      className="text-sm font-normal"
                      style={{ color: `${CREAM}45`, fontFamily: "var(--font-body)" }}
                    >
                      {username}
                    </p>
                  )}
                </div>
              </div>

              {/* Post type selector */}
              <div className="px-4 md:px-5 pt-4 flex gap-2 flex-wrap">
                {POST_TYPES.map((pt) => {
                  const active = postType === pt.value;
                  return (
                    <button
                      key={pt.value}
                      onClick={() => setPostType(pt.value)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide border transition-colors"
                      style={
                        active
                          ? { backgroundColor: AMBER, color: BG, borderColor: AMBER }
                          : { backgroundColor: "transparent", color: `${CREAM}55`, borderColor: `${CREAM}15` }
                      }
                    >
                      <span>{pt.emoji}</span>
                      {pt.label}
                    </button>
                  );
                })}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-5">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={PLACEHOLDERS[postType]}
                  className="w-full text-base resize-none focus:outline-none min-h-30 font-normal border p-3"
                  style={{ backgroundColor: BG, borderColor: `${CREAM}12`, color: CREAM, caretColor: AMBER, fontFamily: "var(--font-body)" }}
                  autoFocus
                  disabled={isSubmitting}
                />

                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative mt-4 overflow-hidden border"
                    style={{ borderColor: `${CREAM}12` }}
                  >
                    <div className="relative w-full aspect-video">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      {uploadProgress !== null && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                          <span className="text-2xl font-extrabold" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                            {uploadProgress}%
                          </span>
                          <div className="w-2/3 h-1.5 overflow-hidden" style={{ backgroundColor: `${CREAM}20` }}>
                            <div
                              className="h-full transition-all duration-150"
                              style={{ width: `${uploadProgress}%`, backgroundColor: AMBER }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <motion.button
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white p-2 hover:bg-black/80 transition-colors"
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
              <div className="p-4 md:p-5 border-t" style={{ borderColor: `${CREAM}10` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/mp4,video/quicktime"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="p-2 transition-colors disabled:opacity-50"
                      style={{ color: `${CREAM}45` }}
                      onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.color = AMBER)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}45`)}
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
                    className="flex items-center gap-2 px-6 py-2.5 font-extrabold uppercase tracking-tighter text-sm transition-all"
                    style={
                      content.trim() && !isSubmitting
                        ? { backgroundColor: AMBER, color: BG }
                        : { backgroundColor: BG, color: `${CREAM}30`, cursor: "not-allowed" }
                    }
                    whileHover={content.trim() && !isSubmitting ? { scale: 1.05 } : {}}
                    whileTap={content.trim() && !isSubmitting ? { scale: 0.95 } : {}}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting
                      ? uploadProgress !== null
                        ? `Uploading… ${uploadProgress}%`
                        : "Posting..."
                      : "Post"}
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
