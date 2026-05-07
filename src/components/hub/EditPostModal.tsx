"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import type { Profile } from "@/types";
import { withTimeout } from "@/lib/withTimeout";
import Avatar from "./Avatar";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the updated content. Returns a Promise so the modal can
   *  show a loading state. Only content editing is supported (media changes
   *  are not supported by the backend updatePost endpoint). */
  onSubmit: (content: string) => Promise<void>;
  initialContent: string;
  currentUser: Profile | null;
}

export default function EditPostModal({
  isOpen,
  onClose,
  onSubmit,
  initialContent,
  currentUser,
}: EditPostModalProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync content when the modal opens with a new post
  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setError(null);
    }
  }, [isOpen, initialContent]);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await withTimeout(onSubmit(content.trim()), 10_000);
      onClose();
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
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
                  Edit Post
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
                {error && (
                  <p className="mt-3 text-red-400 text-sm font-normal">{error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 md:p-5 border-t border-gray-700">
                <div className="flex items-center justify-end gap-2">
                  <motion.button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-full font-semibold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
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
                    {isSubmitting ? "Saving..." : "Save"}
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
