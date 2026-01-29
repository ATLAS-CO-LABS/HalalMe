"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Smile, MapPin } from "lucide-react";
import Image from "next/image";
import Avatar from "./Avatar";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, image?: string) => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content, imagePreview || undefined);
      setContent("");
      setImagePreview(null);
    }
  };

  const handleClose = () => {
    setContent("");
    setImagePreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* User Info */}
              <div className="p-4 md:p-5 flex items-center gap-3 border-b border-gray-700">
                <Avatar alt="You" size="lg" />
                <div>
                  <h3
                    className="font-semibold text-white"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    You
                  </h3>
                  <p
                    className="text-gray-400 text-sm font-normal"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    @you
                  </p>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none focus:outline-none min-h-[120px] font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                  autoFocus
                />

                {/* Image Preview */}
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative mt-4 rounded-xl overflow-hidden"
                  >
                    <div className="relative w-full aspect-video">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <motion.button
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 md:p-5 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gray-400 hover:text-[#FF8A1E] p-2 rounded-full hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      className="text-gray-400 hover:text-[#FF8A1E] p-2 rounded-full hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Smile className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      className="text-gray-400 hover:text-[#FF8A1E] p-2 rounded-full hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MapPin className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                      content.trim()
                        ? "bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] text-white hover:shadow-lg"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                    whileHover={content.trim() ? { scale: 1.05 } : {}}
                    whileTap={content.trim() ? { scale: 0.95 } : {}}
                  >
                    Post
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
