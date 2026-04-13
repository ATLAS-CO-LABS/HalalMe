"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, BadgeCheck, Loader2 } from "lucide-react";
import type { Post } from "@/types";
import { hubService } from "@/services/hubService";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "./Avatar";
import PostCard from "./PostCard";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The user whose profile is being viewed. */
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  isVerified: boolean | null;
  bio?: string | null;
  /** Pre-loaded posts for this user (from the feed). */
  userPosts: Post[];
  onLike: (postId: string, currentIsLiked: boolean) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  userId,
  displayName,
  username,
  avatarUrl,
  isVerified,
  bio,
  userPosts,
  onLike,
}: UserProfileModalProps) {
  const { user: currentUser } = useAuth();

  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>(userPosts);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  // Load stats whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadStats = async () => {
      try {
        const [followers, following] = await Promise.all([
          hubService.getFollowerCount(userId),
          hubService.getFollowingCount(userId),
        ]);
        if (!cancelled) {
          setFollowerCount(followers);
          setFollowingCount(following);
        }
      } catch {
        // stats are non-critical — silently ignore
      }
    };

    const loadFollowState = async () => {
      if (!currentUser || currentUser.id === userId) return;
      try {
        const following = await hubService.isFollowing(currentUser.id, userId);
        if (!cancelled) setIsFollowing(following);
      } catch {
        // non-critical
      }
    };

    const loadPosts = async () => {
      setIsPostsLoading(true);
      try {
        const fetched = await hubService.getUserPosts(userId, currentUser?.id);
        if (!cancelled) setPosts(fetched);
      } catch {
        // keep the pre-loaded posts on error
      } finally {
        if (!cancelled) setIsPostsLoading(false);
      }
    };

    loadStats();
    loadFollowState();
    loadPosts();

    return () => { cancelled = true; };
  }, [isOpen, userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || isFollowLoading) return;
    setIsFollowLoading(true);

    const wasFollowing = isFollowing;
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? -1 : 1));

    try {
      if (wasFollowing) {
        await hubService.unfollow(currentUser.id, userId);
      } else {
        await hubService.follow(currentUser.id, userId);
      }
    } catch {
      // Revert on error
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? 1 : -1));
    } finally {
      setIsFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === userId;
  const formattedUsername = username ? `@${username}` : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "tween", duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cover + Close */}
              <div className="relative">
                <div className="h-32 bg-linear-to-br from-[#F59E0B] to-[#D97706]" />

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
                  <div className="flex items-end gap-4 -mt-8">
                    <Avatar
                      src={avatarUrl ?? undefined}
                      alt={displayName}
                      size="xl"
                      className="border-4 border-gray-800"
                    />
                    <div className="flex-1 mb-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2
                          className="text-xl font-extrabold uppercase tracking-tight text-white truncate"
                          style={{ fontFamily: "var(--font-headline)" }}
                        >
                          {displayName}
                        </h2>
                        {isVerified && (
                          <BadgeCheck className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
                        )}
                      </div>
                      {formattedUsername && (
                        <p
                          className="text-gray-400 text-sm font-normal"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {formattedUsername}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {bio && (
                    <p
                      className="mt-3 text-gray-300 text-sm font-normal leading-relaxed"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {bio}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Global</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>HalalMe member</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div>
                      <span className="text-white font-bold text-lg">{posts.length}</span>
                      <span className="text-gray-400 text-sm ml-1">Posts</span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-lg">
                        {followerCount ?? "—"}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-lg">
                        {followingCount ?? "—"}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">Following</span>
                    </div>
                  </div>

                  {/* Follow / Unfollow button — hidden for own profile */}
                  {!isOwnProfile && currentUser && (
                    <motion.button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-70 ${
                        isFollowing
                          ? "bg-gray-700 text-white border border-gray-600 hover:bg-gray-600"
                          : "bg-linear-to-br from-[#F59E0B] to-[#D97706] text-white"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isFollowLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isFollowing ? "Following" : "Follow"}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Posts Section */}
              <div className="flex-1 overflow-y-auto border-t border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-px bg-[#F59E0B]" />
                  <h3
                    className="text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    Posts by {displayName}
                  </h3>
                </div>

                {isPostsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-normal" style={{ fontFamily: "var(--font-body)" }}>
                      No posts yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <PostCard
                          post={post}
                          currentUserId={currentUser?.id}
                          onLike={onLike}
                        />
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
