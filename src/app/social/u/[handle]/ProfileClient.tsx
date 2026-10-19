"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, BadgeCheck, Loader2, Heart, Gift, Trophy,
  UserX, Pencil, MessagesSquare, RotateCcw, Plus,
} from "lucide-react";
import type { Post } from "@/types/app";
import { hubService } from "@/services/hubService";
import { mergeUniqueById, type FeedCursor } from "@/lib/socialFeed";
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

const PAGE_SIZE = 10;

const JOINED_FMT = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export default function ProfileClient({ handle, initialProfile, initialPosts }: ProfileClientProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { requireAuth } = useAuthGate();
  const resumeKey = useResumeKey();

  const [profile] = useState(initialProfile);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const cursorRef = useRef<FeedCursor | null>(null);

  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [badgeSlugs, setBadgeSlugs] = useState<string[]>([]);
  const [isBadgesLoading, setIsBadgesLoading] = useState(true);

  const loadRequestIdRef = useRef(0);
  const postsLengthRef = useRef(initialPosts.length);
  useEffect(() => { postsLengthRef.current = posts.length; }, [posts.length]);

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

    withTimeout(hubService.getUserPostCount(profile.id), 10_000)
      .then((n) => { if (requestId === loadRequestIdRef.current) setPostCount(n); })
      .catch(() => {});

    if (withPosts) {
      // Re-fetched even when server-rendered: the server fetch was anonymous and
      // can't know this viewer's like/bookmark state. Skeleton only if empty.
      if (postsLengthRef.current === 0) setIsPostsLoading(true);
      withTimeout(hubService.getFeedPage({ mode: "user", authorId: profile.id, limit: PAGE_SIZE }), 10_000)
        .then((page) => {
          if (requestId !== loadRequestIdRef.current) return;
          setPosts(page.data);
          setHasMore(page.hasMore);
          cursorRef.current = page.nextCursor;
        })
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
    setPostCount((n) => (n === null ? n : Math.max(0, n - 1)));
    try { await hubService.deletePost(postId); } catch { loadSecondary(true); }
  }, [loadSecondary]);

  const loadMore = useCallback(async () => {
    if (!profile || isLoadingMore || !cursorRef.current) return;
    setIsLoadingMore(true);
    setLoadMoreError(false);
    try {
      const page = await withTimeout(
        hubService.getFeedPage({ mode: "user", authorId: profile.id, limit: PAGE_SIZE, cursor: cursorRef.current }),
        10_000,
      );
      setPosts((prev) => mergeUniqueById(prev, page.data));
      setHasMore(page.hasMore);
      cursorRef.current = page.nextCursor;
    } catch {
      setLoadMoreError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [profile, isLoadingMore]);

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
          <Link href="/social/feed" className="inline-block text-xs font-bold uppercase tracking-[0.2em] hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)" style={{ color: AMBER }}>
            Back to the feed
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
              onClick={() => (window.history.length > 1 ? router.back() : router.push("/social/feed"))}
              aria-label="Back"
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
                <Link
                  href="/profile"
                  className="mb-1 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold uppercase tracking-tighter border border-[color-mix(in_oklab,var(--hm-text)_13%,transparent)] transition-colors hover:border-(--hm-amber) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ color: CREAM }}
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden /> Edit Profile
                </Link>
              ) : currentUser && (
                <motion.button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  aria-pressed={isFollowing}
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
                <span className="font-bold text-lg tabular-nums" style={{ color: CREAM }}>{postCount ?? posts.length}</span>
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
          <div className="text-center py-14 px-4 border" style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
            <MessagesSquare className="w-10 h-10 mx-auto mb-3" style={{ color: SUBTLE }} aria-hidden />
            <p className="font-semibold" style={{ color: CREAM, fontFamily: "var(--font-body)" }}>
              {isOwnProfile ? "You haven't posted yet" : "No posts yet"}
            </p>
            {isOwnProfile && (
              <>
                <p className="mt-1 text-sm" style={{ color: MUTED }}>Share a recipe, ask a question or review somewhere you ate.</p>
                <Link
                  href="/social/feed?compose=general"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold uppercase tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)"
                  style={{ backgroundColor: AMBER, color: BG }}
                >
                  <Plus className="w-4 h-4" aria-hidden /> Create a post
                </Link>
              </>
            )}
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

        {posts.length > 0 && !isPostsLoading && (hasMore || loadMoreError) && (
          <div className="mt-6 flex flex-col items-center gap-2" aria-live="polite">
            {loadMoreError && <p className="text-sm" style={{ color: MUTED }}>Couldn&apos;t load more posts.</p>}
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold uppercase tracking-tight border border-[color-mix(in_oklab,var(--hm-text)_8%,transparent)] transition-colors hover:border-(--hm-amber) disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
              style={{ color: CREAM, backgroundColor: BG2 }}
            >
              {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : loadMoreError ? <RotateCcw className="w-4 h-4" aria-hidden /> : null}
              {isLoadingMore ? "Loading" : loadMoreError ? "Retry" : "Load more posts"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
