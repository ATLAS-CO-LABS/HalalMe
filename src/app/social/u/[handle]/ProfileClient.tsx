"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, BadgeCheck, Loader2, Heart, Gift, Trophy,
  UserX, Pencil, Search,
} from "lucide-react";
import type { Post } from "@/types/app";
import { hubService } from "@/services/hubService";
import { withTimeout } from "@/lib/withTimeout";
import { useResumeKey } from "@/context/AppResumeContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import { getFlairTheme } from "@/lib/flairTheme";
import Avatar from "@/components/hub/Avatar";
import PostCard from "@/components/hub/PostCard";
import PostCardSkeleton from "@/components/hub/PostCardSkeleton";

const BG = "var(--hub-bg)";
const BG2 = "var(--hub-bg2)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";
const MUTED = "var(--hm-text-muted)";
const SUBTLE = "var(--hm-text-subtle)";

type ProfileData = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  profile_flair: string | null;
  bio: string | null;
  created_at: string;
};

interface ProfileClientProps {
  handle: string;
  initialProfile: ProfileData | null;
  initialPosts: Post[];
}

const BADGES = [
  { slug: "first-giver", icon: Heart, label: "First Giver", color: "#EC4899" },
  { slug: "consistent", icon: Calendar, label: "Consistent Giver", color: "#3B82F6" },
  { slug: "generous", icon: Gift, label: "Generous Heart", color: "#8B5CF6" },
  { slug: "champion", icon: Trophy, label: "Charity Champion", color: "#F59E0B" },
] as const;

