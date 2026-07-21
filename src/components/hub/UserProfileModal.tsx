"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, BadgeCheck, Loader2, Heart, Gift, Trophy } from "lucide-react";
import type { Post } from "@/types/app";
import { hubService } from "@/services/hubService";
import { withTimeout } from "@/lib/withTimeout";
import { useResumeKey } from "@/context/AppResumeContext";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "./Avatar";
import PostCard from "./PostCard";
import { getFlairTheme } from "@/lib/flairTheme";

const BG2 = "#111418";
const AMBER = "#F59E0B";
const CREAM = "#F7E7CE";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The user whose profile is being viewed. */
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  isVerified: boolean | null;
  profileFlair?: string | null;
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
  profileFlair,
  bio,
  userPosts,
  onLike,
}: UserProfileModalProps) {
  const { user: currentUser } = useAuth();
  const resumeKey = useResumeKey();

  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>(userPosts);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [badgeSlugs, setBadgeSlugs] = useState<string[]>([]);

  // Monotonic counter - prevents a slow previous open from overwriting
  // state set by a newer open (e.g. user closes and opens a different profile).
  const loadRequestIdRef = useRef(0);

  // Load stats whenever the modal opens.
  // All calls are wrapped in withTimeout(10s) so a stalled network can never
  // leave isPostsLoading stuck.  The requestId guard ensures only the most
  // recent open writes state.
  useEffect(() => {
    if (!isOpen) return;

    const requestId = ++loadRequestIdRef.current;
    setBadgeSlugs([]);

    const loadStats = async () => {
      try {
        const [followers, following] = await Promise.all([
          withTimeout(hubService.getFollowerCount(userId), 10_000),
          withTimeout(hubService.getFollowingCount(userId), 10_000),
        ]);
        if (requestId !== loadRequestIdRef.current) return;
        setFollowerCount(followers);
        setFollowingCount(following);
      } catch {
        // stats are non-critical
      }
    };

    const loadFollowState = async () => {
      if (!currentUser || currentUser.id === userId) return;
      try {
        const following = await withTimeout(hubService.isFollowing(currentUser.id, userId), 10_000);
        if (requestId !== loadRequestIdRef.current) return;
        setIsFollowing(following);
      } catch {
        // non-critical
      }
    };

    const loadPosts = async () => {
      setIsPostsLoading(true);
      try {
        const fetched = await withTimeout(hubService.getUserPosts(userId, currentUser?.id), 10_000);
        if (requestId !== loadRequestIdRef.current) return;
        setPosts(fetched);
      } catch {
        // keep the pre-loaded posts on error
      } finally {
        if (requestId === loadRequestIdRef.current) setIsPostsLoading(false);
      }
    };

    const loadBadges = async () => {
      try {
        const res = await fetch(`/api/rewards/badges?userId=${userId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (requestId !== loadRequestIdRef.current) return;
        setBadgeSlugs((json.badges ?? []).map((b: { badge_slug: string }) => b.badge_slug));
      } catch {
        // non-critical
      }
    };

    loadStats();
    loadFollowState();
    loadPosts();
    loadBadges();
  }, [isOpen, userId, currentUser]);

  // On resume: if the modal is already open, re-fetch posts and follow stats
  // so the user does not see data cached from before the tab was suspended.
  useEffect(() => {
    if (resumeKey === 0 || !isOpen) return;
    const requestId = ++loadRequestIdRef.current;

    Promise.all([
      withTimeout(hubService.getFollowerCount(userId), 10_000),
      withTimeout(hubService.getFollowingCount(userId), 10_000),
    ])
      .then(([followers, following]) => {
        if (requestId !== loadRequestIdRef.current) return;
        setFollowerCount(followers);
        setFollowingCount(following);
      })
      .catch(() => {});

    if (currentUser && currentUser.id !== userId) {
      withTimeout(hubService.isFollowing(currentUser.id, userId), 10_000)
        .then((following) => { if (requestId === loadRequestIdRef.current) setIsFollowing(following); })
        .catch(() => {});
    }

    setIsPostsLoading(true);
    withTimeout(hubService.getUserPosts(userId, currentUser?.id), 10_000)
      .then((fetched) => { if (requestId === loadRequestIdRef.current) setPosts(fetched); })
      .catch(() => {})
      .finally(() => { if (requestId === loadRequestIdRef.current) setIsPostsLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeKey]);

  const handleFollowToggle = async () => {
    if (!currentUser || isFollowLoading) return;
    setIsFollowLoading(true);

    const wasFollowing = isFollowing;
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? -1 : 1));

    try {
      if (wasFollowing) {
        await withTimeout(hubService.unfollow(currentUser.id, userId), 10_000);
      } else {
        await withTimeout(hubService.follow(currentUser.id, userId), 10_000);
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
  const flairTheme = getFlairTheme(profileFlair);

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
            className="fixed inset-0 bg-black/70 z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "tween", duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-8 border shadow-2xl"
              style={{ backgroundColor: BG2, borderColor: `${CREAM}12` }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cover + Close */}
              <div className="relative">
                <div
                  className={flairTheme ? "h-32" : "h-32"}
                  style={{ background: flairTheme ? flairTheme.banner : AMBER }}
                />

                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white p-2 hover:bg-black/60 transition-colors"
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
                      flair={profileFlair}
                      className="border-4 border-[#111418]"
                    />
                    <div className="flex-1 mb-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2
                          className="text-xl font-extrabold uppercase tracking-tight truncate"
                          style={{ fontFamily: "var(--font-headline)", color: flairTheme?.accent ?? CREAM }}
                        >
                          {displayName}
                        </h2>
                        {isVerified && (
                          <BadgeCheck className="w-5 h-5 shrink-0" style={{ color: AMBER, fill: AMBER }} />
                        )}
                      </div>
                      {formattedUsername && (
                        <p
                          className="text-sm font-normal"
                          style={{ color: `${CREAM}45`, fontFamily: "var(--font-body)" }}
                        >
                          {formattedUsername}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {bio && (
                    <p
                      className="mt-3 text-sm font-normal leading-relaxed"
                      style={{ color: `${CREAM}70`, fontFamily: "var(--font-body)" }}
                    >
                      {bio}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-3 text-sm" style={{ color: `${CREAM}45` }}>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Global</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>HalalMe member</span>
                    </div>
                  </div>

                  {/* Badges */}
                  {badgeSlugs.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {[
                        { slug: "first-giver",  icon: Heart,   label: "First Giver",     color: "#EC4899" },
                        { slug: "consistent",   icon: Calendar, label: "Consistent Giver", color: "#3B82F6" },
                        { slug: "generous",     icon: Gift,    label: "Generous Heart",   color: "#8B5CF6" },
                        { slug: "champion",     icon: Trophy,  label: "Charity Champion", color: "#F59E0B" },
                      ]
                        .filter((b) => badgeSlugs.includes(b.slug))
                        .map((b) => (
                          <div
                            key={b.slug}
                            title={b.label}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border"
                            style={{ backgroundColor: `${b.color}15`, color: b.color, borderColor: `${b.color}30` }}
                          >
                            <b.icon className="w-3 h-3" />
                            {b.label}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div>
                      <span className="font-bold text-lg" style={{ color: CREAM }}>{posts.length}</span>
                      <span className="text-sm ml-1" style={{ color: `${CREAM}45` }}>Posts</span>
                    </div>
                    <div>
                      <span className="font-bold text-lg" style={{ color: CREAM }}>
                        {followerCount ?? "-"}
                      </span>
                      <span className="text-sm ml-1" style={{ color: `${CREAM}45` }}>Followers</span>
                    </div>
                    <div>
                      <span className="font-bold text-lg" style={{ color: CREAM }}>
                        {followingCount ?? "-"}
                      </span>
                      <span className="text-sm ml-1" style={{ color: `${CREAM}45` }}>Following</span>
                    </div>
                  </div>

                  {/* Follow / Unfollow button - hidden for own profile */}
                  {!isOwnProfile && currentUser && (
                    <motion.button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 font-extrabold uppercase tracking-tighter text-sm transition-all disabled:opacity-70 border"
                      style={
                        isFollowing
                          ? { backgroundColor: "transparent", color: CREAM, borderColor: `${CREAM}20` }
                          : { backgroundColor: AMBER, color: BG2, borderColor: AMBER }
                      }
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
              <div className="flex-1 overflow-y-auto border-t p-6" style={{ borderColor: `${CREAM}10` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-px" style={{ backgroundColor: AMBER }} />
                  <h3
                    className="text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: AMBER, fontFamily: "var(--font-headline)" }}
                  >
                    Posts by {displayName}
                  </h3>
                </div>

                {isPostsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: AMBER }} />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="font-normal" style={{ color: `${CREAM}45`, fontFamily: "var(--font-body)" }}>
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
