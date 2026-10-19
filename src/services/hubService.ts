import { supabase } from "./supabase";
import { uploadWithProgress } from "@/lib/uploadWithProgress";
import { extractRecipeIds } from "@/lib/socialLinks";
import {
  cursorFromLastRow, cursorToRpcArgs, newAsOf, sanitizeSearchTerm,
  type FeedCursor, type FeedMode as CursorFeedMode,
} from "@/lib/socialFeed";
import type { ShareStatus } from "@/lib/socialComposer";
import type { Post, PostType, Comment, Notification, PaginatedResult, UserSearchResult, RecipeSummary } from "@/types";

/** The tabs on /social/feed. "user" (profile pages) is a separate entry point. */
export type FeedMode = Exclude<CursorFeedMode, "user">;

export interface FeedPage {
  data: Post[];
  nextCursor: FeedCursor | null;
  hasMore: boolean;
}

export interface CreatePostInput {
  /** Client-generated so media can be uploaded into the post's folder before
   *  the row exists, and so a retried insert is idempotent. */
  id: string;
  postType: PostType;
  content: string;
  title?: string | null;
  reviewSubject?: string | null;
  rating?: number | null;
  recipeId?: string | null;
  media?: { url: string; public_id: string }[];
}

export interface RecipeShareStatus {
  points: number;
  without_photo: ShareStatus;
  with_photo: ShareStatus;
}

export interface UploadedMedia {
  url: string;
  public_id: string;
  kind: "image" | "video";
}

/**
 * A message that is safe and useful to show the user as-is: the database's own
 * validation messages (validate_post), which are written for people.
 */
export class PostValidationError extends Error {}

const POST_SELECT = "*, profiles!user_id(username, full_name, avatar_url, is_verified, profile_flair)";
const RECIPE_SUMMARY_SELECT =
  "id, user_id, title, description, image_url, cuisine, difficulty, prep_time_mins, cook_time_mins, servings, ingredients, is_ai_generated, is_published";

/** Constraint names mapped to copy, for the CHECKs that fire before the trigger. */
const CONSTRAINT_COPY: Record<string, string> = {
  posts_content_length: "That post is too long. Keep it under 5,000 characters.",
  posts_title_length: "Your question needs between 10 and 200 characters.",
  posts_rating_range: "Choose a rating from 1 to 5 stars.",
  posts_review_subject_length: "Say what you're reviewing in 2 to 120 characters.",
  posts_media_count: "A post can have up to 4 photos.",
};

function toPostError(error: { code?: string; message: string }): Error {
  if (error.code === "23514") {
    const constraint = Object.keys(CONSTRAINT_COPY).find((k) => error.message.includes(k));
    return new PostValidationError(constraint ? CONSTRAINT_COPY[constraint] : error.message);
  }
  return new Error(error.message);
}

type RecipeRow = {
  id: string; user_id: string; title: string; description: string | null; image_url: string | null;
  cuisine: string | null; difficulty: string | null; prep_time_mins: number | null; cook_time_mins: number | null;
  servings: number | null; ingredients: unknown; is_ai_generated: boolean; is_published: boolean;
};

export function toRecipeSummary(r: RecipeRow): RecipeSummary {
  const list = Array.isArray(r.ingredients) ? (r.ingredients as unknown[]) : [];
  const names = list
    .map((i) => (typeof i === "string" ? i : (i as { name?: unknown })?.name))
    .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
    .map((n) => n.trim());
  return {
    id: r.id, user_id: r.user_id, title: r.title, description: r.description, image_url: r.image_url,
    cuisine: r.cuisine, difficulty: r.difficulty, prep_time_mins: r.prep_time_mins, cook_time_mins: r.cook_time_mins,
    servings: r.servings, is_ai_generated: r.is_ai_generated, is_published: r.is_published,
    ingredient_names: names.slice(0, 6), ingredient_count: names.length,
  };
}

