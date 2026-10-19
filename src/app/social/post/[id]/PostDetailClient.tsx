"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Heart, MessageCircle, Share2, Eye, BadgeCheck, Send, Loader2, AlertCircle,
  CornerDownRight, Trash2, Flag, Check, CheckCircle2, Bookmark,
} from "lucide-react";
import type { Post, Comment } from "@/types";
import { hubService } from "@/services/hubService";
import ReportModal from "@/components/common/ReportModal";
import { withTimeout, TimeoutError } from "@/lib/withTimeout";
import { friendlyError } from "@/lib/friendlyError";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useResumeKey } from "@/context/AppResumeContext";
import { formatRelativeTime } from "@/lib/relativeTime";
import Avatar from "@/components/hub/Avatar";
import ProfileLink from "@/components/hub/ProfileLink";
import PostBody from "@/components/hub/PostBody";
import RichText from "@/components/hub/RichText";
import { TYPE_BADGE, sharePostLink } from "@/components/hub/PostCard";

const BG = "var(--hub-bg)";
const BG2 = "var(--hub-bg2)";
const AMBER = "var(--hm-amber)";
const CREAM = "var(--hm-text)";
const MUTED = "var(--hm-text-muted)";
const SUBTLE = "var(--hm-text-subtle)";
const DIVIDER = "color-mix(in oklab, var(--hm-text) 6%, transparent)";
const GREEN = "#4ADE80";

const COMMENT_MAX = 2000;

interface PostDetailClientProps {
  id: string;
  initialPost: Post | null;
  initialComments: Comment[];
}

