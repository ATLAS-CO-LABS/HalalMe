"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cldUrl, CLD_POST_IMG, isVideoUrl, cldVideoUrl, cldVideoPoster } from "@/lib/cldUrl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  BadgeCheck,
  ChefHat,
  Send,
  Loader2,
  AlertCircle,
  CornerDownRight,
  Trash2,
  Flag,
} from "lucide-react";
import type { Post, Comment } from "@/types";
import { hubService } from "@/services/hubService";
import ReportModal from "@/components/common/ReportModal";
import { withTimeout, TimeoutError } from "@/lib/withTimeout";
import { useAuth } from "@/hooks/useAuth";
import { useResumeKey } from "@/context/AppResumeContext";
import AuthGuard from "@/components/auth/AuthGuard";
import { formatRelativeTime } from "@/lib/relativeTime";
import Avatar from "@/components/hub/Avatar";

const BG = "var(--hub-bg)";
const BG2 = "var(--hub-bg2)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <PostDetailContent id={id} />
    </AuthGuard>
  );
}

function PostDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const resumeKey = useResumeKey();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monotonically-incrementing request counter - same pattern as the feed page.
  // Must live outside the effect so successive effect runs share the same ref.
  const requestIdRef = useRef(0);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; id: string } | null>(null);

  // ---------------------------------------------------------------------------
  // Load post + comments
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // AbortController - cancels the network request when the effect re-runs
    // (resumeKey, id, user change) or the component unmounts so Chrome does not
    // leave a throttled/stale connection open.
    const controller = new AbortController();
    const { signal } = controller;

    // Request identity - primary guard for all state updates.
    // Each effect run gets a new ID; only the run whose ID still matches
    // requestIdRef.current at the time it tries to write state is allowed to.
    const requestId = ++requestIdRef.current;

    const loadPost = async () => {
      setIsLoading(true);
      const attempt = () => withTimeout(hubService.getPostById(id, user?.id, signal), 10_000);
      try {
        let data;
        try {
          data = await attempt();
        } catch (err) {
          if (!(err instanceof TimeoutError)) throw err;
          await new Promise<void>((r) => setTimeout(r, 1_000));
          if (requestId !== requestIdRef.current) return;
          data = await attempt();
        }
        if (requestId !== requestIdRef.current) return;
        setPost(data);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError("Post not found.");
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    };

    const loadComments = async () => {
      setIsCommentsLoading(true);
      const attempt = () => withTimeout(hubService.getComments(id, user?.id, signal), 10_000);
      try {
        let data;
        try {
          data = await attempt();
        } catch (err) {
          if (!(err instanceof TimeoutError)) throw err;
          await new Promise<void>((r) => setTimeout(r, 1_000));
          if (requestId !== requestIdRef.current) return;
          data = await attempt();
        }
        if (requestId !== requestIdRef.current) return;
        setComments(data);
      } catch {
        // non-critical - silently ignore
      } finally {
        if (requestId === requestIdRef.current) setIsCommentsLoading(false);
      }
    };

    loadPost();
    loadComments();

    return () => {
      controller.abort();
    };
  // resumeKey causes the effect to re-run when the app resumes after a tab
  // switch.  This aborts any in-flight requests that Chrome throttled or
  // dropped while the tab was hidden and starts fresh fetches on a live
  // connection.  user?.id (not user) avoids re-running on token refreshes
  // that produce a new Profile object with the same id.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id, resumeKey]);

  // Increment view count once per mount - separate effect so it never re-fires
  // when the user auth state changes (which would overcount).
  useEffect(() => {
    hubService.incrementPostView(id).catch(() => {});
  }, [id]);

  // ---------------------------------------------------------------------------
  // Like post (optimistic)
  // ---------------------------------------------------------------------------
  const handleLikePost = async () => {
    if (!user || !post) return;
    const wasLiked = !!post.is_liked;

    setPost((prev) =>
      prev
        ? { ...prev, is_liked: !wasLiked, like_count: wasLiked ? prev.like_count - 1 : prev.like_count + 1 }
        : prev
    );

    try {
      if (wasLiked) {
        await hubService.unlikePost(post.id, user.id);
      } else {
        await hubService.likePost(post.id, user.id);
      }
    } catch {
      // Revert
      setPost((prev) =>
        prev
          ? { ...prev, is_liked: wasLiked, like_count: wasLiked ? prev.like_count + 1 : prev.like_count - 1 }
          : prev
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Like comment (optimistic)
  // ---------------------------------------------------------------------------
  const handleLikeComment = useCallback(async (commentId: string, _parentId: string | null, wasLiked: boolean) => {
    if (!user) return;

    const toggle = (c: Comment): Comment => {
      if (c.id !== commentId) {
        return { ...c, replies: (c.replies ?? []).map(toggle) };
      }
      return { ...c, is_liked: !wasLiked, like_count: wasLiked ? c.like_count - 1 : c.like_count + 1 };
    };
    setComments((prev) => prev.map(toggle));

    try {
      if (wasLiked) {
        await hubService.unlikeComment(commentId, user.id);
      } else {
        await hubService.likeComment(commentId, user.id);
      }
    } catch {
      // Revert
      const revert = (c: Comment): Comment => {
        if (c.id !== commentId) {
          return { ...c, replies: (c.replies ?? []).map(revert) };
        }
        return { ...c, is_liked: wasLiked, like_count: wasLiked ? c.like_count + 1 : c.like_count - 1 };
      };
      setComments((prev) => prev.map(revert));
    }
  }, [user]);

  // ---------------------------------------------------------------------------
  // Submit comment / reply
  // ---------------------------------------------------------------------------
  const handleAddComment = async () => {
    if (!user || !newComment.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);

    try {
      const created = await hubService.createComment(
        id,
        user.id,
        newComment.trim(),
        replyingTo?.id
      );

      const withProfile: Comment = {
        ...created,
        profiles: { username: user.username, avatar_url: user.avatar_url },
      };

      if (replyingTo) {
        // Append reply under its parent
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.id
              ? { ...c, replies: [...(c.replies ?? []), withProfile] }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, withProfile]);
        setPost((prev) =>
          prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev
        );
      }

      setNewComment("");
      setReplyingTo(null);
    } catch {
      // silent - user sees the button re-enable
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Share
  // ---------------------------------------------------------------------------
  const handleShare = async () => {
    const url = `${window.location.origin}/hub/post/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback - no-op
    }
  };

  // ---------------------------------------------------------------------------
  // Delete comment
  // ---------------------------------------------------------------------------
  const handleDeleteComment = useCallback(async (commentId: string, parentId: string | null) => {
    if (parentId) {
      setComments((prev) =>
        prev.map((c) => ({
          ...c,
          replies: (c.replies ?? []).filter((r) => r.id !== commentId),
        }))
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost((prev) =>
        prev ? { ...prev, comment_count: Math.max(0, prev.comment_count - 1) } : prev
      );
    }
    await hubService.deleteComment(commentId).catch(() => {});
  }, []);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={isReply ? "ml-10 mt-3" : ""}>
      <div className="flex items-start gap-3">
        <Avatar
          src={comment.profiles?.avatar_url ?? undefined}
          alt={comment.profiles?.username ?? "User"}
          size={isReply ? "sm" : "md"}
          flair={comment.profiles?.profile_flair}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="font-extrabold text-sm"
              style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
            >
              {comment.profiles?.username ?? "Unknown"}
            </span>
            <span
              className="text-xs font-normal"
              style={{ color: `color-mix(in oklab, var(--hm-text) 21%, var(--hm-lm-anchor))`, fontFamily: "var(--font-body)" }}
            >
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          <p
            className="text-sm mb-2 font-normal"
            style={{ color: `color-mix(in oklab, var(--hm-text) 50%, var(--hm-lm-anchor))`, fontFamily: "var(--font-body)" }}
          >
            {comment.content}
          </p>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => handleLikeComment(comment.id, comment.parent_id, !!comment.is_liked)}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: comment.is_liked ? "#EF4444" : `color-mix(in oklab, var(--hm-text) 21%, transparent)` }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`w-3.5 h-3.5 ${comment.is_liked ? "fill-red-500" : ""}`} />
              {comment.like_count > 0 && (
                <span className="font-semibold">{comment.like_count}</span>
              )}
            </motion.button>

            {!isReply && (
              <button
                onClick={() =>
                  setReplyingTo(
                    replyingTo?.id === comment.id
                      ? null
                      : { id: comment.id, username: comment.profiles?.username ?? "user" }
                  )
                }
                className="text-xs transition-colors font-semibold flex items-center gap-1"
                style={{ color: `color-mix(in oklab, var(--hm-text) 21%, var(--hm-lm-anchor))` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = AMBER)}
                onMouseLeave={(e) => (e.currentTarget.style.color = `color-mix(in oklab, var(--hm-text) 21%, transparent)`)}
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>
            )}
            {user?.id === comment.user_id ? (
              <button
                onClick={() => handleDeleteComment(comment.id, comment.parent_id)}
                aria-label="Delete comment"
                className="text-xs transition-colors flex items-center gap-1"
                style={{ color: `color-mix(in oklab, var(--hm-text) 15%, var(--hm-lm-anchor))` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F87171")}
                onMouseLeave={(e) => (e.currentTarget.style.color = `color-mix(in oklab, var(--hm-text) 15%, transparent)`)}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => setReportTarget({ type: "comment", id: comment.id })}
                aria-label="Report comment"
                className="text-xs transition-colors flex items-center gap-1"
                style={{ color: `color-mix(in oklab, var(--hm-text) 15%, var(--hm-lm-anchor))` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F87171")}
                onMouseLeave={(e) => (e.currentTarget.style.color = `color-mix(in oklab, var(--hm-text) 15%, transparent)`)}
              >
                <Flag className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {!isReply && (comment.replies ?? []).length > 0 && (
        <div className="mt-3 space-y-3 pl-4 ml-6" style={{ borderLeft: `2px solid color-mix(in oklab, var(--hm-amber) 13%, transparent)` }}>
          {(comment.replies ?? []).map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: BG }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: AMBER }} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto" style={{ color: `color-mix(in oklab, var(--hm-text) 19%, var(--hm-lm-anchor))` }} />
          <h2 className="text-2xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
            Post not found
          </h2>
          <Link href="/hub/feed">
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

  const isRecipePost = post.post_type === "recipe";
  const displayName = post.profiles?.full_name ?? post.profiles?.username ?? "Unknown";
  const username = post.profiles?.username ? `@${post.profiles.username}` : null;
  const isVerified = post.profiles?.is_verified ?? false;
  const firstMedia = post.media_urls?.[0] ?? null;
  const mediaIsVideo = isVideoUrl(firstMedia);
  const firstImage = !mediaIsVideo ? (cldUrl(firstMedia, CLD_POST_IMG) ?? null) : null;
  const videoSrc = mediaIsVideo ? (cldVideoUrl(firstMedia) ?? null) : null;
  const videoPoster = mediaIsVideo ? cldVideoPoster(firstMedia) : undefined;

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: BG }}>
      {/* Header - sticky top-16 to sit below the fixed app header; solid bg (no blur) avoids scroll-repaint tearing */}
      <div className="border-b sticky top-16 z-40" style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center gap-3 md:gap-4">
              <motion.button
                onClick={() => router.back()}
                className="transition-colors"
                style={{ color: `color-mix(in oklab, var(--hm-text) 31%, var(--hm-lm-anchor))` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                onMouseLeave={(e) => (e.currentTarget.style.color = `color-mix(in oklab, var(--hm-text) 31%, transparent)`)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
            <h1
              className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter"
              style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
            >
              Post
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-8">

        {/* Post card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden mb-6 border"
          style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}
        >
          {/* User Info */}
          <div className="p-4 md:p-5 flex items-center gap-3">
            <Avatar src={post.profiles?.avatar_url ?? undefined} alt={displayName} size="lg" flair={post.profiles?.profile_flair} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="font-extrabold text-base truncate"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  {displayName}
                </h3>
                {isVerified && (
                  <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: AMBER }} />
                )}
              </div>
              <p
                className="text-sm font-normal"
                style={{ color: `color-mix(in oklab, var(--hm-text) 27%, var(--hm-lm-anchor))`, fontFamily: "var(--font-body)" }}
              >
                {username && <span>{username} • </span>}
                {formatRelativeTime(post.created_at)}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 md:px-5 pb-4">
            <p
              className="text-lg leading-relaxed font-normal"
              style={{ color: CREAM, fontFamily: "var(--font-body)" }}
            >
              {post.content}
            </p>
          </div>

          {/* Recipe badge */}
          {isRecipePost && post.recipe_id && (
            <div className="px-4 md:px-5 pb-4">
              <Link href={`/kitchen/recipes/${post.recipe_id}`}>
                <motion.div
                  className="p-4 border transition-colors cursor-pointer"
                  style={{ backgroundColor: `color-mix(in oklab, var(--hm-amber) 7%, transparent)`, borderColor: `color-mix(in oklab, var(--hm-amber) 19%, transparent)` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = AMBER)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = `color-mix(in oklab, var(--hm-amber) 19%, transparent)`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 shrink-0" style={{ backgroundColor: AMBER }}>
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: AMBER }}>
                        Recipe
                      </p>
                      <p className="font-normal text-sm" style={{ color: CREAM, fontFamily: "var(--font-body)" }}>
                        View linked recipe in Kitchen
                      </p>
                    </div>
                    <span className="text-sm font-semibold shrink-0" style={{ color: AMBER }}>View →</span>
                  </div>
                </motion.div>
              </Link>
            </div>
          )}

          {/* Media — video plays inline; image shows uncropped at natural aspect */}
          {videoSrc ? (
            <div className="w-full bg-black flex items-center justify-center">
              <video
                src={videoSrc}
                poster={videoPoster}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-[80vh] object-contain bg-black"
              />
            </div>
          ) : firstImage ? (
            <a href={firstImage} target="_blank" rel="noopener noreferrer" className="block">
              <div className="relative w-full flex items-center justify-center cursor-zoom-in overflow-hidden group" style={{ backgroundColor: BG }}>
                <Image
                  src={firstImage}
                  alt="Post image"
                  width={0}
                  height={0}
                  sizes="100vw"
                  unoptimized
                  className="w-full h-auto max-h-[80vh] object-contain group-hover:opacity-95 transition-opacity duration-300"
                />
                {(post.media_urls?.length ?? 0) > 1 && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1">
                    1/{post.media_urls!.length}
                  </div>
                )}
              </div>
            </a>
          ) : null}

          {/* Actions */}
          <div className="p-4 md:p-5 border-t" style={{ borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <motion.button
                  onClick={handleLikePost}
                  className="flex items-center gap-2 transition-colors"
                  style={{ color: post.is_liked ? "#EF4444" : `color-mix(in oklab, var(--hm-text) 27%, transparent)` }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-6 h-6 ${post.is_liked ? "fill-red-500" : ""}`} />
                  <span className="text-base font-semibold">{post.like_count}</span>
                </motion.button>

                <div className="flex items-center gap-2" style={{ color: `color-mix(in oklab, var(--hm-text) 27%, var(--hm-lm-anchor))` }}>
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-base font-semibold">{post.comment_count}</span>
                </div>

                <div className="flex items-center gap-2" style={{ color: `color-mix(in oklab, var(--hm-text) 19%, var(--hm-lm-anchor))` }}>
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-semibold">{post.view_count}</span>
                </div>
              </div>

              <motion.button
                onClick={handleShare}
                className="transition-colors"
                style={{ color: `color-mix(in oklab, var(--hm-text) 27%, var(--hm-lm-anchor))` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = AMBER)}
                onMouseLeave={(e) => (e.currentTarget.style.color = `color-mix(in oklab, var(--hm-text) 27%, transparent)`)}
                title="Copy link"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Comments section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden border"
          style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}
        >
          {/* Add comment / reply input */}
          <div className="p-4 md:p-5 border-b" style={{ borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between mb-2 px-1"
                >
                  <span className="text-xs font-semibold" style={{ color: AMBER }}>
                    Replying to @{replyingTo.username}
                  </span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="transition-colors"
                    style={{ color: `color-mix(in oklab, var(--hm-text) 21%, var(--hm-lm-anchor))` }}
                  >
                    <span className="text-xs">Cancel</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-start gap-3">
              <Avatar src={user?.avatar_url ?? undefined} alt={user?.full_name ?? "You"} size="md" flair={user?.profile_flair} />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                  placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Write a comment..."}
                  className="flex-1 text-base px-4 py-2.5 border focus:outline-none font-normal transition-colors"
                  style={{ backgroundColor: BG, borderColor: `color-mix(in oklab, var(--hm-text) 8%, transparent)`, color: CREAM, caretColor: AMBER }}
                  onFocus={(e) => (e.target.style.borderColor = AMBER)}
                  onBlur={(e) => (e.target.style.borderColor = `color-mix(in oklab, var(--hm-text) 8%, transparent)`)}
                  disabled={isSubmittingComment}
                />
                <motion.button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="p-2.5 shrink-0"
                  style={
                    newComment.trim() && !isSubmittingComment
                      ? { backgroundColor: AMBER, color: BG }
                      : { backgroundColor: BG, color: `color-mix(in oklab, var(--hm-text) 19%, var(--hm-lm-anchor))`, border: `1px solid color-mix(in oklab, var(--hm-text) 6%, transparent)` }
                  }
                  whileHover={newComment.trim() && !isSubmittingComment ? { scale: 1.1 } : {}}
                  whileTap={newComment.trim() && !isSubmittingComment ? { scale: 0.9 } : {}}
                >
                  {isSubmittingComment
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Send className="w-5 h-5" />
                  }
                </motion.button>
              </div>
            </div>
          </div>

          {/* Comments list */}
          <div>
            {isCommentsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: AMBER }} />
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: `color-mix(in oklab, var(--hm-amber) 19%, var(--hm-lm-anchor))` }} />
                <p className="font-normal" style={{ color: `color-mix(in oklab, var(--hm-text) 27%, var(--hm-lm-anchor))`, fontFamily: "var(--font-body)" }}>
                  No comments yet. Be the first to comment!
                </p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-4 md:p-5"
                  style={index > 0 ? { borderTop: `1px solid color-mix(in oklab, var(--hm-text) 6%, transparent)` } : undefined}
                >
                  {renderComment(comment)}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <ReportModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        contentType={reportTarget?.type ?? "comment"}
        contentId={reportTarget?.id ?? ""}
        contentLabel={reportTarget?.type === "post" ? "post" : "comment"}
      />
    </div>
  );
}