const JOINED_FMT = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export default function ProfileClient({ handle, initialProfile, initialPosts }: ProfileClientProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { requireAuth } = useAuthGate();
  const resumeKey = useResumeKey();

  const [profile] = useState(initialProfile);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [badgeSlugs, setBadgeSlugs] = useState<string[]>([]);
  const [isBadgesLoading, setIsBadgesLoading] = useState(true);

  const loadRequestIdRef = useRef(0);

  const loadSecondary = useCallback((withPosts: boolean) => {
    if (!profile) return;
    const requestId = ++loadRequestIdRef.current;

    withTimeout(Promise.all([
      hubService.getFollowerCount(profile.id),
      hubService.getFollowingCount(profile.id),
    ]), 10_000)
      .then(([followers, following]) => {
        if (requestId !== loadRequestIdRef.current) return;
        setFollowerCount(followers);
        setFollowingCount(following);
      })
      .catch(() => {});

    if (currentUser && currentUser.id !== profile.id) {
      withTimeout(hubService.isFollowing(currentUser.id, profile.id), 10_000)
        .then((following) => { if (requestId === loadRequestIdRef.current) setIsFollowing(following); })
        .catch(() => {});
    }

    setIsBadgesLoading(true);
    withTimeout(fetch(`/api/rewards/badges?userId=${profile.id}`), 10_000)
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (requestId !== loadRequestIdRef.current) return;
        setBadgeSlugs((json.badges ?? []).map((b: { badge_slug: string }) => b.badge_slug));
      })
      .catch(() => {})
      .finally(() => { if (requestId === loadRequestIdRef.current) setIsBadgesLoading(false); });

    if (withPosts) {
      setIsPostsLoading(true);
      withTimeout(hubService.getUserPosts(profile.id, currentUser?.id), 10_000)
        .then((fetched) => { if (requestId === loadRequestIdRef.current) setPosts(fetched); })
        .catch(() => {})
        .finally(() => { if (requestId === loadRequestIdRef.current) setIsPostsLoading(false); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, currentUser?.id]);

  // Initial load - re-fetches posts too, since the server fetch was anonymous
  // and can't know this viewer's is_liked/is_bookmarked state.
  useEffect(() => { loadSecondary(true); }, [loadSecondary]);

  // On resume: refresh everything except the post list (avoids yanking the
  // user's scroll position under them for data that rarely changes mid-read).
  useEffect(() => {
    if (resumeKey === 0) return;
    loadSecondary(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeKey]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profile || isFollowLoading) return;
    setIsFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? -1 : 1));

    try {
      if (wasFollowing) await withTimeout(hubService.unfollow(currentUser.id, profile.id), 10_000);
      else              await withTimeout(hubService.follow(currentUser.id, profile.id), 10_000);
    } catch {
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => (prev ?? 0) + (wasFollowing ? 1 : -1));
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleLike = useCallback(async (postId: string, currentIsLiked: boolean) => {
    if (!currentUser) return;
    setPosts((prev) => prev.map((p) =>
      p.id === postId
        ? { ...p, is_liked: !currentIsLiked, like_count: currentIsLiked ? p.like_count - 1 : p.like_count + 1 }
        : p
    ));
    try {
      if (currentIsLiked) await hubService.unlikePost(postId, currentUser.id);
      else                await hubService.likePost(postId, currentUser.id);
    } catch {
      setPosts((prev) => prev.map((p) =>
        p.id === postId
          ? { ...p, is_liked: currentIsLiked, like_count: currentIsLiked ? p.like_count + 1 : p.like_count - 1 }
          : p
      ));
    }
  }, [currentUser]);

  const handleBookmark = useCallback(async (postId: string, currentIsBookmarked: boolean) => {
    if (!currentUser) return;
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, is_bookmarked: !currentIsBookmarked } : p));
    try {
      if (currentIsBookmarked) await hubService.unbookmarkPost(postId, currentUser.id);
      else                     await hubService.bookmarkPost(postId, currentUser.id);
    } catch {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, is_bookmarked: currentIsBookmarked } : p));
    }
  }, [currentUser]);

  const handleDelete = useCallback(async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try { await hubService.deletePost(postId); } catch { loadSecondary(true); }
  }, [loadSecondary]);

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------
  if (!profile) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="text-center space-y-4 px-4">
          <UserX className="w-12 h-12 mx-auto" style={{ color: SUBTLE }} />
          <h2 className="text-2xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
            Profile not found
          </h2>
          <p className="text-sm" style={{ color: MUTED }}>
            @{handle} doesn&apos;t exist, or the account has been removed.
          </p>
          <Link href="/social/feed">
            <motion.button
              className="text-xs font-bold uppercase tracking-[0.2em] transition-colors"
              style={{ color: AMBER }}
              whileHover={{ scale: 1.05 }}
            >
              ← Back to Feed
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const displayName = profile.full_name ?? profile.username ?? "HalalMe member";
  const formattedUsername = profile.username ? `@${profile.username}` : null;
  const flairTheme = getFlairTheme(profile.profile_flair);
  const accent = flairTheme?.accent ?? AMBER;
  const earnedBadges = BADGES.filter((b) => badgeSlugs.includes(b.slug));
  const joined = JOINED_FMT.format(new Date(profile.created_at));

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: BG }}>
      {/* Header - matches /social/post/[id]'s sticky header */}
      <div className="border-b sticky top-16 z-40" style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center gap-3 md:gap-4">
            <motion.button
              onClick={() => router.back()}
              className="transition-colors"
              style={{ color: SUBTLE }}
              onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
              onMouseLeave={(e) => (e.currentTarget.style.color = SUBTLE)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
            <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
              Profile
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-8">
        {/* Cover + profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden mb-6 border"
          style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}
        >
          <div className="relative h-36 md:h-48 overflow-hidden" style={{ background: flairTheme ? flairTheme.banner : AMBER }}>
            {flairTheme && (
              <>
                <div className="absolute inset-0" style={{ backgroundImage: flairTheme.pattern }} />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(105deg, rgba(255,255,255,0.16) 0%, transparent 45%, rgba(0,0,0,0.20) 100%)" }}
                />
                <span
                  className="absolute top-4 left-5 md:left-6 text-[9px] font-bold uppercase tracking-[0.22em] px-2 py-1"
                  style={{ color: flairTheme.bannerFg, backgroundColor: "rgba(0,0,0,0.16)" }}
                >
                  {flairTheme.name}
                </span>
              </>
            )}
            <div className="absolute inset-x-0 bottom-0 h-10" style={{ background: `linear-gradient(to top, ${BG2}, transparent)` }} />
          </div>

          <div className="px-5 md:px-6 pb-6">
            <div className="flex items-end justify-between gap-4 -mt-10 md:-mt-12">
              <Avatar src={profile.avatar_url ?? undefined} alt={displayName} size="xl" flair={profile.profile_flair} className="border-4 border-(--hub-bg2) w-24 h-24 md:w-28 md:h-28" />

              {isOwnProfile ? (
                <Link href="/profile">
                  <motion.button
                    className="mb-1 flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold uppercase tracking-tighter border transition-colors"
                    style={{ color: CREAM, borderColor: `color-mix(in oklab, var(--hm-text) 13%, transparent)` }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                  </motion.button>
                </Link>
              ) : currentUser && (
                <motion.button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className="mb-1 flex items-center gap-2 px-6 py-2.5 font-extrabold uppercase tracking-tighter text-xs transition-all disabled:opacity-70 border"
                  style={isFollowing
                    ? { backgroundColor: "transparent", color: CREAM, borderColor: `color-mix(in oklab, var(--hm-text) 13%, transparent)` }
                    : { backgroundColor: AMBER, color: BG2, borderColor: AMBER }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isFollowLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isFollowing ? "Following" : "Follow"}
                </motion.button>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-extrabold uppercase tracking-tight" style={{ fontFamily: "var(--font-headline)", color: CREAM }}>
                {displayName}
              </h2>
              {profile.is_verified && <BadgeCheck className="w-5 h-5 shrink-0" style={{ color: AMBER, fill: AMBER }} />}
            </div>
            {formattedUsername && (
              <p className="text-sm font-normal" style={{ color: MUTED, fontFamily: "var(--font-body)" }}>{formattedUsername}</p>
            )}

            {flairTheme && <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />}

            {profile.bio && (
              <p className="mt-3 text-sm font-normal leading-relaxed max-w-xl" style={{ color: MUTED, fontFamily: "var(--font-body)" }}>
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm flex-wrap" style={{ color: SUBTLE }}>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Global</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {joined}</span>
              </div>
            </div>

            {(isBadgesLoading || earnedBadges.length > 0) && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {isBadgesLoading
                  ? [0, 1].map((i) => (
                      <div key={i} aria-hidden className="h-6.5 w-28 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 8%, transparent)` }} />
                    ))
                  : earnedBadges.map((b) => (
                      <div key={b.slug} title={b.label} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border"
                        style={{ backgroundColor: `${b.color}22`, color: b.color, borderColor: `${b.color}55` }}>
                        <b.icon className="w-3 h-3" /> {b.label}
                      </div>
                    ))}
              </div>
            )}

            <div className="flex items-center gap-6 mt-4">
              <div>
                <span className="font-bold text-lg" style={{ color: CREAM }}>{posts.length}</span>
                <span className="text-sm ml-1" style={{ color: SUBTLE }}>Posts</span>
              </div>
              <div>
                <span className="font-bold text-lg" style={{ color: CREAM }}>{followerCount ?? "-"}</span>
                <span className="text-sm ml-1" style={{ color: SUBTLE }}>Followers</span>
              </div>
              <div>
                <span className="font-bold text-lg" style={{ color: CREAM }}>{followingCount ?? "-"}</span>
                <span className="text-sm ml-1" style={{ color: SUBTLE }}>Following</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-px" style={{ backgroundColor: accent }} />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: AMBER, fontFamily: "var(--font-headline)" }}>
            Posts by {displayName}
          </h3>
        </div>

        {isPostsLoading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border" style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
            <Search className="w-10 h-10 mx-auto mb-3" style={{ color: SUBTLE }} />
            <p className="font-normal" style={{ color: MUTED, fontFamily: "var(--font-body)" }}>No posts yet</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {posts.map((post, index) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  <PostCard
                    post={post}
                    currentUserId={currentUser?.id}
                    onLike={(postId, liked) => requireAuth(() => handleLike(postId, liked), "Sign in to like posts")}
                    onBookmark={(postId, bookmarked) => requireAuth(() => handleBookmark(postId, bookmarked), "Sign in to save posts")}
                    onDelete={isOwnProfile ? handleDelete : undefined}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