type FeedRow = Post & { sort_ts: string | null; sort_score: number | null };

/** The RPC's sort keys are for the cursor only; they don't belong on a Post. */
function stripSortKeys(row: FeedRow): Post {
  const post: Partial<FeedRow> = { ...row };
  delete post.sort_ts;
  delete post.sort_score;
  return post as Post;
}

export const hubService = {
  // ---------------------------------------------------------------------------
  // Feed
  // ---------------------------------------------------------------------------

  /**
   * One page of a feed, via get_social_feed (075_social_posts_v2.sql).
   * Pass the previous page's `nextCursor` to continue; omit it for page one.
   * like/bookmark state, author profile and recipe cards come back attached.
   */
  async getFeedPage(opts: {
    mode: CursorFeedMode;
    cursor?: FeedCursor | null;
    limit?: number;
    postType?: string | null;
    authorId?: string | null;
    signal?: AbortSignal;
  }): Promise<FeedPage> {
    const { mode, cursor, limit = 20, postType, authorId, signal } = opts;
    // for_you pins "now" on page one and carries it in the cursor, so every page
    // is scored against the same moment.
    const asOf = cursor?.asOf ?? newAsOf(mode);

    const q = supabase.rpc("get_social_feed", {
      p_mode: mode,
      p_limit: limit,
      p_post_type: postType ?? null,
      p_author_id: authorId ?? null,
      ...cursorToRpcArgs(cursor),
      p_as_of: asOf,
    });
    const { data, error } = await (signal ? q.abortSignal(signal) : q);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as FeedRow[];
    const posts = await this.attachRecipes(rows.map(stripSortKeys), signal);
    const last = rows[rows.length - 1];
    return {
      data: posts,
      hasMore: rows.length === limit,
      nextCursor: last ? cursorFromLastRow(mode, last, asOf) : null,
    };
  },

  /**
   * Resolves recipe cards for a batch of posts in one query: the attached
   * recipe on recipe posts, plus the first HalalMe recipe linked in the text
   * (link preview). RLS decides visibility, so a deleted or private recipe just
   * comes back missing and the card shows as unavailable.
   */
  async attachRecipes(posts: Post[], signal?: AbortSignal): Promise<Post[]> {
    if (posts.length === 0) return posts;
    const host = typeof window !== "undefined" ? window.location.host : undefined;
    const linked = new Map<string, string>();
    const ids = new Set<string>();
    for (const p of posts) {
      if (p.recipe_id) ids.add(p.recipe_id);
      const first = extractRecipeIds(p.content, host).find((id) => id !== p.recipe_id);
      if (first) { linked.set(p.id, first); ids.add(first); }
    }
    if (ids.size === 0) return posts.map((p) => ({ ...p, recipe: null, linked_recipe: null }));

    const q = supabase.from("recipes").select(RECIPE_SUMMARY_SELECT).in("id", [...ids]);
    const { data } = await (signal ? q.abortSignal(signal) : q);
    const byId = new Map(((data ?? []) as RecipeRow[]).map((r) => [r.id, toRecipeSummary(r)]));

    return posts.map((p) => ({
      ...p,
      recipe: p.recipe_id ? byId.get(p.recipe_id) ?? null : null,
      linked_recipe: linked.has(p.id) ? byId.get(linked.get(p.id)!) ?? null : null,
    }));
  },

  async getPostById(id: string, userId?: string, signal?: AbortSignal): Promise<Post> {
    // .abortSignal() must be called before .single() / .maybeSingle() because
    // those terminal qualifiers downcast to PostgrestBuilder which lacks the method.
    const postQ = supabase.from("posts").select(POST_SELECT).eq("id", id);
    const { data, error } = await (signal ? postQ.abortSignal(signal).single() : postQ.single());
    if (error) throw new Error(error.message);

    let post = data as Post;
    if (userId) {
      const likeQ     = supabase.from("post_likes").select("post_id").eq("post_id", id).eq("user_id", userId);
      const bookmarkQ = supabase.from("post_bookmarks").select("post_id").eq("post_id", id).eq("user_id", userId);
      const [{ data: like }, { data: bookmark }] = await Promise.all([
        signal ? likeQ.abortSignal(signal).maybeSingle() : likeQ.maybeSingle(),
        signal ? bookmarkQ.abortSignal(signal).maybeSingle() : bookmarkQ.maybeSingle(),
      ]);
      post = { ...post, is_liked: !!like, is_bookmarked: !!bookmark };
    }

    const [withRecipes] = await this.attachRecipes([post], signal);
    return withRecipes;
  },

  /**
   * Inserts a fully-formed post in one statement: media is uploaded first (into
   * the post's own folder, using the client-generated id), so a post never
   * exists half-made and never earns points before its photos are attached.
   *
   * Idempotent on `input.id`: if a slow network makes the caller retry an
   * insert that actually landed, the duplicate-key error returns the original.
   */
  async createPost(userId: string, input: CreatePostInput): Promise<Post> {
    const row = {
      id: input.id,
      user_id: userId,
      post_type: input.postType,
      content: input.content,
      title: input.postType === "question" ? input.title?.trim() || null : null,
      review_subject: input.postType === "review" ? input.reviewSubject?.trim() || null : null,
      rating: input.postType === "review" ? input.rating ?? null : null,
      recipe_id: input.postType === "recipe" ? input.recipeId ?? null : null,
      media_urls: (input.media ?? []).map((m) => m.url),
      media_public_ids: (input.media ?? []).map((m) => m.public_id),
    };

    const { data, error } = await supabase.from("posts").insert(row).select(POST_SELECT).single();
    if (error) {
      if (error.code === "23505") return this.getPostById(input.id, userId);
      throw toPostError(error);
    }
    const [withRecipes] = await this.attachRecipes([{ ...(data as Post), is_liked: false, is_bookmarked: false }]);
    return withRecipes;
  },

  /** Updates a post's text (and, for questions, the question itself). */
  async updatePost(id: string, changes: { content: string; title?: string | null }): Promise<Post> {
    const updates: Record<string, unknown> = { content: changes.content };
    if (changes.title !== undefined) updates.title = changes.title;

    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select(POST_SELECT)
      .single();
    if (error) throw toPostError(error);
    return data as Post;
  },

  /** Question owner marks (or clears) the accepted answer. */
  async setAcceptedAnswer(postId: string, commentId: string | null): Promise<void> {
    const { data, error } = await supabase
      .from("posts")
      .update({ accepted_comment_id: commentId })
      .eq("id", postId)
      .select("id");
    if (error) throw toPostError(error);
    if (!data || data.length === 0) throw new Error("Only the person who asked can choose the answer.");
  },

  async deletePost(id: string): Promise<void> {
    const { data: post } = await supabase
      .from("posts")
      .select("media_public_ids, media_urls")
      .eq("id", id)
      .single();

    // .select() forces PostgREST to return the deleted row(s) (Prefer:
    // return=representation) instead of a bare 204. Postgres/Supabase
    // returns on success whether a row was actually deleted or the delete
    // silently matched zero rows (RLS block, already-gone id, etc). Without
    // this, a no-op delete looks identical to a real one and the caller's
    // optimistic UI removal never gets reverted.
    const { data: deleted, error } = await supabase.from("posts").delete().eq("id", id).select("id");
    if (error) throw new Error(error.message);
    if (!deleted || deleted.length === 0) throw new Error("Post could not be deleted");

    if (post?.media_public_ids?.length) {
      this.deleteUploadedMedia(post.media_public_ids, post.media_urls ?? []);
    }
  },

  /**
   * Best-effort Cloudinary cleanup, fire-and-forget. media_urls rides along so
   * the API can delete videos with the correct resource_type (otherwise videos
   * would orphan and eat the Cloudinary quota). /api/upload/delete only removes
   * ids under the caller's own folder.
   */
  deleteUploadedMedia(publicIds: string[], mediaUrls: string[]): void {
    if (publicIds.length === 0) return;
    fetch("/api/upload/delete", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ public_ids: publicIds, media_urls: mediaUrls }),
      keepalive: true,
    }).catch(() => {});
  },

  /**
   * Uploads one media file to Cloudinary using a server-issued signature.
   *
   * The bytes go browser → Cloudinary directly, because Vercel caps a function
   * body at 4.5 MB and video here can reach 50 MB. /api/upload/sign checks the
   * session and builds the destination folder (halalme/posts/{userId}/{postId})
   * from the session user id, so an upload cannot be anonymous or aimed at
   * another user's folder. validate_post() then only accepts media from that
   * exact folder on the post's own row.
   *
   * File type/size checks are in socialComposer (fast feedback); this is the
   * transport only. Pass `signal` to cancel.
   */
  async uploadPostMedia(
    postId: string,
    file: File,
    opts: { onProgress?: (percent: number) => void; signal?: AbortSignal } = {},
  ): Promise<UploadedMedia> {
    const signRes = await fetch("/api/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
      signal: opts.signal,
    });
    if (!signRes.ok) {
      const { error } = await signRes.json().catch(() => ({ error: null }));
      throw new Error(signRes.status === 429
        ? "You've uploaded a lot in the last hour. Please try again a little later."
        : error ?? "Could not authorise the upload. Please try again.");
    }
    const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json() as {
      signature: string; timestamp: number; folder: string; apiKey: string; cloudName: string;
    };

    const kind = file.type.startsWith("video/") ? "video" : "image";

    // Every signed param must be sent back exactly as signed, or Cloudinary
    // rejects the upload.
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const data = await uploadWithProgress<{ secure_url?: string; public_id?: string; error?: { message?: string } }>(
      `https://api.cloudinary.com/v1_1/${cloudName}/${kind}/upload`,
      form,
      opts.onProgress,
      opts.signal,
    );

    if (!data.secure_url || !data.public_id) {
      throw new Error(data.error?.message ?? "Upload failed");
    }
    return { url: data.secure_url, public_id: data.public_id, kind };
  },

  /** First page of a user's posts, for the server-rendered profile page. */
  async getUserPosts(userId: string): Promise<Post[]> {
    const page = await this.getFeedPage({ mode: "user", authorId: userId, limit: 10 });
    return page.data;
  },

  async getUserPostCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_published", true)
      .is("deleted_at", null);
    return count ?? 0;
  },

  /**
   * Fetches a user's public profile data, for the /social/u/[handle] page.
   * `handle` is whatever profileHref() put in the URL: a username, or a
   * raw user id when the caller didn't have a username on hand. Usernames
   * are lowercase letters/numbers/underscores only (see validateUsername in
   * complete-profile), so they can never collide with a UUID, and detecting
   * which one we got is a plain shape check.
   */
  async getProfileByHandle(handle: string): Promise<{
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
    profile_flair: string | null;
    bio: string | null;
    created_at: string;
  } | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(handle);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, is_verified, profile_flair, bio, created_at")
      .eq(isUuid ? "id" : "username", handle)
      .maybeSingle();
    return data ?? null;
  },

  // ---------------------------------------------------------------------------
  // Recipe sharing
  // ---------------------------------------------------------------------------

  /**
   * Recipes the composer's picker offers: the user's own (drafts included, since
   * an Assistant recipe starts life as a draft) and published Kitchen recipes
   * matching `query`.
   */
  async getShareableRecipes(userId: string, query: string, signal?: AbortSignal): Promise<{ own: RecipeSummary[]; community: RecipeSummary[] }> {
    const term = sanitizeSearchTerm(query);
    let ownQ = supabase.from("recipes").select(RECIPE_SUMMARY_SELECT)
      .eq("user_id", userId).is("deleted_at", null)
      .order("updated_at", { ascending: false }).limit(12);
    let communityQ = supabase.from("recipes").select(RECIPE_SUMMARY_SELECT)
      .eq("is_published", true).is("deleted_at", null).neq("user_id", userId)
      .order("created_at", { ascending: false }).limit(12);
    if (term) {
      ownQ = ownQ.ilike("title", `%${term}%`);
      communityQ = communityQ.ilike("title", `%${term}%`);
    }
    const [own, community] = await Promise.all([
      signal ? ownQ.abortSignal(signal) : ownQ,
      // Without a search term, only the user's own list is useful; the whole
      // catalogue would just be noise.
      term ? (signal ? communityQ.abortSignal(signal) : communityQ) : Promise.resolve({ data: [], error: null }),
    ]);
    if (own.error) throw new Error(own.error.message);
    return {
      own: ((own.data ?? []) as RecipeRow[]).map(toRecipeSummary),
      community: ((community.data ?? []) as RecipeRow[]).map(toRecipeSummary),
    };
  },

  async getRecipeSummary(recipeId: string): Promise<RecipeSummary | null> {
    const { data } = await supabase.from("recipes").select(RECIPE_SUMMARY_SELECT).eq("id", recipeId).maybeSingle();
    return data ? toRecipeSummary(data as RecipeRow) : null;
  },

  /** What sharing this recipe would earn, evaluated server-side for the caller. */
  async getRecipeShareStatus(recipeId: string, signal?: AbortSignal): Promise<RecipeShareStatus | null> {
    const q = supabase.rpc("get_recipe_share_status", { p_recipe_id: recipeId });
    const { data, error } = await (signal ? q.abortSignal(signal) : q);
    if (error) return null;
    return data as RecipeShareStatus;
  },

  /** Points actually granted for sharing `recipeId` (the post trigger awards them). */
  async getRecipeSharePointsAwarded(userId: string, recipeId: string): Promise<number> {
    const { data } = await supabase
      .from("reward_transactions")
      .select("points")
      .eq("user_id", userId)
      .eq("action", "recipe_share")
      .eq("reference_id", recipeId);
    return (data ?? []).reduce((sum, r) => sum + (r.points ?? 0), 0);
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
      .select("*, profiles!user_id(username, avatar_url, profile_flair)")
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
      .select("*, profiles!user_id(username, avatar_url, profile_flair)")
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
      .select("*, profiles!user_id(username, avatar_url, profile_flair)")
      .single();
    if (error) throw new Error(error.message);
    return { ...data, is_liked: false, replies: [] };
  },

  async updateComment(id: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", id)
      .select("*, profiles!user_id(username, avatar_url, profile_flair)")
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteComment(id: string): Promise<void> {
    const { data, error } = await supabase.from("comments").delete().eq("id", id).select("id");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("Comment could not be deleted");
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
  // Bookmarks (reads go through getFeedPage({ mode: "saved" }))
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
  // Search
  // ---------------------------------------------------------------------------
  /** Matches post text, question titles and review subjects. */
  async searchPosts(query: string, userId?: string, page = 1, pageSize = 20): Promise<PaginatedResult<Post>> {
    const term = sanitizeSearchTerm(query);
    if (!term) {
      return { data: [], count: 0, page, pageSize, hasMore: false };
    }

    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;
    const like = `%${term}%`;

    const { data, error, count } = await supabase
      .from("posts")
      .select(POST_SELECT, { count: "exact" })
      .eq("is_published", true)
      .or(`content.ilike.${like},title.ilike.${like},review_subject.ilike.${like}`)
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
      data: await this.attachRecipes(posts),
      count: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    };
  },

  async searchUsers(query: string, limit = 10): Promise<UserSearchResult[]> {
    const term = sanitizeSearchTerm(query);
    if (!term) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, is_verified, bio, profile_flair")
      .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
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
   * Returns an unsubscribe function. Call it in the component's cleanup.
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
