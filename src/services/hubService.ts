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
    mode: FeedMode = "latest"
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

      const { data, error, count } = await supabase
        .from("following_posts_view")
        .select("*", { count: "exact" })
        .eq("follower_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);

      let posts = (data ?? []) as Post[];
      if (posts.length === 0) return emptyResult;

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

    if (mode === "trending") {
      query = query
        .order("like_count", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    let posts = (data ?? []) as Post[];

    // Attach is_liked + is_bookmarked for the current user
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

  async getPostById(id: string, userId?: string): Promise<Post> {
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);

    if (userId) {
      const [{ data: like }, { data: bookmark }] = await Promise.all([
        supabase.from("post_likes").select("post_id").eq("post_id", id).eq("user_id", userId).maybeSingle(),
        supabase.from("post_bookmarks").select("post_id").eq("post_id", id).eq("user_id", userId).maybeSingle(),
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
      post_type?: Post["post_type"];
      recipe_id?: string;
    }
  ): Promise<Post> {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        content,
        media_urls: options?.media_urls ?? [],
        post_type: options?.post_type ?? "general",
        recipe_id: options?.recipe_id ?? null,
      })
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)")
      .single();
    if (error) throw new Error(error.message);
    return { ...data, is_liked: false };
  },

  /** Updates a post's content and optionally its media_urls. */
  async updatePost(
    id: string,
    content: string,
    media_urls?: string[]
  ): Promise<Post> {
    const updates: Record<string, unknown> = { content };
    if (media_urls !== undefined) updates.media_urls = media_urls;

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
    // Fetch media_urls + user_id before deletion so we can clean up storage
    const { data: post } = await supabase
      .from("posts")
      .select("user_id, media_urls")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);

    // Best-effort storage cleanup — don't block or throw on failure
    if (post?.media_urls?.length) {
      const paths = post.media_urls.map((url: string) => {
        // Extract the storage path from the public URL
        const marker = "/object/public/post-media/";
        const idx = url.indexOf(marker);
        return idx !== -1 ? url.slice(idx + marker.length) : null;
      }).filter(Boolean) as string[];

      if (paths.length) {
        supabase.storage.from("post-media").remove(paths).catch(() => {});
      }
    }
  },

  /**
   * Uploads a media file to the post-media bucket.
   * Path pattern: {userId}/{postId}/{timestamp}.{ext}
   * Returns the public CDN URL.
   */
  async uploadPostMedia(
    userId: string,
    postId: string,
    file: File
  ): Promise<string> {
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds the 50 MB limit.");
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new Error(`File type "${file.type}" is not allowed. Use JPEG, PNG, WebP, GIF, or MP4.`);
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${postId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("post-media")
      .upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("post-media").getPublicUrl(path);
    return data.publicUrl;
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
  async getComments(postId: string, userId?: string): Promise<Comment[]> {
    // Query 1: all top-level comments
    const { data: topData, error } = await supabase
      .from("comments")
      .select("*, profiles!user_id(username, avatar_url)")
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const topLevel = (topData ?? []) as Comment[];
    if (topLevel.length === 0) return [];

    // Query 2: all replies for these comments in one round-trip
    const topLevelIds = topLevel.map((c) => c.id);
    const { data: replyData } = await supabase
      .from("comments")
      .select("*, profiles!user_id(username, avatar_url)")
      .in("parent_id", topLevelIds)
      .order("created_at", { ascending: true });

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
    const { data: likes } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", userId)
      .in("comment_id", allIds);
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

  async getBookmarks(userId: string, page = 1, pageSize = 20): Promise<PaginatedResult<Post>> {
    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    // 1. Get paginated bookmark IDs ordered by bookmark date
    const { data: bRows, error: bErr, count } = await supabase
      .from("post_bookmarks")
      .select("post_id", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (bErr) throw new Error(bErr.message);
    const postIds = (bRows ?? []).map((b) => b.post_id);
    if (postIds.length === 0) {
      return { data: [], count: 0, page, pageSize, hasMore: false };
    }

    // 2. Fetch full post data for those IDs
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles!user_id(username, full_name, avatar_url, is_verified)")
      .in("id", postIds)
      .eq("is_published", true);
    if (error) throw new Error(error.message);

    // Re-sort to preserve bookmark order
    const orderMap = new Map(postIds.map((id, i) => [id, i]));
    let posts = ((data ?? []) as Post[]).sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
    );

    // 3. Attach is_liked + mark is_bookmarked = true
    if (posts.length > 0) {
      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postIds);
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
