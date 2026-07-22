"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Clock,
  Users,
  MessagesSquare,
  MessageCircle,
  ChefHat,
  HelpCircle,
  Star,
  Sparkles,
  Search,
  Bookmark,
  X,
  Menu,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Post, PostType, UserSearchResult } from "@/types";
import { hubService, type FeedMode } from "@/services/hubService";
import { withTimeout, TimeoutError } from "@/lib/withTimeout";
import { useResumeKey } from "@/context/AppResumeContext";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/auth/AuthGuard";
import Avatar from "@/components/hub/Avatar";
import PostCard from "@/components/hub/PostCard";
import CreatePostModal from "@/components/hub/CreatePostModal";
import EditPostModal from "@/components/hub/EditPostModal";
import UserProfileModal from "@/components/hub/UserProfileModal";
import NotificationPanel from "@/components/hub/NotificationPanel";
import { PostCardSkeletonList } from "@/components/hub/PostCardSkeleton";
import EmptyState from "@/components/hub/EmptyState";

const BG = "var(--hub-bg)";
const BG2 = "var(--hub-bg2)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";

type TabType = FeedMode | "bookmarks";

// ---------------------------------------------------------------------------
// Wrapper - owns the resetKey that forces a full remount of HubFeedContent
// on every tab-resume reconnect.  Keying a React component (not Next.js
// routing children) guarantees React discards all state and refs cleanly.
// isResumeTrigger tells the content component whether this mount was caused
// by a resume reconnect (resetKey > 0) or normal page navigation.
// ---------------------------------------------------------------------------
export default function HubFeedPage() {
  const resumeKey = useResumeKey();
  const searchParams = useSearchParams();
  const [resetKey, setResetKey] = useState(0);
  const initialTab = searchParams.get("tab") === "bookmarks" ? "bookmarks" : "latest";

  useEffect(() => {
    if (resumeKey === 0) return;
    setResetKey((k) => k + 1);
  }, [resumeKey]);

  return (
    <AuthGuard>
      <HubFeedContent key={resetKey} isResumeTrigger={resetKey > 0} initialTab={initialTab} />
    </AuthGuard>
  );
}

