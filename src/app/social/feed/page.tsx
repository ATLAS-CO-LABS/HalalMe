"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowUp, Plus, Sparkles, Clock, Users, MessagesSquare, MessageCircle, ChefHat,
  HelpCircle, Star, Search, Bookmark, X, Menu, Home, Loader2, AlertCircle, RotateCcw, Gift, Check,
} from "lucide-react";
import type { Post, PostType, RecipeSummary, UserSearchResult } from "@/types";
import { hubService, type FeedMode } from "@/services/hubService";
import { mergeUniqueById, prependUniqueById, type FeedCursor } from "@/lib/socialFeed";
import { withTimeout, TimeoutError } from "@/lib/withTimeout";
import { useResumeKey } from "@/context/AppResumeContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import { profileHref } from "@/lib/profileHref";
import Avatar from "@/components/hub/Avatar";
import PostCard from "@/components/hub/PostCard";
import CreatePostModal, { type PostedMeta } from "@/components/hub/CreatePostModal";
import EditPostModal from "@/components/hub/EditPostModal";
import NotificationPanel from "@/components/hub/NotificationPanel";
import { PostCardSkeletonList } from "@/components/hub/PostCardSkeleton";
import EmptyState from "@/components/hub/EmptyState";

const BG = "var(--hub-bg)";
const BG2 = "var(--hub-bg2)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";
const MUTED = "var(--hm-text-muted)";
const SUBTLE = "var(--hm-text-subtle)";
const DIVIDER = "color-mix(in oklab, var(--hm-text) 6%, transparent)";

