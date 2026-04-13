"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Clock,
  Users,
  MessagesSquare,
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
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/hub/Avatar";
import PostCard from "@/components/hub/PostCard";
import CreatePostModal from "@/components/hub/CreatePostModal";
import EditPostModal from "@/components/hub/EditPostModal";
import UserProfileModal from "@/components/hub/UserProfileModal";
import NotificationPanel from "@/components/hub/NotificationPanel";
import { PostCardSkeletonList } from "@/components/hub/PostCardSkeleton";
import EmptyState from "@/components/hub/EmptyState";

type TabType = FeedMode | "bookmarks";

export default function HubFeedPage() {
  const { user } = useAuth();

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
  const [activeTab, setActiveTab]           = useState<TabType>("latest");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost]           = useState<Post | null>(null);
  const [profileModal, setProfileModal]         = useState<{
    userId: string;
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
    isVerified: boolean | null;
    bio: string | null;
  } | null>(null);

  // Stable ref to current user id — used inside realtime callback to avoid stale closure
  const userIdRef = useRef<string | undefined>(user?.id);
  useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

  // IDs of posts we created locally — realtime should skip these since
  // handleCreatePost is already the source of truth for own new posts.
  const ownPostIdsRef = useRef<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // Feed / bookmarks loading
  // ---------------------------------------------------------------------------
  const loadFeed = useCallback(
    async (tab: TabType, pageNum: number, append: boolean) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        let result;
        if (tab === "bookmarks") {
          result = await hubService.getBookmarks(user!.id, pageNum, 20);
        } else {
          result = await hubService.getFeed(user?.id, pageNum, 20, tab);
        }
        setPosts((prev) => (append ? [...prev, ...result.data] : result.data));
        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch {
        setError("Failed to load. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [user?.id, user]
  );

  useEffect(() => {
    loadFeed(activeTab, 1, false);
  }, [activeTab, loadFeed]);

  // ---------------------------------------------------------------------------
  // Realtime — prepend new posts (enriched with profiles + like/bookmark state)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = hubService.subscribeToFeed(async (rawPost) => {
      // Skip posts we created ourselves — handleCreatePost already prepended them
      if (ownPostIdsRef.current.has(rawPost.id)) return;

      // Enrich the raw realtime payload (no profiles join, no is_liked) before
      // prepending — fall back to the raw post if the fetch fails.
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
  }, []);

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
    postType: PostType = "general"
  ) => {
    if (!user) return;

    const newPost = await hubService.createPost(user.id, content, { post_type: postType });
    // Register immediately so the realtime handler skips this ID
    ownPostIdsRef.current.add(newPost.id);

    const ownProfiles = { username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, is_verified: user.is_verified };

    if (mediaFile) {
      const mediaUrl    = await hubService.uploadPostMedia(user.id, newPost.id, mediaFile);
      const updatedPost = await hubService.updatePost(newPost.id, content, [mediaUrl]);
      const enriched    = { ...updatedPost, profiles: ownProfiles, is_liked: false, is_bookmarked: false };
      setPosts((prev) => {
        // Realtime may have already prepended this post — update in place instead of duplicating
        if (prev.some((p) => p.id === enriched.id)) {
          return prev.map((p) => p.id === enriched.id ? enriched : p);
        }
        return [enriched, ...prev];
      });
    } else {
      const enriched = { ...newPost, profiles: ownProfiles, is_liked: false, is_bookmarked: false };
      setPosts((prev) => {
        // Realtime may have already prepended this post — update in place instead of duplicating
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
      bio:         null,
    });
    try {
      const profile = await hubService.getUserProfile(post.user_id);
      if (profile) {
        setProfileModal((prev) =>
          prev?.userId === post.user_id ? { ...prev, bio: profile.bio } : prev
        );
      }
    } catch {
      // bio is non-critical — leave as null
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
    <div className="min-h-screen bg-[#0B0D0F] pt-16">

      {/* Sticky header */}
      <div className="bg-[#111418]/95 backdrop-blur-lg border-b border-gray-800 sticky top-16 z-40">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Desktop back */}
              <Link href="/hub" className="hidden md:block">
                <motion.button
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>

              {/* Mobile menu toggle */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>

              <h1
                className="text-lg md:text-xl font-extrabold uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                HalalMe <span className="text-[#F59E0B]">Hub</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification bell */}
              {user && <NotificationPanel userId={user.id} />}

              {/* Create post */}
              <motion.button
                onClick={() => setIsCreatePostOpen(true)}
                className="flex items-center gap-1.5 bg-[#F59E0B] text-[#0B0D0F] px-3 md:px-4 py-2 rounded-full font-bold shadow-lg text-sm"
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
                className="md:hidden border-t border-gray-800 mt-3"
              >
                <div className="py-3 space-y-1">
                  <Link href="/hub" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-gray-800/80 transition-colors">
                      <Home className="w-5 h-5" />
                      <span className="font-semibold">Hub Home</span>
                    </div>
                  </Link>
                  <Link href="/kitchen" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-gray-800/80 transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                      <span className="font-semibold">Back to Kitchen</span>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-4xl px-4 md:px-6 pb-3 pt-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-semibold transition-all whitespace-nowrap text-xs md:text-sm ${
                    activeTab === tab.id
                      ? "bg-[#F59E0B] text-[#0B0D0F]"
                      : "bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-white hover:border-amber-500/30"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="mx-auto max-w-4xl px-4 md:px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, users..."
              className="w-full bg-gray-800/60 text-white rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 border border-gray-700 hover:border-gray-600 font-normal transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            />
            {searchQuery && (
              <motion.button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
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
              ? <Loader2 className="w-4 h-4 text-[#F59E0B] animate-spin" />
              : <Search className="w-4 h-4 text-gray-500" />
            }
            <span className="text-sm text-gray-400 font-normal" style={{ fontFamily: "var(--font-body)" }}>
              {isSearching ? "Searching..." : `${userResults.length + searchResults.length} result${userResults.length + searchResults.length !== 1 ? "s" : ""} for "${searchQuery}"`}
            </span>
          </div>
        )}

        {/* User results */}
        {searchQuery && !isSearching && userResults.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">People</p>
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
                    bio: u.bio,
                  })}
                  className="w-full flex items-center gap-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-amber-500/30 rounded-xl px-4 py-3 text-left transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Avatar src={u.avatar_url ?? undefined} alt={u.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-sm truncate">{u.full_name}</span>
                      {u.is_verified && (
                        <svg className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {u.username && <p className="text-xs text-gray-500 truncate">@{u.username}</p>}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length > 0 && (
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Posts</p>
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
            action={{ label: "Browse Latest", onClick: () => setActiveTab("latest") }}
          />
        ) : !searchQuery && displayPosts.length === 0 && activeTab === "bookmarks" ? (
          <EmptyState
            icon={Bookmark}
            title="No saved posts"
            description="Tap the bookmark icon on any post to save it here."
            action={{ label: "Browse Feed", onClick: () => setActiveTab("latest") }}
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

        {/* Load More — only for feed, not search or bookmarks single-page */}
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
              className="flex items-center gap-2 bg-gray-800/60 text-gray-300 hover:text-white px-8 py-3 rounded-full font-bold border border-gray-700 hover:border-amber-500/40 transition-all disabled:opacity-60"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
          bio={profileModal.bio}
          userPosts={posts.filter((p) => p.user_id === profileModal.userId)}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