function HubFeedContent({ isResumeTrigger = false, initialTab = "latest" }: { isResumeTrigger?: boolean; initialTab?: TabType }) {
  const { user } = useAuth();
  const resumeKey = useResumeKey();

  // Feed state
  const [posts, setPosts]               = useState<Post[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(false);

  // Search state (server-side)
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchResults, setSearchResults]   = useState<Post[]>([]);
  const [userResults, setUserResults]       = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching]       = useState(false);
  const searchDebounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI state
  const [activeTab, setActiveTab]           = useState<TabType>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typeFilter, setTypeFilter]         = useState<string>("all");
  const typeFilterRef                        = useRef<string>("all");

  // Modal state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost]           = useState<Post | null>(null);
  const [profileModal, setProfileModal]         = useState<{
    userId: string;
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
    isVerified: boolean | null;
    profileFlair: string | null;
    bio: string | null;
  } | null>(null);

  // Stable ref to current user id - used inside realtime callback to avoid stale closure
  const userIdRef = useRef<string | undefined>(user?.id);
  useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

  // Tracks the AbortController for the currently in-flight loadFeed request.
  // Aborting it cancels the network request so isLoading is never left stuck.
  const feedAbortRef = useRef<AbortController | null>(null);

  // Monotonically-incrementing request counter.  Used only to guard setError
  // and stale data writes - NOT to gate setIsLoading, which is decoupled.
  const loadFeedRequestIdRef = useRef(0);

  // IDs of posts we created locally - realtime should skip these since
  // handleCreatePost is already the source of truth for own new posts.
  const ownPostIdsRef = useRef<Set<string>>(new Set());

  // Tracks whether the very first loadFeed call (on mount) ran without a
  // signed-in user.  This happens when SIGNED_IN fires during a reconnect,
  // causing AuthContext to momentarily set user=null before re-hydrating the
  // session.  If the initial fetch ran without auth, we need to re-run it
  // exactly once as soon as the user becomes available.
  const hadNullUserAtMount = useRef<boolean>(false);

  // Guards the empty-result retry so it fires at most once per component
  // lifetime.  Reset on every full remount (new component instance).
  const retriedEmptyRef = useRef(false);

  // Safety-net timeout handle - clears loading after 15 s if nothing else does.
  // 15 s is intentionally longer than withTimeout(10 s) + 1 s retry delay so that
  // the normal retry path (TimeoutError → 1 s wait → second attempt) has a full
  // chance to succeed before the safety net fires.
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Feed / bookmarks loading
  // ---------------------------------------------------------------------------
  const loadFeed = useCallback(
    async (tab: TabType, pageNum: number, append: boolean, isResume = false) => {
      // Cancel the previous in-flight network request immediately so Chrome
      // releases the connection rather than leaving it throttled in the background.
      feedAbortRef.current?.abort();
      const controller = new AbortController();
      feedAbortRef.current = controller;
      const { signal } = controller;

      const requestId = ++loadFeedRequestIdRef.current;
      console.log("[Feed] loadFeed called", { tab, pageNum, append, isResume, requestId });

      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      // Safety net - if the request somehow never settles (e.g. a bug in
      // withTimeout or a completely stalled socket), force-clear loading after
      // 15 s so the UI can never get permanently stuck.  15 s is chosen to be
      // longer than withTimeout(10 s) + 1 s retry delay so the normal retry path
      // finishes before the safety fires.
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn("[Feed] safety timeout fired - forcing isLoading=false");
        setIsLoading(false);
        setIsLoadingMore(false);
      }, 15_000);

      // Single-attempt factory - called up to twice (first attempt + one retry).
      const attempt = () => withTimeout(
        tab === "bookmarks"
          ? hubService.getBookmarks(user!.id, pageNum, 20, signal)
          : hubService.getFeed(user?.id, pageNum, 20, tab, signal, typeFilterRef.current !== "all" ? typeFilterRef.current : undefined),
        10_000,
      );

      // Set to true when the empty-result resume-retry path fires so that
      // `finally` knows to keep the loading spinner alive during the 800ms wait.
      let retryScheduled = false;

      try {
        let result;
        try {
          result = await attempt();
        } catch (err) {
          // On timeout, the network may just need a moment to stabilise after
          // returning from a background tab.  Wait 1 s then retry once.
          // Non-timeout errors (auth, network reset) skip straight to outer catch.
          if (!(err instanceof TimeoutError)) throw err;
          await new Promise<void>((r) => setTimeout(r, 1_000));
          // Bail if a newer loadFeed call started during the delay.
          if (requestId !== loadFeedRequestIdRef.current) return;
          result = await attempt(); // second attempt - any failure goes to outer catch
        }

        console.log("[Feed] data received", { count: result.data.length, isResume });

        // After any resume (or SIGNED_IN-triggered remount), Supabase PostgREST
        // can return [] before the auth token refresh completes - the RLS policy
        // silently filters everything.  Guard: only retry if:
        //   • first-page, non-append load (not "load more")
        //   • user is authenticated (so empty is unexpected, not a legitimate empty feed)
        //   • we haven't already retried this component instance (prevents loops)
        // The retry is always called with isResume=false so it never triggers
        // this branch again, letting a second empty result commit [] normally.
        if (!append && pageNum === 1 && result.data.length === 0 && user?.id && !retriedEmptyRef.current) {
          console.log("[Feed] authenticated but empty - retrying once (possible auth race)");
          retriedEmptyRef.current = true;
          retryScheduled = true;
          setTimeout(() => {
            if (requestId === loadFeedRequestIdRef.current) {
              loadFeed(tab, 1, false, /* isResume= */ false); // no further retry
            }
          }, 800);
          return; // ← do not commit empty data yet
        }

        // requestId guard on data/pagination writes: prevent a very-late stale
        // response from overwriting data that a newer request already committed.
        if (requestId !== loadFeedRequestIdRef.current) return;
        setPosts((prev) => (append ? [...prev, ...result.data] : result.data));
        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch {
        // Only show an error banner for the most recent request - a superseded
        // request failing silently is expected (AbortError, etc.).
        if (requestId === loadFeedRequestIdRef.current) {
          setError("Failed to load. Please try again.");
        }
      } finally {
        // Always cancel the safety-net timeout now that the request has settled.
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

        // Decouple loading-state teardown from requestId.
        // signal.aborted is true only when a newer call aborted THIS request -
        // in that case the newer call already set isLoading=true, so we must not
        // clear it here.  For every other outcome (success, error, timeout) the
        // loading state belongs to this request and we clear it unconditionally.
        if (!signal.aborted && !retryScheduled) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    // user?.id (string) is sufficient - including the full `user` object would
    // recreate loadFeed on every token refresh (SIGNED_IN fires a new Profile
    // object reference with the same id), causing a spurious feed reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id]
  );

  // Cleanup safety-net timeout on unmount so a stale timer cannot call setState
  // on an already-unmounted component.
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  // Single controlled fetch on mount - [] guarantees exactly one call per
  // component lifetime.  Tab switches are handled in the click handler below
  // so there is no competing effect that can race and override this fetch.
  // isResumeTrigger is only true when HubFeedPage remounted due to a resume
  // reconnect (resetKey > 0); normal page navigation passes false so an
  // empty result is treated as a legitimate empty feed rather than a retry.
  useEffect(() => {
    console.log("[Feed] mounted, calling loadFeed", { isResumeTrigger });
    // Record whether auth was available at mount time.  If not, the fetch below
    // will run as unauthenticated; the [user?.id] effect below re-fires once auth arrives.
    hadNullUserAtMount.current = !user?.id;
    loadFeed(activeTab, 1, false, isResumeTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth hydration recovery - fires once when user becomes available after
  // a null-user mount.  This handles the SIGNED_IN reconnect race:
  //   1. Tab resumes → supabase.realtime reconnects → SIGNED_IN fires
  //   2. AuthContext calls setUser(null) during re-hydration → HubFeedContent remounts
  //   3. Mount runs with user=null → unauthenticated fetch → no data
  //   4. Auth hydration completes → user becomes defined → this effect fires once
  useEffect(() => {
    if (!hadNullUserAtMount.current) return;    // initial mount had auth - nothing to recover
    if (!user?.id) return;                      // auth still not ready
    hadNullUserAtMount.current = false;          // one-shot: never fire again for this mount
    console.log("[Feed] auth arrived after null-user mount → re-fetching");
    loadFeed(activeTab, 1, false, isResumeTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ---------------------------------------------------------------------------
  // Realtime - prepend new posts (enriched with profiles + like/bookmark state)
  // ---------------------------------------------------------------------------
  // resumeKey is included so the channel is torn down and re-created after
  // every app-resume reconnect.  Phoenix only auto-rejoins channels after an
  // *unexpected* socket close (network drop / BFCache unfreeze); after our
  // programmatic disconnect() + connect() cycle the channel is permanently
  // dead unless we explicitly re-subscribe.  The cleanup function returned
  // here calls supabase.removeChannel(), so React's effect teardown handles
  // the old channel before the new subscription is registered.
  useEffect(() => {
    const unsubscribe = hubService.subscribeToFeed(async (rawPost) => {
      // Skip posts we created ourselves - handleCreatePost already prepended them
      if (ownPostIdsRef.current.has(rawPost.id)) return;

      // Enrich the raw realtime payload (no profiles join, no is_liked) before
      // prepending - fall back to the raw post if the fetch fails.
      let enriched = rawPost;
      try {
        enriched = await hubService.getPostById(rawPost.id, userIdRef.current);
      } catch {
        // keep raw
      }
      setPosts((prev) => {
        if (prev.some((p) => p.id === enriched.id)) return prev;
        return [enriched, ...prev];
      });
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, resumeKey]);

  // ---------------------------------------------------------------------------
  // Server-side search (debounced 500ms)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setUserResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const [postResult, users] = await Promise.all([
          hubService.searchPosts(searchQuery.trim(), user?.id),
          hubService.searchUsers(searchQuery.trim()),
        ]);
        setSearchResults(postResult.data);
        setUserResults(users);
      } catch {
        setSearchResults([]);
        setUserResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, user?.id]);

  // ---------------------------------------------------------------------------
  // Post actions
  // ---------------------------------------------------------------------------
  const handleLike = useCallback(
    async (postId: string, currentIsLiked: boolean) => {
      if (!user) return;

      const patch = (list: Post[]) =>
        list.map((p) =>
          p.id === postId
            ? { ...p, is_liked: !currentIsLiked, like_count: currentIsLiked ? p.like_count - 1 : p.like_count + 1 }
            : p
        );

      setPosts(patch);
      if (searchQuery) setSearchResults(patch);

      try {
        if (currentIsLiked) await hubService.unlikePost(postId, user.id);
        else                 await hubService.likePost(postId, user.id);
      } catch {
        const revert = (list: Post[]) =>
          list.map((p) =>
            p.id === postId
              ? { ...p, is_liked: currentIsLiked, like_count: currentIsLiked ? p.like_count + 1 : p.like_count - 1 }
              : p
          );
        setPosts(revert);
        if (searchQuery) setSearchResults(revert);
      }
    },
    [user, searchQuery]
  );

  const handleBookmark = useCallback(
    async (postId: string, currentIsBookmarked: boolean) => {
      if (!user) return;

      const patch = (list: Post[]) =>
        list.map((p) =>
          p.id === postId ? { ...p, is_bookmarked: !currentIsBookmarked } : p
        );

      setPosts(patch);
      if (searchQuery) setSearchResults(patch);

      // If we're in bookmarks tab and unbookmarking, remove the card
      if (activeTab === "bookmarks" && currentIsBookmarked) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }

      try {
        if (currentIsBookmarked) await hubService.unbookmarkPost(postId, user.id);
        else                     await hubService.bookmarkPost(postId, user.id);
      } catch {
        const revert = (list: Post[]) =>
          list.map((p) =>
            p.id === postId ? { ...p, is_bookmarked: currentIsBookmarked } : p
          );
        setPosts(revert);
        if (searchQuery) setSearchResults(revert);
      }
    },
    [user, activeTab, searchQuery]
  );

  const handleCreatePost = async (
    content: string,
    mediaFile?: File,
    postType: PostType = "general",
    onProgress?: (percent: number) => void
  ) => {
    if (!user) return;

    const newPost = await hubService.createPost(user.id, content, { post_type: postType });
    // Register immediately so the realtime handler skips this ID
    ownPostIdsRef.current.add(newPost.id);

    const ownProfiles = { username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, is_verified: user.is_verified };

    if (mediaFile) {
      const { url, public_id } = await hubService.uploadPostMedia(user.id, newPost.id, mediaFile, onProgress);
      const updatedPost = await hubService.updatePost(newPost.id, content, [url], [public_id]);
      const enriched    = { ...updatedPost, profiles: ownProfiles, is_liked: false, is_bookmarked: false };
      setPosts((prev) => {
        // Realtime may have already prepended this post - update in place instead of duplicating
        if (prev.some((p) => p.id === enriched.id)) {
          return prev.map((p) => p.id === enriched.id ? enriched : p);
        }
        return [enriched, ...prev];
      });
    } else {
      const enriched = { ...newPost, profiles: ownProfiles, is_liked: false, is_bookmarked: false };
      setPosts((prev) => {
        // Realtime may have already prepended this post - update in place instead of duplicating
        if (prev.some((p) => p.id === enriched.id)) {
          return prev.map((p) => p.id === enriched.id ? enriched : p);
        }
        return [enriched, ...prev];
      });
    }
  };

  const handleEditPost = async (content: string) => {
    if (!editingPost) return;
    const updated = await hubService.updatePost(editingPost.id, content);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === updated.id ? { ...updated, profiles: p.profiles, is_liked: p.is_liked, is_bookmarked: p.is_bookmarked } : p
      )
    );
    setEditingPost(null);
  };

  const handleDeletePost = useCallback(
    async (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      try {
        await hubService.deletePost(postId);
      } catch {
        loadFeed(activeTab, 1, false);
      }
    },
    [activeTab, loadFeed]
  );

  const handleUserClick = async (post: Post) => {
    // Open modal immediately with data we already have, then enrich with bio
    setProfileModal({
      userId:      post.user_id,
      displayName: post.profiles?.full_name ?? post.profiles?.username ?? "Unknown",
      username:    post.profiles?.username ?? null,
      avatarUrl:   post.profiles?.avatar_url ?? null,
      isVerified:  post.profiles?.is_verified ?? null,
      profileFlair: post.profiles?.profile_flair ?? null,
      bio:         null,
    });
    try {
      const profile = await hubService.getUserProfile(post.user_id);
      if (profile) {
        setProfileModal((prev) =>
          prev?.userId === post.user_id ? { ...prev, bio: profile.bio, profileFlair: profile.profile_flair } : prev
        );
      }
    } catch {
      // bio is non-critical - leave as null
    }
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const displayPosts = searchQuery ? searchResults : posts;

  const tabs = [
    { id: "latest"    as TabType, label: "Latest",   icon: Clock      },
    { id: "trending"  as TabType, label: "Trending",  icon: TrendingUp },
    { id: "following" as TabType, label: "Following", icon: Users      },
    { id: "bookmarks" as TabType, label: "Saved",     icon: Bookmark   },
  ];

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: BG }}>

      {/* Sticky header - solid bg (no blur) avoids scroll-repaint tearing under the fixed app header */}
      <div className="border-b sticky top-16 z-40" style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Desktop back */}
              <Link href="/hub" className="hidden md:block">
                <motion.button
                  className="transition-colors"
                  style={{ color: `color-mix(in oklab, var(--hm-text) 31%, var(--hm-lm-anchor))` }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = `color-mix(in oklab, var(--hm-text) 31%, transparent)`)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>

              {/* Mobile menu toggle */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden transition-colors"
                style={{ color: `color-mix(in oklab, var(--hm-text) 31%, var(--hm-lm-anchor))` }}
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>

              <h1
                className="text-lg md:text-xl font-extrabold uppercase tracking-tighter"
                style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
              >
                HalalMe <span style={{ color: AMBER }}>Social</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification bell */}
              {user && <NotificationPanel userId={user.id} />}

              {/* Create post */}
              <motion.button
                onClick={() => setIsCreatePostOpen(true)}
                className="flex items-center gap-1.5 px-3 md:px-4 py-2 font-extrabold uppercase tracking-tighter text-sm"
                style={{ backgroundColor: AMBER, color: BG }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>Post</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t mt-3"
                style={{ borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}
              >
                <div className="py-3 space-y-1">
                  <Link href="/hub" onClick={() => setMobileMenuOpen(false)}>
                    <div
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                      style={{ color: CREAM }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `color-mix(in oklab, var(--hm-text) 3%, transparent)`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-semibold">Social Home</span>
                    </div>
                  </Link>
                  <Link href="/kitchen" onClick={() => setMobileMenuOpen(false)}>
                    <div
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                      style={{ color: CREAM }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `color-mix(in oklab, var(--hm-text) 3%, transparent)`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span className="font-semibold">Back to Kitchen</span>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs - underline style, matches Kitchen recipes tabs */}
        <div className="mx-auto max-w-4xl px-4 md:px-6 pt-1 flex border-b" style={{ borderColor: `color-mix(in oklab, var(--hm-text) 3%, transparent)` }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); loadFeed(tab.id, 1, false); setTypeFilter("all"); typeFilterRef.current = "all"; setSearchQuery(""); setSearchResults([]); }}
                className="relative flex items-center gap-1.5 px-3 md:px-4 py-2.5 font-extrabold uppercase tracking-widest transition-colors whitespace-nowrap text-xs"
                style={{ color: active ? AMBER : `color-mix(in oklab, var(--hm-text) 25%, transparent)` }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="hub-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: AMBER }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Type filter pills - square tags */}
        <div className="mx-auto max-w-4xl px-4 md:px-6 pb-3 pt-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {[
            { value: "all",      label: "All",       Icon: Sparkles      },
            { value: "general",  label: "Posts",     Icon: MessageCircle },
            { value: "recipe",   label: "Recipes",   Icon: ChefHat       },
            { value: "question", label: "Questions", Icon: HelpCircle    },
            { value: "review",   label: "Reviews",   Icon: Star          },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => {
                typeFilterRef.current = f.value;
                setTypeFilter(f.value);
                loadFeed(activeTab, 1, false);
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all border"
              style={
                typeFilter === f.value
                  ? { backgroundColor: AMBER, color: BG, borderColor: AMBER }
                  : { backgroundColor: "transparent", color: `color-mix(in oklab, var(--hm-text) 25%, var(--hm-lm-anchor))`, borderColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)` }
              }
            >
              <f.Icon className="w-3 h-3" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mx-auto max-w-4xl px-4 md:px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `color-mix(in oklab, var(--hm-text) 21%, var(--hm-lm-anchor))` }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, users..."
              className="w-full text-base pl-10 pr-10 py-2.5 border focus:outline-none font-normal transition-colors"
              style={{ backgroundColor: BG, borderColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)`, color: CREAM, caretColor: AMBER }}
              onFocus={(e) => (e.target.style.borderColor = AMBER)}
              onBlur={(e) => (e.target.style.borderColor = `color-mix(in oklab, var(--hm-text) 7%, transparent)`)}
            />
            {searchQuery && (
              <motion.button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: `color-mix(in oklab, var(--hm-text) 21%, var(--hm-lm-anchor))` }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-8">

        {/* Search status */}
        {searchQuery && (
          <div className="mb-4 flex items-center gap-2">
            {isSearching
              ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: AMBER }} />
              : <Search className="w-4 h-4" style={{ color: `color-mix(in oklab, var(--hm-text) 19%, var(--hm-lm-anchor))` }} />
            }
            <span className="text-sm font-normal" style={{ color: `color-mix(in oklab, var(--hm-text) 27%, var(--hm-lm-anchor))`, fontFamily: "var(--font-body)" }}>
              {isSearching ? "Searching..." : `${userResults.length + searchResults.length} result${userResults.length + searchResults.length !== 1 ? "s" : ""} for "${searchQuery}"`}
            </span>
          </div>
        )}

        {/* User results */}
        {searchQuery && !isSearching && userResults.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: `color-mix(in oklab, var(--hm-text) 19%, var(--hm-lm-anchor))` }}>People</p>
            <div className="space-y-2">
              {userResults.map((u) => (
                <motion.button
                  key={u.id}
                  onClick={() => setProfileModal({
                    userId: u.id,
                    displayName: u.full_name ?? u.username ?? "Unknown",
                    username: u.username,
                    avatarUrl: u.avatar_url,
                    isVerified: u.is_verified,
                    profileFlair: null,
                    bio: u.bio,
                  })}
                  className="w-full flex items-center gap-3 border px-4 py-3 text-left transition-colors"
                  style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `color-mix(in oklab, var(--hm-amber) 25%, transparent)`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = `color-mix(in oklab, var(--hm-text) 6%, transparent)`)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Avatar src={u.avatar_url ?? undefined} alt={u.full_name ?? ""} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate" style={{ color: CREAM }}>{u.full_name}</span>
                      {u.is_verified && (
                        <svg className="w-3.5 h-3.5 shrink-0" style={{ color: AMBER }} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {u.username && <p className="text-xs truncate" style={{ color: `color-mix(in oklab, var(--hm-text) 19%, var(--hm-lm-anchor))` }}>@{u.username}</p>}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length > 0 && (
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: `color-mix(in oklab, var(--hm-text) 19%, var(--hm-lm-anchor))` }}>Posts</p>
        )}

        {isLoading ? (
          <PostCardSkeletonList count={4} />
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Something went wrong"
            description={error}
            action={{ label: "Try Again", onClick: () => loadFeed(activeTab, 1, false) }}
          />
        ) : searchQuery && !isSearching && displayPosts.length === 0 && userResults.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`Nothing matches "${searchQuery}".`}
            action={{ label: "Clear Search", onClick: () => setSearchQuery("") }}
          />
        ) : !searchQuery && displayPosts.length === 0 && activeTab === "following" ? (
          <EmptyState
            icon={Users}
            title="Nothing here yet"
            description="Follow some people to see their posts in this feed."
            action={{ label: "Browse Latest", onClick: () => { setActiveTab("latest"); loadFeed("latest", 1, false); } }}
          />
        ) : !searchQuery && displayPosts.length === 0 && activeTab === "bookmarks" ? (
          <EmptyState
            icon={Bookmark}
            title="No saved posts"
            description="Tap the bookmark icon on any post to save it here."
            action={{ label: "Browse Feed", onClick: () => { setActiveTab("latest"); loadFeed("latest", 1, false); } }}
          />
        ) : !searchQuery && displayPosts.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No posts yet"
            description="Be the first to share something with the community!"
            action={{ label: "Create Post", onClick: () => setIsCreatePostOpen(true) }}
          />
        ) : (
          <div className="space-y-6">
            {displayPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
              >
                <PostCard
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onEdit={(p) => setEditingPost(p)}
                  onDelete={handleDeletePost}
                  onUserClick={() => handleUserClick(post)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More - only for feed, not search or bookmarks single-page */}
        {!isLoading && !searchQuery && hasMore && (
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => loadFeed(activeTab, page + 1, true)}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-8 py-3 font-extrabold uppercase tracking-tighter text-sm border transition-all disabled:opacity-60"
              style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)`, color: CREAM }}
              onMouseEnter={(e) => !isLoadingMore && (e.currentTarget.style.borderColor = AMBER)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = `color-mix(in oklab, var(--hm-text) 6%, transparent)`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoadingMore ? "Loading..." : "Load More Posts"}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePost}
        currentUser={user}
      />

      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onSubmit={handleEditPost}
          initialContent={editingPost.content}
          currentUser={user}
        />
      )}

      {profileModal && (
        <UserProfileModal
          isOpen={!!profileModal}
          onClose={() => setProfileModal(null)}
          userId={profileModal.userId}
          displayName={profileModal.displayName}
          username={profileModal.username}
          avatarUrl={profileModal.avatarUrl}
          isVerified={profileModal.isVerified}
          profileFlair={profileModal.profileFlair}
          bio={profileModal.bio}
          userPosts={posts.filter((p) => p.user_id === profileModal.userId)}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