const PAGE_SIZE = 15;
const COMPOSE_TYPES: PostType[] = ["general", "recipe", "question", "review"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type TabType = FeedMode;

const TABS: { id: TabType; label: string; icon: typeof Clock }[] = [
  { id: "for_you",   label: "For You",   icon: Sparkles },
  { id: "latest",    label: "Latest",    icon: Clock },
  { id: "following", label: "Following", icon: Users },
  { id: "saved",     label: "Saved",     icon: Bookmark },
];

const TYPE_FILTERS = [
  { value: "all",      label: "All",       Icon: Sparkles      },
  { value: "general",  label: "Posts",     Icon: MessageCircle },
  { value: "recipe",   label: "Recipes",   Icon: ChefHat       },
  { value: "question", label: "Questions", Icon: HelpCircle    },
  { value: "review",   label: "Reviews",   Icon: Star          },
] as const;

/** Old links used ?tab=bookmarks; ?tab=trending maps onto the ranked feed. */
function tabFromParam(v: string | null): TabType {
  if (v === "bookmarks" || v === "saved") return "saved";
  if (v === "latest" || v === "following") return v;
  return "for_you";
}

// ---------------------------------------------------------------------------
// useSearchParams() requires a Suspense boundary, so page.tsx only owns the
// Suspense wrapper and the content lives in HubFeedPageInner.
export default function HubFeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16" style={{ backgroundColor: BG }} />}>
      <HubFeedPageInner />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Wrapper - resumeKey forces a full remount of HubFeedContent on every
// tab-resume reconnect, so React discards all state and refs cleanly.
// ---------------------------------------------------------------------------
function HubFeedPageInner() {
  const resumeKey = useResumeKey();
  const searchParams = useSearchParams();
  const initialTab = tabFromParam(searchParams.get("tab"));
  const composeParam = searchParams.get("compose");
  const recipeParam = searchParams.get("recipe");
  const compose = composeParam && (COMPOSE_TYPES as string[]).includes(composeParam)
    ? { type: composeParam as PostType, recipeId: recipeParam && UUID_RE.test(recipeParam) ? recipeParam : null }
    : null;

  return (
    <HubFeedContent key={resumeKey} initialTab={initialTab} compose={compose} />
  );
}

interface Toast { id: number; text: string; href?: string; hrefLabel?: string; tone?: "points" | "plain" }

function HubFeedContent({
  initialTab = "for_you",
  compose,
}: {
  initialTab?: TabType;
  compose: { type: PostType; recipeId: string | null } | null;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { requireAuth } = useAuthGate();
  const resumeKey = useResumeKey();
  const router = useRouter();

  // Feed state
  const [posts, setPosts]                     = useState<Post[]>([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [isLoadingMore, setIsLoadingMore]     = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError]     = useState(false);
  const [hasMore, setHasMore]                 = useState(false);
  const cursorRef                             = useRef<FeedCursor | null>(null);

  // New posts that arrived over realtime while reading. Shown as a pill rather
  // than shoved in at the top, which used to jump the page under the reader.
  const [incoming, setIncoming] = useState<string[]>([]);

  // Deleting a post removes it from view immediately but holds the actual
  // API call for a few seconds so it can be undone.
  const [pendingDelete, setPendingDelete] = useState<{ post: Post; index: number } | null>(null);
  const pendingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  useEffect(() => () => { pendingTimersRef.current.forEach(clearTimeout); }, []);

  // Search state (server-side)
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [userResults, setUserResults]     = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [searchError, setSearchError]     = useState(false);
  const searchDebounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI state
  const [activeTab, setActiveTab]           = useState<TabType>(initialTab);
  const activeTabRef                        = useRef<TabType>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typeFilter, setTypeFilter]         = useState<string>("all");
  const typeFilterRef                       = useRef<string>("all");
  const [toast, setToast]                   = useState<Toast | null>(null);

  // Modal state
  const [composer, setComposer] = useState<{ open: boolean; type: PostType; recipe: RecipeSummary | null }>({ open: false, type: "general", recipe: null });
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Stable ref to current user id - used inside realtime callback to avoid stale closure
  const userIdRef = useRef<string | undefined>(user?.id);
  useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

  // Tracks the AbortController for the in-flight request so a superseded one
  // is cancelled rather than left throttled in the background.
  const feedAbortRef = useRef<AbortController | null>(null);
  // Monotonic request counter: guards data/error writes from stale responses.
  const loadFeedRequestIdRef = useRef(0);
  // IDs we created locally - realtime skips these.
  const ownPostIdsRef = useRef<Set<string>>(new Set());
  // When each of those was added locally, so a page-one load that was already
  // in flight doesn't wipe a post made while it was loading.
  const ownPostedAtRef = useRef<Map<string, number>>(new Map());
  // See the auth-hydration effect below.
  const hadNullUserAtMount = useRef<boolean>(false);
  // The empty-result auth-race retry fires at most once per mount.
  const retriedEmptyRef = useRef(false);
  // Safety net: clears loading if nothing else does (longer than timeout+retry).
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((t: Omit<Toast, "id">) => setToast({ ...t, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.tone === "points" ? 6000 : 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ---------------------------------------------------------------------------
  // Feed loading: page one (append=false) or the next page after cursorRef.
  // ---------------------------------------------------------------------------
  const loadFeed = useCallback(
    async (tab: TabType, append: boolean) => {
      feedAbortRef.current?.abort();
      const controller = new AbortController();
      feedAbortRef.current = controller;
      const { signal } = controller;
      const requestId = ++loadFeedRequestIdRef.current;
      const startedAt = Date.now();

      if (append) { setIsLoadingMore(true); setLoadMoreError(false); }
      else { setIsLoading(true); setError(null); setIncoming([]); cursorRef.current = null; }

      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setIsLoadingMore(false);
      }, 15_000);

      // Following / Saved need a signed-in user. The tab clicks are gated with
      // requireAuth; this guards every other entry path (a ?tab=saved URL, a
      // resume re-fetch) so a logged-out visitor just gets an empty list.
      const needsUser = tab === "following" || tab === "saved";
      const attempt = () => withTimeout(
        needsUser && !user?.id
          ? Promise.resolve({ data: [] as Post[], nextCursor: null, hasMore: false })
          : hubService.getFeedPage({
              mode: tab,
              cursor: append ? cursorRef.current : null,
              limit: PAGE_SIZE,
              postType: typeFilterRef.current !== "all" ? typeFilterRef.current : null,
              signal,
            }),
        10_000,
      );

      let retryScheduled = false;
      try {
        let result;
        try {
          result = await attempt();
        } catch (err) {
          // After a background tab the network can need a moment; retry once.
          if (!(err instanceof TimeoutError)) throw err;
          await new Promise<void>((r) => setTimeout(r, 1_000));
          if (requestId !== loadFeedRequestIdRef.current) return;
          result = await attempt();
        }

        // After a resume, PostgREST can answer before the token refresh lands
        // and RLS returns []. Retry page one once if a signed-in user got
        // nothing, then accept a second empty answer as real.
        if (!append && result.data.length === 0 && user?.id && !retriedEmptyRef.current) {
          retriedEmptyRef.current = true;
          retryScheduled = true;
          setTimeout(() => {
            if (requestId === loadFeedRequestIdRef.current) loadFeed(tab, false);
          }, 800);
          return;
        }

        if (requestId !== loadFeedRequestIdRef.current) return;
        cursorRef.current = result.nextCursor;
        setPosts((prev) => {
          if (append) return mergeUniqueById(prev, result.data);
          // Posts created after this request left can't be in its answer.
          // Without this, posting while the feed was loading (e.g. right after
          // navigating back) made the new post vanish when the page landed.
          const postedSince = prev.filter((p) => (ownPostedAtRef.current.get(p.id) ?? 0) >= startedAt);
          return prependUniqueById(result.data, postedSince);
        });
        setHasMore(result.hasMore);
      } catch {
        if (requestId === loadFeedRequestIdRef.current) {
          if (append) setLoadMoreError(true);
          else setError("We couldn't load the feed. Check your connection and try again.");
        }
      } finally {
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        // signal.aborted means a newer call owns the loading state now.
        if (!signal.aborted && !retryScheduled) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    // user?.id, not user: a token refresh hands back a new Profile object with
    // the same id, which must not reload the feed.
    [user?.id]
  );

  useEffect(() => () => { if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current); }, []);

  // One controlled fetch on mount. Tab switches load from their click handler.
  useEffect(() => {
    hadNullUserAtMount.current = !user?.id;
    loadFeed(activeTab, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth hydration recovery: if the mount ran before the session was ready,
  // re-fetch exactly once when the user arrives (personalised ranking, likes).
  useEffect(() => {
    if (!hadNullUserAtMount.current || !user?.id) return;
    hadNullUserAtMount.current = false;
    loadFeed(activeTabRef.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Infinite scroll. The sentinel sits under the last post; it triggers a
  // little early (600px) so the next page is usually there before it's needed.
  // A failed page stops auto-loading until Retry is pressed, so a dead
  // connection can't spin requests in a loop.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || isLoading || isLoadingMore || loadMoreError || searchQuery) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadFeed(activeTabRef.current, true); },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMoreError, searchQuery, loadFeed, posts.length]);

  // ---------------------------------------------------------------------------
  // Realtime: count new posts for the "new posts" pill. resumeKey re-creates
  // the channel after an app-resume reconnect (a programmatic disconnect leaves
  // the old channel permanently dead).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = hubService.subscribeToFeed((raw) => {
      // Own posts are added by handlePosted. Checked by author too, because the
      // realtime event can arrive before the composer reports back.
      if (ownPostIdsRef.current.has(raw.id) || raw.user_id === userIdRef.current) return;
      if ((raw as Post & { is_published?: boolean }).is_published === false) return;
      const tab = activeTabRef.current;
      if (tab !== "for_you" && tab !== "latest") return;
      if (typeFilterRef.current !== "all" && raw.post_type !== typeFilterRef.current) return;
      setIncoming((prev) => (prev.includes(raw.id) ? prev : [...prev, raw.id]));
    });
    return unsubscribe;
  }, [user?.id, resumeKey]);

  const showIncoming = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadFeed(activeTabRef.current, false);
  };

  // ---------------------------------------------------------------------------
  // Server-side search (debounced)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setUserResults([]);
      setIsSearching(false);
      setSearchError(false);
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
        setSearchError(false);
      } catch {
        setSearchResults([]);
        setUserResults([]);
        setSearchError(true);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, user?.id]);

  // ---------------------------------------------------------------------------
  // Compose: header button, empty states, and deep links from Kitchen /
  // the Assistant (?compose=recipe&recipe=<id>).
  // ---------------------------------------------------------------------------
  const openComposer = useCallback((type: PostType = "general", recipe: RecipeSummary | null = null) => {
    requireAuth(() => setComposer({ open: true, type, recipe }), "Sign in to post");
  }, [requireAuth]);

  // Waits for auth to settle: on a fresh page load the session is still
  // hydrating at mount, and requireAuth would show "sign in" to someone who is
  // signed in. The ref keeps the call on the latest requireAuth after the
  // recipe fetch, not the one captured before the user arrived.
  const composeHandledRef = useRef(false);
  const openComposerRef = useRef(openComposer);
  useEffect(() => { openComposerRef.current = openComposer; }, [openComposer]);
  useEffect(() => {
    if (!compose || composeHandledRef.current || authLoading) return;
    composeHandledRef.current = true;
    // Drop the params so a refresh or back navigation doesn't reopen it.
    router.replace(initialTab === "for_you" ? "/social/feed" : `/social/feed?tab=${initialTab}`, { scroll: false });
    (async () => {
      const recipe = compose.recipeId ? await hubService.getRecipeSummary(compose.recipeId).catch(() => null) : null;
      if (compose.recipeId && !recipe) showToast({ text: "That recipe couldn't be found. Choose one to share instead." });
      openComposerRef.current(compose.type, recipe);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const handlePosted = useCallback((post: Post, meta: PostedMeta) => {
    ownPostIdsRef.current.add(post.id);
    ownPostedAtRef.current.set(post.id, Date.now());
    const tab = activeTabRef.current;
    const filter = typeFilterRef.current;
    const visibleHere = (tab === "for_you" || tab === "latest") && (filter === "all" || filter === post.post_type) && !searchQuery;
    if (visibleHere) {
      setPosts((prev) => prependUniqueById(prev, [post]));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (meta.pointsAwarded > 0) {
      showToast({ text: `Recipe shared. You earned ${meta.pointsAwarded} points.`, href: "/dashboard?tab=rewards", hrefLabel: "View points", tone: "points" });
    } else {
      showToast({ text: "Posted.", ...(visibleHere ? {} : { href: `/social/post/${post.id}`, hrefLabel: "View post" }) });
    }
  }, [searchQuery, showToast]);

  // ---------------------------------------------------------------------------
  // Post actions
  // ---------------------------------------------------------------------------
  const patchEverywhere = useCallback((fn: (list: Post[]) => Post[]) => {
    setPosts(fn);
    setSearchResults(fn);
  }, []);

  const handleLike = useCallback(
    async (postId: string, currentIsLiked: boolean) => {
      if (!user) return;
      const flip = (liked: boolean) => (list: Post[]) =>
        list.map((p) => p.id === postId ? { ...p, is_liked: liked, like_count: Math.max(0, p.like_count + (liked ? 1 : -1)) } : p);

      patchEverywhere(flip(!currentIsLiked));
      try {
        if (currentIsLiked) await hubService.unlikePost(postId, user.id);
        else                await hubService.likePost(postId, user.id);
      } catch {
        patchEverywhere(flip(currentIsLiked));
        showToast({ text: "Couldn't update that like. Please try again." });
      }
    },
    [user, patchEverywhere, showToast]
  );

  const handleBookmark = useCallback(
    async (postId: string, currentIsBookmarked: boolean) => {
      if (!user) return;
      const set = (saved: boolean) => (list: Post[]) => list.map((p) => (p.id === postId ? { ...p, is_bookmarked: saved } : p));

      patchEverywhere(set(!currentIsBookmarked));
      const removedFromSaved = activeTabRef.current === "saved" && currentIsBookmarked;
      const snapshot = posts;
      if (removedFromSaved) setPosts((prev) => prev.filter((p) => p.id !== postId));

      try {
        if (currentIsBookmarked) await hubService.unbookmarkPost(postId, user.id);
        else                     await hubService.bookmarkPost(postId, user.id);
        if (!currentIsBookmarked) showToast({ text: "Saved.", href: "/social/feed?tab=saved", hrefLabel: "View saved" });
      } catch {
        if (removedFromSaved) setPosts(snapshot);
        patchEverywhere(set(currentIsBookmarked));
        showToast({ text: "Couldn't update your saved posts. Please try again." });
      }
    },
    [user, posts, patchEverywhere, showToast]
  );

  const handleEditPost = async (changes: { content: string; title?: string | null }) => {
    if (!editingPost) return;
    const updated = await hubService.updatePost(editingPost.id, changes);
    patchEverywhere((list) =>
      list.map((p) => (p.id === updated.id ? { ...p, content: updated.content, title: updated.title, updated_at: updated.updated_at } : p))
    );
    setEditingPost(null);
  };

  const UNDO_WINDOW_MS = 5000;

  // Side effects stay outside the setPosts updater: Strict Mode double-invokes
  // updaters, which used to duplicate the timer and the restored post.
  const handleDeletePost = useCallback(
    (postId: string) => {
      const index = posts.findIndex((p) => p.id === postId);
      if (index === -1) return;
      const post = posts[index];
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSearchResults((prev) => prev.filter((p) => p.id !== postId));
      setPendingDelete({ post, index });
      const timer = setTimeout(async () => {
        pendingTimersRef.current.delete(postId);
        setPendingDelete((cur) => (cur?.post.id === postId ? null : cur));
        try {
          await hubService.deletePost(postId);
        } catch {
          showToast({ text: "That post couldn't be deleted. It's back in your feed." });
          loadFeed(activeTabRef.current, false);
        }
      }, UNDO_WINDOW_MS);
      pendingTimersRef.current.set(postId, timer);
    },
    [posts, loadFeed, showToast]
  );

  const undoDeletePost = useCallback(() => {
    if (!pendingDelete) return;
    const { post, index } = pendingDelete;
    const timer = pendingTimersRef.current.get(post.id);
    if (timer) { clearTimeout(timer); pendingTimersRef.current.delete(post.id); }
    setPendingDelete(null);
    setPosts((prev) => {
      if (prev.some((p) => p.id === post.id)) return prev;
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, post);
      return next;
    });
  }, [pendingDelete]);

  // Following/Saved need an account: prompt sign-in instead of switching to a
  // tab that can only ever be empty for a logged-out visitor.
  const switchTab = (tabId: TabType) => {
    const doSwitch = () => {
      setActiveTab(tabId);
      activeTabRef.current = tabId;
      setTypeFilter("all");
      typeFilterRef.current = "all";
      setSearchQuery("");
      setSearchResults([]);
      setPosts([]);
      loadFeed(tabId, false);
    };
    if (tabId === "following" || tabId === "saved") {
      requireAuth(doSwitch, tabId === "saved" ? "Sign in to see your saved posts" : "Sign in to see posts from people you follow");
    } else {
      doSwitch();
    }
  };

  const applyTypeFilter = (value: string) => {
    if (value === typeFilterRef.current) return;
    typeFilterRef.current = value;
    setTypeFilter(value);
    setPosts([]);
    loadFeed(activeTabRef.current, false);
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const displayPosts = searchQuery ? searchResults : posts;
  const filterLabel = TYPE_FILTERS.find((f) => f.value === typeFilter)?.label.toLowerCase() ?? "posts";
  const showEmpty = !isLoading && !error && !searchQuery && displayPosts.length === 0;

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: BG }}>

      {/* Sticky header - solid bg (no blur) avoids scroll-repaint tearing under the fixed app header */}
      <div className="border-b sticky top-16 z-40" style={{ backgroundColor: BG2, borderColor: DIVIDER }}>
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/social"
                aria-label="Back to Social"
                className="hidden md:inline-flex p-1 -ml-1 transition-colors hover:text-(--hm-text) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: SUBTLE }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                className="md:hidden p-1 -ml-1 transition-colors focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: SUBTLE }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <h1 className="text-lg md:text-xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                HalalMe <span style={{ color: AMBER }}>Social</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {user && <NotificationPanel userId={user.id} />}
              <button
                type="button"
                onClick={() => openComposer()}
                className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 font-extrabold uppercase tracking-tighter text-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)"
                style={{ backgroundColor: AMBER, color: BG }}
              >
                <Plus className="w-4 h-4" aria-hidden />
                <span>Post</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t mt-3 overflow-hidden"
                style={{ borderColor: DIVIDER }}
                aria-label="Social"
              >
                <div className="py-3 space-y-1">
                  <Link href="/social" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 font-semibold hover:bg-[color-mix(in_oklab,var(--hm-text)_4%,transparent)]" style={{ color: CREAM }}>
                    <Home className="w-5 h-5" aria-hidden /> Social Home
                  </Link>
                  <Link href="/kitchen" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 font-semibold hover:bg-[color-mix(in_oklab,var(--hm-text)_4%,transparent)]" style={{ color: CREAM }}>
                    <ChefHat className="w-5 h-5" aria-hidden /> Kitchen
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-3xl px-4 md:px-6 flex overflow-x-auto scrollbar-hide" role="tablist" aria-label="Feed">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(tab.id)}
                className="relative inline-flex items-center gap-1.5 px-3 md:px-4 py-2.5 font-extrabold uppercase tracking-widest transition-colors whitespace-nowrap text-xs focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--hm-amber)"
                style={{ color: active ? AMBER : SUBTLE }}
              >
                <tab.icon className="w-3.5 h-3.5" aria-hidden />
                {tab.label}
                {active && (
                  <motion.div layoutId="hub-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: AMBER }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Type filter */}
        <div className="mx-auto max-w-3xl px-4 md:px-6 pb-3 pt-3 flex gap-1.5 overflow-x-auto scrollbar-hide" role="group" aria-label="Filter by post type">
          {TYPE_FILTERS.map((f) => {
            const active = typeFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => applyTypeFilter(f.value)}
                aria-pressed={active}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-colors border focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--hm-amber)"
                style={active
                  ? { backgroundColor: AMBER, color: BG, borderColor: AMBER }
                  : { backgroundColor: "transparent", color: MUTED, borderColor: "color-mix(in oklab, var(--hm-text) 9%, transparent)" }}
              >
                <f.Icon className="w-3 h-3" aria-hidden />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mx-auto max-w-3xl px-4 md:px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: SUBTLE }} aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, questions, reviews or people"
              aria-label="Search Social"
              className="w-full text-base pl-10 pr-10 py-2.5 border border-[color-mix(in_oklab,var(--hm-text)_9%,transparent)] focus:outline-none focus:border-(--hm-amber) transition-colors"
              style={{ backgroundColor: BG, color: CREAM, caretColor: AMBER }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors hover:text-(--hm-text) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: SUBTLE }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* New posts pill: anchored under the sticky header so it follows it. */}
        <AnimatePresence>
          {incoming.length > 0 && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-3"
            >
              <button
                type="button"
                onClick={showIncoming}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold shadow-lg whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)"
                style={{ backgroundColor: AMBER, color: BG }}
              >
                <ArrowUp className="w-4 h-4" aria-hidden />
                {incoming.length === 1 ? "1 new post" : `${incoming.length} new posts`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feed */}
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-8" aria-busy={isLoading}>
        {searchQuery && (
          <div className="mb-4 flex items-center gap-2" aria-live="polite">
            {isSearching
              ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: AMBER }} aria-hidden />
              : <Search className="w-4 h-4" style={{ color: SUBTLE }} aria-hidden />}
            <span className="text-sm" style={{ color: MUTED }}>
              {isSearching
                ? "Searching"
                : searchError
                  ? "Search isn't working right now. Please try again."
                  : `${userResults.length + searchResults.length} result${userResults.length + searchResults.length !== 1 ? "s" : ""} for "${searchQuery}"`}
            </span>
          </div>
        )}

        {searchQuery && !isSearching && userResults.length > 0 && (
          <section className="mb-6" aria-label="People">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: SUBTLE }}>People</p>
            <div className="space-y-2">
              {userResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => requireAuth(() => router.push(profileHref(u.id, u.username)), "Sign in to view profiles")}
                  className="w-full flex items-center gap-3 border border-[color-mix(in_oklab,var(--hm-text)_6%,transparent)] px-4 py-3 text-left transition-colors hover:border-[color-mix(in_oklab,var(--hm-amber)_25%,transparent)] focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ backgroundColor: BG2 }}
                >
                  <Avatar src={u.avatar_url ?? undefined} alt="" size="md" flair={u.profile_flair} />
                  <div className="flex-1 min-w-0">
                    <span className="block font-semibold text-sm truncate" style={{ color: CREAM }}>{u.full_name ?? u.username}</span>
                    {u.username && <span className="block text-xs truncate" style={{ color: SUBTLE }}>@{u.username}</span>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {searchQuery && !isSearching && searchResults.length > 0 && (
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: SUBTLE }}>Posts</p>
        )}

        {isLoading ? (
          <PostCardSkeletonList count={3} />
        ) : error ? (
          <EmptyState icon={AlertCircle} title="Something went wrong" description={error} action={{ label: "Try Again", onClick: () => loadFeed(activeTab, false) }} />
        ) : searchQuery && !isSearching && displayPosts.length === 0 && userResults.length === 0 && !searchError ? (
          <EmptyState icon={Search} title="No results" description={`Nothing matches "${searchQuery}". Try a dish, a place or a name.`} action={{ label: "Clear Search", onClick: () => setSearchQuery("") }} />
        ) : showEmpty && typeFilter !== "all" ? (
          <EmptyState icon={MessagesSquare} title={`No ${filterLabel} yet`} description="Try another filter, or be the first to post one." action={{ label: "Show everything", onClick: () => applyTypeFilter("all") }} />
        ) : showEmpty && activeTab === "following" ? (
          <EmptyState icon={Users} title="Nothing here yet" description="Follow people to see their posts here. For You is a good place to find them." action={{ label: "Browse For You", onClick: () => switchTab("for_you") }} />
        ) : showEmpty && activeTab === "saved" ? (
          <EmptyState icon={Bookmark} title="No saved posts" description="Tap the bookmark on any post to keep it here for later." action={{ label: "Browse the feed", onClick: () => switchTab("for_you") }} />
        ) : showEmpty && activeTab === "for_you" ? (
          <EmptyState icon={Sparkles} title="Quiet this month" description="Nothing new in the last 30 days. Older posts are in Latest, or start something yourself." action={{ label: "See Latest", onClick: () => switchTab("latest") }} />
        ) : showEmpty ? (
          <EmptyState icon={MessagesSquare} title="No posts yet" description="Be the first to share something with the community." action={{ label: "Create Post", onClick: () => openComposer() }} />
        ) : (
          <div className="space-y-5">
            {displayPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onEdit={(p) => setEditingPost(p)}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}

        {/* Pagination: sentinel, loading, retry, end of feed */}
        {!isLoading && !error && !searchQuery && displayPosts.length > 0 && (
          <div className="mt-8 flex flex-col items-center" aria-live="polite">
            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            {isLoadingMore ? (
              <div className="w-full"><PostCardSkeletonList count={1} /></div>
            ) : loadMoreError ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-sm" style={{ color: MUTED }}>Couldn&apos;t load more posts.</p>
                <button
                  type="button"
                  onClick={() => loadFeed(activeTab, true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-tight border border-[color-mix(in_oklab,var(--hm-text)_6%,transparent)] transition-colors hover:border-(--hm-amber) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ color: CREAM, backgroundColor: BG2 }}
                >
                  <RotateCcw className="w-4 h-4" aria-hidden /> Retry
                </button>
              </div>
            ) : hasMore ? (
              // Keyboard and screen-reader path; the sentinel handles scrolling.
              <button
                type="button"
                onClick={() => loadFeed(activeTab, true)}
                className="sr-only focus:not-sr-only focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:border"
                style={{ color: CREAM, borderColor: DIVIDER }}
              >
                Load more posts
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Check className="w-5 h-5" style={{ color: AMBER }} aria-hidden />
                <p className="text-sm font-semibold" style={{ color: CREAM }}>You&apos;re all caught up</p>
                {activeTab === "for_you" ? (
                  <button type="button" onClick={() => switchTab("latest")} className="text-sm hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)" style={{ color: AMBER }}>
                    See older posts in Latest
                  </button>
                ) : (
                  <p className="text-xs" style={{ color: SUBTLE }}>That&apos;s everything here for now.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <CreatePostModal
        isOpen={composer.open}
        onClose={() => setComposer((c) => ({ ...c, open: false }))}
        onPosted={handlePosted}
        currentUser={user}
        initialType={composer.type}
        initialRecipe={composer.recipe}
      />

      {editingPost && (
        <EditPostModal isOpen={!!editingPost} onClose={() => setEditingPost(null)} onSubmit={handleEditPost} post={editingPost} />
      )}

      {/* Toasts: undo-delete takes priority over general feedback */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md" aria-live="polite">
        <AnimatePresence mode="wait">
          {pendingDelete ? (
            <motion.div
              key="undo"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-between gap-4 px-5 py-3 shadow-xl border"
              style={{ backgroundColor: BG2, borderColor: "color-mix(in oklab, var(--hm-text) 10%, transparent)" }}
            >
              <span className="text-sm font-medium" style={{ color: CREAM }}>Post deleted</span>
              <button type="button" onClick={undoDeletePost} className="text-sm font-extrabold uppercase tracking-wide hover:opacity-75 focus-visible:outline-2 focus-visible:outline-(--hm-amber)" style={{ color: AMBER }}>
                Undo
              </button>
            </motion.div>
          ) : toast ? (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-between gap-4 px-5 py-3 shadow-xl border"
              style={{
                backgroundColor: BG2,
                borderColor: toast.tone === "points" ? "color-mix(in oklab, var(--hm-amber) 45%, transparent)" : "color-mix(in oklab, var(--hm-text) 10%, transparent)",
              }}
              role="status"
            >
              <span className="flex items-center gap-2 text-sm font-medium" style={{ color: CREAM }}>
                {toast.tone === "points" && <Gift className="w-4 h-4 shrink-0" style={{ color: AMBER }} aria-hidden />}
                {toast.text}
              </span>
              {toast.href && (
                <Link href={toast.href} className="shrink-0 text-sm font-extrabold uppercase tracking-wide hover:opacity-75 focus-visible:outline-2 focus-visible:outline-(--hm-amber)" style={{ color: AMBER }}>
                  {toast.hrefLabel ?? "View"}
                </Link>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
