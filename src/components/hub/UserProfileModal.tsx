"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, BadgeCheck } from "lucide-react";
import { User, Post } from "@/data/hubMockData";
import Avatar from "./Avatar";
import PostCard from "./PostCard";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  userPosts: Post[];
  onLike: (postId: string) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  userPosts,
  onLike,
}: UserProfileModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Cover */}
              <div className="relative">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F]" />

                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Profile Info */}
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-16">
                    <div className="relative">
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        size="xl"
                        className="border-4 border-gray-800"
                      />
                    </div>
                    <div className="flex-1 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h2
                          className="text-2xl font-bold text-white"
                          style={{ fontFamily: "var(--font-headline)" }}
                        >
                          {user.name}
                        </h2>
                        {user.isVerified && (
                          <BadgeCheck className="w-6 h-6 text-[#FF8A1E] fill-[#FF8A1E]" />
                        )}
                      </div>
                      <p
                        className="text-gray-400 font-normal"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {user.username}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p
                    className="text-gray-300 mt-4 font-normal"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Food lover 🍽️ | Halal cooking enthusiast | Sharing my
                    culinary journey with the world ✨
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Global</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined Jan 2024</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div>
                      <span className="text-white font-bold text-lg">
                        {userPosts.length}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">Posts</span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-lg">1.2K</span>
                      <span className="text-gray-400 text-sm ml-1">
                        Followers
                      </span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-lg">342</span>
                      <span className="text-gray-400 text-sm ml-1">
                        Following
                      </span>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <motion.button
                    className="mt-4 w-full bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] text-white px-6 py-3 rounded-full font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Follow
                  </motion.button>
                </div>
              </div>

              {/* Posts Section */}
              <div className="flex-1 overflow-y-auto border-t border-gray-700 p-6">
                <h3
                  className="text-lg font-bold text-white mb-4"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Posts by {user.name}
                </h3>
                {userPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <PostCard post={post} onLike={onLike} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