// Publicly viewable (post/comment reads are public at the RLS level). Liking,
// commenting, deleting and reporting require auth, gated individually below
// via useAuthGate rather than a page-level redirect.
export default function PostDetailClient({ id, initialPost, initialComments }: PostDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const resumeKey = useResumeKey();

  const [post, setPost] = useState<Post | null>(initialPost);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(!initialPost);
  // Not `initialComments.length === 0`: a post can genuinely have zero
  // comments, which must not look like a loading state.
  const [isCommentsLoading, setIsCommentsLoading] = useState(!initialPost);
  const [commentsError, setCommentsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // First effect run reuses the server-fetched post/comments, then silently
  // re-fetches once `user` resolves for personalised like/bookmark state.
  const seededRef = useRef(!!initialPost);
  const requestIdRef = useRef(0);
  // Bumped on every local change (like, answer, accept...). A background
  // refresh that started before a change must not overwrite it when it lands:
  // the silent re-fetch when auth hydrates is slow enough to lose a race with
  // someone who answers quickly.
  const mutationRef = useRef(0);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // ---------------------------------------------------------------------------
  // Load post + comments
  // ---------------------------------------------------------------------------
  const [commentsAttempt, setCommentsAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const requestId = ++requestIdRef.current;
    const startedAt = mutationRef.current;
    const isCurrent = () => requestId === requestIdRef.current && startedAt === mutationRef.current;
    const isSeededFirstRun = seededRef.current;
    seededRef.current = false;

    const retryOnce = async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        if (!(err instanceof TimeoutError)) throw err;
        await new Promise<void>((r) => setTimeout(r, 1_000));
        return fn();
      }
    };

    (async () => {
      if (!isSeededFirstRun) setIsLoading(true);
      try {
        const data = await retryOnce(() => withTimeout(hubService.getPostById(id, user?.id, signal), 10_000));
        if (isCurrent()) setPost(data);
      } catch {
        if (requestId === requestIdRef.current && !isSeededFirstRun) setError("Post not found.");
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    })();

    (async () => {
      if (!isSeededFirstRun) setIsCommentsLoading(true);
      setCommentsError(false);
      try {
        const data = await retryOnce(() => withTimeout(hubService.getComments(id, user?.id, signal), 10_000));
        if (isCurrent()) setComments(data);
      } catch {
        if (requestId === requestIdRef.current && !signal.aborted) setCommentsError(true);
      } finally {
        if (requestId === requestIdRef.current) setIsCommentsLoading(false);
      }
    })();

    return () => controller.abort();
  // resumeKey re-runs this after a tab switch so stalled requests are replaced.
  // user?.id (not user) avoids re-running on token refreshes.
  }, [id, user?.id, resumeKey, commentsAttempt]);

  // Increment view count once per mount.
  useEffect(() => {
    hubService.incrementPostView(id).catch(() => {});
  }, [id]);

  // ---------------------------------------------------------------------------
  // Post actions (optimistic)
  // ---------------------------------------------------------------------------
  const handleLikePost = async () => {
    mutationRef.current++;
    if (!user || !post) return;
    const wasLiked = !!post.is_liked;
    const apply = (liked: boolean) =>
      setPost((prev) => prev ? { ...prev, is_liked: liked, like_count: Math.max(0, prev.like_count + (liked ? 1 : -1)) } : prev);
    apply(!wasLiked);
    try {
      if (wasLiked) await hubService.unlikePost(post.id, user.id);
      else          await hubService.likePost(post.id, user.id);
    } catch {
      apply(wasLiked);
      setActionError("Couldn't update that like. Please try again.");
    }
  };

  const handleBookmarkPost = async () => {
    mutationRef.current++;
    if (!user || !post) return;
    const was = !!post.is_bookmarked;
    setPost((prev) => (prev ? { ...prev, is_bookmarked: !was } : prev));
    try {
      if (was) await hubService.unbookmarkPost(post.id, user.id);
      else     await hubService.bookmarkPost(post.id, user.id);
    } catch {
      setPost((prev) => (prev ? { ...prev, is_bookmarked: was } : prev));
      setActionError("Couldn't update your saved posts. Please try again.");
    }
  };

  const handleShare = async () => {
    if (!post) return;
    if ((await sharePostLink(post)) === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // Comments
  // ---------------------------------------------------------------------------
  const handleLikeComment = useCallback(async (commentId: string, wasLiked: boolean) => {
    mutationRef.current++;
    if (!user) return;
    const toggle = (liked: boolean) => (c: Comment): Comment =>
      c.id === commentId
        ? { ...c, is_liked: liked, like_count: Math.max(0, c.like_count + (liked ? 1 : -1)) }
        : { ...c, replies: (c.replies ?? []).map(toggle(liked)) };
    setComments((prev) => prev.map(toggle(!wasLiked)));
    try {
      if (wasLiked) await hubService.unlikeComment(commentId, user.id);
      else          await hubService.likeComment(commentId, user.id);
    } catch {
      setComments((prev) => prev.map(toggle(wasLiked)));
    }
  }, [user]);

  const handleAddComment = async () => {
    mutationRef.current++;
    const text = newComment.trim();
    if (!user || !text || isSubmittingComment) return;
    if (text.length > COMMENT_MAX) { setCommentError(`Keep it under ${COMMENT_MAX.toLocaleString("en-GB")} characters.`); return; }
    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const created = await withTimeout(hubService.createComment(id, user.id, text, replyingTo?.id), 10_000);
      const withProfile: Comment = {
        ...created,
        profiles: { username: user.username, avatar_url: user.avatar_url, profile_flair: user.profile_flair },
      };

      // comment_count counts top-level comments only (sync_comment_count), so
      // a reply doesn't change it.
      if (replyingTo) {
        setComments((prev) => prev.map((c) => (c.id === replyingTo.id ? { ...c, replies: [...(c.replies ?? []), withProfile] } : c)));
      } else {
        setComments((prev) => [...prev, withProfile]);
        setPost((prev) => (prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev));
      }
      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      setCommentError(friendlyError(err, "Your comment didn't post. Please try again."));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string, parentId: string | null) => {
    mutationRef.current++;
    setConfirmDeleteId(null);
    const snapshot = comments;
    const removedCount = parentId ? 0 : 1; // top-level only, as above
    setComments((prev) =>
      parentId
        ? prev.map((c) => ({ ...c, replies: (c.replies ?? []).filter((r) => r.id !== commentId) }))
        : prev.filter((c) => c.id !== commentId),
    );
    setPost((prev) => (prev ? {
      ...prev,
      comment_count: Math.max(0, prev.comment_count - removedCount),
      accepted_comment_id: prev.accepted_comment_id === commentId ? null : prev.accepted_comment_id,
    } : prev));
    try {
      await hubService.deleteComment(commentId);
    } catch {
      setComments(snapshot);
      setPost((prev) => (prev ? { ...prev, comment_count: prev.comment_count + removedCount } : prev));
      setActionError("That comment couldn't be deleted. Please try again.");
    }
  };

  // Question owner marks / unmarks the accepted answer.
  const handleAccept = async (commentId: string) => {
    mutationRef.current++;
    if (!post || acceptingId) return;
    const previous = post.accepted_comment_id ?? null;
    const next = previous === commentId ? null : commentId;
    setAcceptingId(commentId);
    setPost((prev) => (prev ? { ...prev, accepted_comment_id: next } : prev));
    try {
      await hubService.setAcceptedAnswer(post.id, next);
    } catch (err) {
      setPost((prev) => (prev ? { ...prev, accepted_comment_id: previous } : prev));
      setActionError(friendlyError(err, "Couldn't update the answer. Please try again."));
    } finally {
      setAcceptingId(null);
    }
  };

  useEffect(() => {
    if (!actionError) return;
    const t = setTimeout(() => setActionError(null), 4000);
    return () => clearTimeout(t);
  }, [actionError]);

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: BG }} aria-busy>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: AMBER }} aria-label="Loading post" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-4" style={{ backgroundColor: BG }}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto" style={{ color: SUBTLE }} aria-hidden />
          <h2 className="text-2xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
            Post not found
          </h2>
          <p className="text-sm" style={{ color: MUTED }}>It may have been deleted, or the link is wrong.</p>
          <Link href="/social/feed" className="inline-block text-xs font-bold uppercase tracking-[0.2em] hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)" style={{ color: AMBER }}>
            Back to the feed
          </Link>
        </div>
      </div>
    );
  }

  const isQuestion = post.post_type === "question";
  const isOwner = user?.id === post.user_id;
  const typeBadge = post.post_type !== "general" ? TYPE_BADGE[post.post_type] : null;
  const displayName = post.profiles?.full_name ?? post.profiles?.username ?? "Unknown";
  const username = post.profiles?.username ? `@${post.profiles.username}` : null;
  const noun = isQuestion ? "answer" : "comment";

  // Accepted answer first, then the rest in order.
  const ordered = post.accepted_comment_id
    ? [...comments].sort((a, b) => (a.id === post.accepted_comment_id ? -1 : b.id === post.accepted_comment_id ? 1 : 0))
    : comments;

  const renderComment = (comment: Comment, isReply = false) => {
    const isAccepted = !isReply && comment.id === post.accepted_comment_id;
    const mine = user?.id === comment.user_id;
    const handle = comment.profiles?.username ?? "user";
    return (
      <div key={comment.id} className={isReply ? "mt-3" : ""}>
        {isAccepted && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: GREEN }}>
            <CheckCircle2 className="w-4 h-4" aria-hidden /> Accepted answer
          </p>
        )}
        <div className="flex items-start gap-3">
          <ProfileLink userId={comment.user_id} username={comment.profiles?.username} ariaLabel={`${handle}'s profile`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-(--hm-amber)">
            <Avatar src={comment.profiles?.avatar_url ?? undefined} alt="" size={isReply ? "sm" : "md"} flair={comment.profiles?.profile_flair} />
          </ProfileLink>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ProfileLink
                userId={comment.user_id}
                username={comment.profiles?.username}
                className="font-extrabold text-sm text-left hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
              >
                {comment.profiles?.username ?? "Unknown"}
              </ProfileLink>
              {comment.user_id === post.user_id && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 border" style={{ color: AMBER, borderColor: "color-mix(in oklab, var(--hm-amber) 30%, transparent)" }}>
                  Author
                </span>
              )}
              <time dateTime={comment.created_at} className="text-xs" style={{ color: SUBTLE }}>{formatRelativeTime(comment.created_at)}</time>
            </div>
            <RichText text={comment.content} className="text-sm mb-2 leading-relaxed" style={{ color: MUTED, fontFamily: "var(--font-body)" }} />

            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => requireAuth(() => handleLikeComment(comment.id, !!comment.is_liked), "Sign in to like comments")}
                aria-pressed={!!comment.is_liked}
                aria-label={`${comment.is_liked ? "Unlike" : "Like"} comment`}
                className="inline-flex items-center gap-1 text-xs transition-colors hover:text-red-400 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: comment.is_liked ? "#EF4444" : SUBTLE }}
              >
                <Heart className={`w-3.5 h-3.5 ${comment.is_liked ? "fill-red-500" : ""}`} aria-hidden />
                {comment.like_count > 0 && <span className="font-semibold tabular-nums">{comment.like_count}</span>}
              </button>

              {!isReply && (
                <button
                  type="button"
                  onClick={() => requireAuth(() => {
                    setReplyingTo(replyingTo?.id === comment.id ? null : { id: comment.id, username: handle });
                    commentInputRef.current?.focus();
                  }, "Sign in to reply")}
                  className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-(--hm-amber) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ color: SUBTLE }}
                >
                  <CornerDownRight className="w-3 h-3" aria-hidden /> Reply
                </button>
              )}

              {isQuestion && isOwner && !isReply && (
                <button
                  type="button"
                  onClick={() => handleAccept(comment.id)}
                  disabled={!!acceptingId}
                  aria-pressed={isAccepted}
                  className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-[#4ADE80] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ color: isAccepted ? GREEN : SUBTLE }}
                >
                  {acceptingId === comment.id ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden /> : <CheckCircle2 className="w-3 h-3" aria-hidden />}
                  {isAccepted ? "Unmark answer" : "Accept answer"}
                </button>
              )}

              {mine ? (
                confirmDeleteId === comment.id ? (
                  <span className="inline-flex items-center gap-2 text-xs" role="group" aria-label="Confirm delete">
                    <span style={{ color: MUTED }}>Delete?</span>
                    <button type="button" onClick={() => handleDeleteComment(comment.id, comment.parent_id)} className="font-bold text-red-400 hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)">Delete</button>
                    <button type="button" onClick={() => setConfirmDeleteId(null)} className="font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)" style={{ color: SUBTLE }}>Cancel</button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(comment.id)}
                    aria-label="Delete comment"
                    className="inline-flex items-center text-xs transition-colors hover:text-red-400 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                    style={{ color: SUBTLE }}
                  >
                    <Trash2 className="w-3 h-3" aria-hidden />
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => requireAuth(() => setReportTarget({ type: "comment", id: comment.id }), "Sign in to report content")}
                  aria-label="Report comment"
                  className="inline-flex items-center text-xs transition-colors hover:text-red-400 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ color: SUBTLE }}
                >
                  <Flag className="w-3 h-3" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>

        {!isReply && (comment.replies ?? []).length > 0 && (
          <div className="mt-3 space-y-3 pl-4 ml-5" style={{ borderLeft: "2px solid color-mix(in oklab, var(--hm-amber) 13%, transparent)" }}>
            {(comment.replies ?? []).map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: BG }}>
      <div className="border-b sticky top-16 z-40" style={{ backgroundColor: BG2, borderColor: DIVIDER }}>
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/social/feed"))}
            aria-label="Back"
            className="p-1 -ml-1 transition-colors hover:text-(--hm-text) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
            style={{ color: SUBTLE }}
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
            {isQuestion ? "Question" : post.post_type === "review" ? "Review" : post.post_type === "recipe" ? "Recipe" : "Post"}
          </h1>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-8">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden mb-6 border"
          style={{ backgroundColor: BG2, borderColor: DIVIDER }}
        >
          <header className="p-4 md:p-5 flex items-center gap-3">
            <ProfileLink userId={post.user_id} username={post.profiles?.username} ariaLabel={`${displayName}'s profile`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-(--hm-amber)">
              <Avatar src={post.profiles?.avatar_url ?? undefined} alt="" size="lg" flair={post.profiles?.profile_flair} />
            </ProfileLink>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ProfileLink
                  userId={post.user_id}
                  username={post.profiles?.username}
                  className="font-extrabold text-base truncate text-left hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  {displayName}
                </ProfileLink>
                {post.profiles?.is_verified && <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: AMBER }} aria-label="Verified" />}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm" style={{ color: SUBTLE, fontFamily: "var(--font-body)" }}>
                  {username && <span>{username} · </span>}
                  <time dateTime={post.created_at}>{formatRelativeTime(post.created_at)}</time>
                  {post.updated_at && new Date(post.updated_at).getTime() - new Date(post.created_at).getTime() > 60_000 && <span> · edited</span>}
                </p>
                {typeBadge && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border" style={{ color: typeBadge.color, borderColor: `${typeBadge.color}40`, backgroundColor: `${typeBadge.color}15` }}>
                    <typeBadge.icon className="w-2.5 h-2.5" /> {typeBadge.label}
                  </span>
                )}
              </div>
            </div>
            {!isOwner && (
              <button
                type="button"
                onClick={() => requireAuth(() => setReportTarget({ type: "post", id: post.id }), "Sign in to report content")}
                aria-label="Report post"
                className="p-2 -mr-2 transition-colors hover:text-red-400 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: SUBTLE }}
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </header>

          <PostBody post={post} variant="full" />

          <footer className="px-4 md:px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: DIVIDER }}>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => requireAuth(handleLikePost, "Sign in to like this post")}
                aria-pressed={!!post.is_liked}
                aria-label={`${post.is_liked ? "Unlike" : "Like"} post, ${post.like_count} like${post.like_count === 1 ? "" : "s"}`}
                className="inline-flex items-center gap-2 py-1.5 transition-colors hover:text-red-400 focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: post.is_liked ? "#EF4444" : SUBTLE }}
              >
                <Heart className={`w-6 h-6 ${post.is_liked ? "fill-red-500" : ""}`} aria-hidden />
                <span className="text-base font-semibold tabular-nums" aria-hidden>{post.like_count}</span>
              </button>
              <span className="inline-flex items-center gap-2" style={{ color: SUBTLE }} aria-label={`${post.comment_count} ${noun}s`}>
                <MessageCircle className="w-6 h-6" aria-hidden />
                <span className="text-base font-semibold tabular-nums" aria-hidden>{post.comment_count}</span>
              </span>
              <span className="inline-flex items-center gap-2" style={{ color: SUBTLE }} aria-label={`${post.view_count} views`}>
                <Eye className="w-5 h-5" aria-hidden />
                <span className="text-sm font-semibold tabular-nums" aria-hidden>{post.view_count}</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => requireAuth(handleBookmarkPost, "Sign in to save posts")}
                aria-pressed={!!post.is_bookmarked}
                aria-label={post.is_bookmarked ? "Remove from saved" : "Save post"}
                className="p-1 transition-colors hover:text-(--hm-amber) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: post.is_bookmarked ? AMBER : SUBTLE }}
              >
                <Bookmark className={`w-6 h-6 ${post.is_bookmarked ? "fill-(--hm-amber)" : ""}`} aria-hidden />
              </button>
              <button
                type="button"
                onClick={handleShare}
                aria-label={copied ? "Link copied" : "Share post"}
                className="p-1 transition-colors hover:text-(--hm-amber) focus-visible:outline-2 focus-visible:outline-(--hm-amber)"
                style={{ color: copied ? AMBER : SUBTLE }}
              >
                {copied ? <Check className="w-6 h-6" aria-hidden /> : <Share2 className="w-6 h-6" aria-hidden />}
              </button>
            </div>
          </footer>
        </motion.article>

        {/* Comments / answers */}
        <section className="overflow-hidden border" style={{ backgroundColor: BG2, borderColor: DIVIDER }} aria-labelledby="comments-heading">
          <h2 id="comments-heading" className="sr-only">{isQuestion ? "Answers" : "Comments"}</h2>
          <div className="p-4 md:p-5 border-b" style={{ borderColor: DIVIDER }}>
            <AnimatePresence>
              {replyingTo && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold" style={{ color: AMBER }}>Replying to @{replyingTo.username}</span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-xs hover:underline focus-visible:outline-2 focus-visible:outline-(--hm-amber)" style={{ color: SUBTLE }}>
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-start gap-3">
              <Avatar src={user?.avatar_url ?? undefined} alt="" size="md" flair={user?.profile_flair} />
              <div className="flex-1">
                <div className="flex gap-2">
                  <label htmlFor="comment-input" className="sr-only">{replyingTo ? `Reply to @${replyingTo.username}` : isQuestion ? "Write an answer" : "Write a comment"}</label>
                  <textarea
                    id="comment-input"
                    ref={commentInputRef}
                    value={newComment}
                    rows={1}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      setCommentError(null);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                    }}
                    onFocus={() => { if (!user) requireAuth(() => {}, isQuestion ? "Sign in to answer" : "Sign in to comment"); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); requireAuth(handleAddComment, "Sign in to comment"); } }}
                    placeholder={replyingTo ? `Reply to @${replyingTo.username}` : isQuestion ? "Know the answer? Share it" : "Write a comment"}
                    className="flex-1 resize-none text-base px-4 py-2.5 border border-[color-mix(in_oklab,var(--hm-text)_9%,transparent)] focus:outline-none focus:border-(--hm-amber) transition-colors leading-snug"
                    style={{ backgroundColor: BG, color: CREAM, caretColor: AMBER }}
                    disabled={isSubmittingComment}
                    aria-invalid={!!commentError || undefined}
                    aria-describedby={commentError ? "comment-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => requireAuth(handleAddComment, "Sign in to comment")}
                    disabled={!newComment.trim() || isSubmittingComment}
                    aria-label={replyingTo ? "Send reply" : isQuestion ? "Post answer" : "Post comment"}
                    className="self-end p-2.5 shrink-0 transition-opacity disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)"
                    style={{ backgroundColor: AMBER, color: BG }}
                  >
                    {isSubmittingComment ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : <Send className="w-5 h-5" aria-hidden />}
                  </button>
                </div>
                {commentError && <p id="comment-error" className="mt-2 text-sm text-red-400" role="alert">{commentError}</p>}
              </div>
            </div>
          </div>

          <div aria-live="polite" aria-busy={isCommentsLoading}>
            {isCommentsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" style={{ color: AMBER }} aria-label={`Loading ${noun}s`} /></div>
            ) : commentsError && comments.length === 0 ? (
              <div className="p-8 flex flex-col items-center gap-3 text-center">
                <p className="text-sm" style={{ color: MUTED }}>Couldn&apos;t load {noun}s.</p>
                <button type="button" onClick={() => setCommentsAttempt((n) => n + 1)} className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 border border-[color-mix(in_oklab,var(--hm-text)_6%,transparent)] hover:border-(--hm-amber) focus-visible:outline-2 focus-visible:outline-(--hm-amber)" style={{ color: AMBER }}>
                  Try again
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "color-mix(in oklab, var(--hm-amber) 35%, transparent)" }} aria-hidden />
                <p style={{ color: MUTED, fontFamily: "var(--font-body)" }}>
                  {isQuestion ? "No answers yet. If you know, help out." : "No comments yet. Start the conversation."}
                </p>
              </div>
            ) : (
              ordered.map((comment, index) => (
                <div
                  key={comment.id}
                  className="p-4 md:p-5"
                  style={{
                    ...(index > 0 ? { borderTop: `1px solid ${DIVIDER}` } : {}),
                    ...(comment.id === post.accepted_comment_id ? { backgroundColor: "color-mix(in oklab, #4ADE80 6%, transparent)" } : {}),
                  }}
                >
                  {renderComment(comment)}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md px-5 py-3 shadow-xl border text-sm"
            style={{ backgroundColor: BG2, borderColor: "rgb(248 113 113 / 0.4)", color: CREAM }}
            role="alert"
          >
            {actionError}
          </motion.div>
        )}
      </AnimatePresence>

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
