import { supabase } from "./supabase";
import type { Post, Comment, Notification, PaginatedResult, UserSearchResult } from "@/types";

export type FeedMode = "latest" | "trending" | "following";

export const hubService = {
  // ---------------------------------------------------------------------------
  // Posts
  // ---------------------------------------------------------------------------

  /**
   * Fetches a paginated feed of published posts.
   *
   * mode:
   *   "latest"    — ordered by created_at DESC (default)
   *   "trending"  — ordered by like_count DESC, then created_at DESC
   *   "following" — only posts from users the current user follows
   *                 (requires userId; returns empty if not authenticated or no follows)
   */
  async getFeed(
    userId?: string,
    page = 1,
    pageSize = 20,
    mode: FeedMode = "latest",
    signal?: AbortSignal,
    postType?: string
  ): Promise<PaginatedResult<Post>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const emptyResult: PaginatedResult<Post> = {
      data: [],
      count: 0,
      page,
      pageSize,
      hasMore: false,
    };

    // "following" mode: single query via DB view — no JS array round-trip
    if (mode === "following") {
      if (!userId) return emptyResult;

      const followingQuery = supabase
        .from("following_posts_view")
        .select("*", { count: "exact" })
        .eq("follower_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (postType) followingQuery.eq("post_type", postType);
      const { data, error, count } = await (signal ? followingQuery.abortSignal(signal) : followingQuery);

      if (error) throw new Error(error.message);

      let posts = (data ?? []) as Post[];
      if (posts.length === 0) return emptyResult;

      const postIds = posts.map((p) => p.id);
      const likesQ     = supabase.from("post_likes").select("post_id").eq("user_id", userId).in("post_id", postIds);
      const bookmarksQ = supabase.from("post_bookmarks").select("post_id").eq("user_id", userId).in("post_id", postIds);
      const [{ data: likes }, { data: bookmarks }] = await Promise.all([
        signal ? likesQ.abortSignal(signal) : likesQ,
        signal ? bookmarksQ.abortSignal(signal) : bookmarksQ,
      ]);
      const likedSet      = new Set((likes      ?? []).map((l) => l.post_id));
      const bookmarkedSet = new Set((bookmarks  ?? []).map((b) => b.post_id));
      posts = posts.map((p) => ({
        ...p,
        is_liked:      likedSet.has(p.id),
        is_bookmarked: bookmarkedSet.has(p.id),
      }));

      return { data: posts, count: count ?? 0, page, pageSize, hasMore: (count ?? 0) > page * pageSize };
    }

    let query = supabase
      .from("posts")
      .select(
        "*, profiles!user_id(username, full_name, avatar_url, is_verified)",
        { count: "exact" }
      )
      .eq("is_published", true)
      .range(from, to);

    if (postType) query = query.eq("post_type", postType);

    if (mode === "trending") {
      query = query
        .order("like_count", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await (signal ? query.abortSignal(signal) : query);
    if (error) throw new Error(error.message);

    let posts = (data ?? []) as Post[];

    // Attach is_liked + is_bookmarked for the current user
    if (userId && posts.length > 0) {
      const postIds    = posts.map((p) => p.id);
      const likesQ     = supabase.from("post_likes").select("post_id").eq("user_id", userId).in("post_id", postIds);
      const bookmarksQ = supabase.from("post_bookmarks").select("post_id").eq("user_id", userId).in("post_id", postIds);
      const [{ data: likes }, { data: bookmarks }] = await Promise.all([
        signal ? likesQ.abortSignal(signal) : likesQ,
        signal ? bookmarksQ.abortSignal(signal) : bookmarksQ,
      ]);
      const likedSet      = new Set((likes      ?? []).map((l) => l.post_id));
      const bookmarkedSet = new Set((bookmarks  ?? []).map((b) => b.post_id));
      posts = posts.map((p) => ({
        ...p,
        is_liked:      likedSet.has(p.id),
        is_bookmarked: bookmarkedSet.has(p.id),
      }));
    }

    return {
      data: posts,
      count: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    };
  },

  async getPostById(id: string, userId?: string, signal?: AbortSignal): Promise<Post> {
    // .abortSignal() must be called before .single() / .maybeSingle() because
    // those terminal qualifiers downcast to PostgrestBuilder which lacks the method.
    const postQ = supabase
      .from("posts")
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)")
      .eq("id", id);
    const { data, error } = await (signal ? postQ.abortSignal(signal).single() : postQ.single());
    if (error) throw new Error(error.message);

    if (userId) {
      const likeQ     = supabase.from("post_likes").select("post_id").eq("post_id", id).eq("user_id", userId);
      const bookmarkQ = supabase.from("post_bookmarks").select("post_id").eq("post_id", id).eq("user_id", userId);
      const [{ data: like }, { data: bookmark }] = await Promise.all([
        signal ? likeQ.abortSignal(signal).maybeSingle() : likeQ.maybeSingle(),
        signal ? bookmarkQ.abortSignal(signal).maybeSingle() : bookmarkQ.maybeSingle(),
      ]);
      return { ...data, is_liked: !!like, is_bookmarked: !!bookmark };
    }

    return data;
  },

  async createPost(
    userId: string,
    content: string,
    options?: {
      media_urls?: string[];
      media_public_ids?: string[];
      post_type?: Post["post_type"];
      recipe_id?: string;
    }
  ): Promise<Post> {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        content,
        media_urls:        options?.media_urls        ?? [],
        media_public_ids:  options?.media_public_ids  ?? [],
        post_type: options?.post_type ?? "general",
        recipe_id: options?.recipe_id ?? null,
      })
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)")
      .single();
    if (error) throw new Error(error.message);
    return { ...data, is_liked: false };
  },

  /** Updates a post's content and optionally its media. */
  async updatePost(
    id: string,
    content: string,
    media_urls?: string[],
    media_public_ids?: string[]
  ): Promise<Post> {
    const updates: Record<string, unknown> = { content };
    if (media_urls !== undefined)       updates.media_urls       = media_urls;
    if (media_public_ids !== undefined) updates.media_public_ids = media_public_ids;

    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)")
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deletePost(id: string): Promise<void> {
    const { data: post } = await supabase
      .from("posts")
      .select("media_public_ids")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);

    // Best-effort Cloudinary cleanup — fire-and-forget, never block
    if (post?.media_public_ids?.length) {
      fetch("/api/upload/delete", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ public_ids: post.media_public_ids }),
      }).catch(() => {});
    }
  },

  /**
   * Uploads a media file directly to Cloudinary (unsigned preset).
   * Returns { url, public_id } — store both on the post for later deletion
   * and transformation support.
   */
  async uploadPostMedia(
    userId: string,
    postId: string,
    file: File
  ): Promise<{ url: string; public_id: string }> {
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    if (file.size > MAX_FILE_SIZE) throw new Error("File size exceeds the 50 MB limit.");
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new Error(`File type "${file.type}" is not allowed. Use JPEG, PNG, WebP, GIF, or MP4.`);
    }

    const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const resourceType = file.type.startsWith("video/") ? "video" : "image";

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset!);
    form.append("folder", `halalme/posts/${userId}/${postId}`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: "POST", body: form }
    );

    if (!res.ok) {
      const data = await res.json() as { error?: { message?: string } };
      throw new Error(data.error?.message ?? "Upload failed");
    }

    const data = await res.json() as { secure_url: string; public_id: string };
    return { url: data.secure_url, public_id: data.public_id };
  },

  /** Returns all published posts for a given user profile. */
  async getUserPosts(userId: string, currentUserId?: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)")
      .eq("user_id", userId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    let posts = (data ?? []) as Post[];

    if (currentUserId && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const [{ data: likes }, { data: bookmarks }] = await Promise.all([
        supabase.from("post_likes").select("post_id").eq("user_id", currentUserId).in("post_id", postIds),
        supabase.from("post_bookmarks").select("post_id").eq("user_id", currentUserId).in("post_id", postIds),
      ]);
      const likedSet      = new Set((likes      ?? []).map((l) => l.post_id));
      const bookmarkedSet = new Set((bookmarks  ?? []).map((b) => b.post_id));
      posts = posts.map((p) => ({
        ...p,
        is_liked:      likedSet.has(p.id),
        is_bookmarked: bookmarkedSet.has(p.id),
      }));
    }

    return posts;
  },

  /** Fetches a user's public profile data (for the profile modal). */
  async getUserProfile(userId: string): Promise<{
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
    bio: string | null;
    created_at: string;
  } | null> {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, is_verified, bio, created_at")
      .eq("id", userId)
      .single();
    return data ?? null;
  },

  // ---------------------------------------------------------------------------
  // Likes (optimistic-update friendly)
  // ---------------------------------------------------------------------------
  async likePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId });
    if (error && error.code !== "23505") throw new Error(error.message);
  },

  async unlikePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  // ---------------------------------------------------------------------------
  // Comments
  // ---------------------------------------------------------------------------

  /**
   * Returns top-level comments with their nested replies.
   * Optionally attaches is_liked for the given user.
   */
  async getComments(postId: string, userId?: string, signal?: AbortSignal): Promise<Comment[]> {
    // Query 1: all top-level comments
    const topQ = supabase
      .from("comments")
      .select("*, profiles!user_id(username, avatar_url)")
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: true });
    const { data: topData, error } = await (signal ? topQ.abortSignal(signal) : topQ);

    if (error) throw new Error(error.message);

    const topLevel = (topData ?? []) as Comment[];
    if (topLevel.length === 0) return [];

    // Query 2: all replies for these comments in one round-trip
    const topLevelIds = topLevel.map((c) => c.id);
    const replyQ = supabase
      .from("comments")
      .select("*, profiles!user_id(username, avatar_url)")
      .in("parent_id", topLevelIds)
      .order("created_at", { ascending: true });
    const { data: replyData } = await (signal ? replyQ.abortSignal(signal) : replyQ);

    // Group replies by parent_id
    const replyMap = new Map<string, Comment[]>();
    for (const reply of (replyData ?? []) as Comment[]) {
      if (!reply.parent_id) continue;
      const bucket = replyMap.get(reply.parent_id) ?? [];
      bucket.push(reply);
      replyMap.set(reply.parent_id, bucket);
    }

    const withReplies = topLevel.map((c) => ({
      ...c,
      replies: replyMap.get(c.id) ?? [],
    }));

    if (!userId) return withReplies;

    // Attach is_liked for all comments + replies in one query
    const allIds = [
      ...topLevelIds,
      ...(replyData ?? []).map((r) => r.id),
    ];
    const likesQ = supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", userId)
      .in("comment_id", allIds);
    const { data: likes } = await (signal ? likesQ.abortSignal(signal) : likesQ);
    const likedSet = new Set((likes ?? []).map((l) => l.comment_id));

    return withReplies.map((c) => ({
      ...c,
      is_liked: likedSet.has(c.id),
      replies: (c.replies ?? []).map((r) => ({
        ...r,
        is_liked: likedSet.has(r.id),
      })),
    }));
  },

  async createComment(
    postId: string,
    userId: string,
    content: string,
    parentId?: string
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_id: parentId ?? null,
      })
      .select("*, profiles!user_id(username, avatar_url)")
      .single();
    if (error) throw new Error(error.message);
    return { ...data, is_liked: false, replies: [] };
  },

  async updateComment(id: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", id)
      .select("*, profiles!user_id(username, avatar_url)")
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async likeComment(commentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_id: userId });
    if (error && error.code !== "23505") throw new Error(error.message);
  },

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  // ---------------------------------------------------------------------------
  // Follows
  // ---------------------------------------------------------------------------
  async follow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: followerId, following_id: followingId });
    if (error && error.code !== "23505") throw new Error(error.message);
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
    if (error) throw new Error(error.message);
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();
    return !!data;
  },

  async getFollowerCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);
    return count ?? 0;
  },

  async getFollowingCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);
    return count ?? 0;
  },

  // ---------------------------------------------------------------------------
  // Bookmarks
  // ---------------------------------------------------------------------------
  async bookmarkPost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("post_bookmarks")
      .insert({ post_id: postId, user_id: userId });
    if (error && error.code !== "23505") throw new Error(error.message);
  },

  async unbookmarkPost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("post_bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  async getBookmarks(userId: string, page = 1, pageSize = 20, signal?: AbortSignal): Promise<PaginatedResult<Post>> {
    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    // 1. Get paginated bookmark IDs ordered by bookmark date
    const bQ = supabase
      .from("post_bookmarks")
      .select("post_id", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    const { data: bRows, error: bErr, count } = await (signal ? bQ.abortSignal(signal) : bQ);

    if (bErr) throw new Error(bErr.message);
    const postIds = (bRows ?? []).map((b) => b.post_id);
    if (postIds.length === 0) {
      return { data: [], count: 0, page, pageSize, hasMore: false };
    }

    // 2. Fetch full post data for those IDs
    const postsQ = supabase
      .from("posts")
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)")
      .in("id", postIds)
      .eq("is_published", true);
    const { data, error } = await (signal ? postsQ.abortSignal(signal) : postsQ);
    if (error) throw new Error(error.message);

    // Re-sort to preserve bookmark order
    const orderMap = new Map(postIds.map((id, i) => [id, i]));
    let posts = ((data ?? []) as Post[]).sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
    );

    // 3. Attach is_liked + mark is_bookmarked = true
    if (posts.length > 0) {
      const likesQ = supabase.from("post_likes").select("post_id").eq("user_id", userId).in("post_id", postIds);
      const { data: likes } = await (signal ? likesQ.abortSignal(signal) : likesQ);
      const likedSet = new Set((likes ?? []).map((l) => l.post_id));
      posts = posts.map((p) => ({ ...p, is_liked: likedSet.has(p.id), is_bookmarked: true }));
    }

    return {
      data: posts,
      count: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    };
  },

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  async getNotifications(userId: string, limit = 30): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*, actor:profiles!actor_id(username, full_name, avatar_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as Notification[];
  },

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    return count ?? 0;
  },

  async markNotificationRead(id: string): Promise<void> {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  },

  // ---------------------------------------------------------------------------
  // Search (server-side full-text search using the GIN index)
  // ---------------------------------------------------------------------------
  async searchPosts(query: string, userId?: string, page = 1, pageSize = 20): Promise<PaginatedResult<Post>> {
    if (!query.trim()) {
      return { data: [], count: 0, page, pageSize, hasMore: false };
    }

    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("posts")
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)", { count: "exact" })
      .eq("is_published", true)
      .ilike("content", `%${query}%`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    let posts = (data ?? []) as Post[];

    if (userId && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const [{ data: likes }, { data: bookmarks }] = await Promise.all([
        supabase.from("post_likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
        supabase.from("post_bookmarks").select("post_id").eq("user_id", userId).in("post_id", postIds),
      ]);
      const likedSet      = new Set((likes      ?? []).map((l) => l.post_id));
      const bookmarkedSet = new Set((bookmarks  ?? []).map((b) => b.post_id));
      posts = posts.map((p) => ({
        ...p,
        is_liked:      likedSet.has(p.id),
        is_bookmarked: bookmarkedSet.has(p.id),
      }));
    }

    return {
      data: posts,
      count: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    };
  },

  async searchUsers(query: string, limit = 10): Promise<UserSearchResult[]> {
    if (!query.trim()) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, is_verified, bio")
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order("full_name", { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as UserSearchResult[];
  },

  // ---------------------------------------------------------------------------
  // Post views (atomic increment via DB function)
  // ---------------------------------------------------------------------------
  async incrementPostView(postId: string): Promise<void> {
    await supabase.rpc("increment_post_view", { p_post_id: postId });
  },

  // ---------------------------------------------------------------------------
  // Realtime subscription
  // ---------------------------------------------------------------------------

  /**
   * Subscribes to new posts inserted into the feed.
   * Returns an unsubscribe function — call it in the component's cleanup.
   */
  subscribeToFeed(onNewPost: (post: Post) => void | Promise<void>): () => void {
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => onNewPost(payload.new as Post)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribes to new notifications for a specific user.
   * Returns an unsubscribe function.
   */
  subscribeToNotifications(userId: string, onNew: () => void): () => void {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => onNew()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
