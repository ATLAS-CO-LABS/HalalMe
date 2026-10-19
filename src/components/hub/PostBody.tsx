"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle } from "lucide-react";
import type { Post } from "@/types";
import RichText from "./RichText";
import RecipeShareCard from "./RecipeShareCard";
import PostMedia from "./PostMedia";
import { StarDisplay } from "./StarRating";

const CREAM = "var(--hm-text)";
const SUBTLE = "var(--hm-text-subtle)";

const COLLAPSE_CHARS = 420;
const COLLAPSE_LINES = 6;

/**
 * Everything between a post's author row and its action bar, rendered the same
 * way in the feed and on the post page so the two can't drift apart.
 *
 * Each post type has its own shape:
 *   general  : text and/or photos
 *   recipe   : optional caption + the recipe card
 *   question : the question as a heading, optional details, "Answered" state
 *   review   : what was reviewed, a star rating, then the review
 */
export default function PostBody({ post, variant = "feed" }: { post: Post; variant?: "feed" | "full" }) {
  const isFull = variant === "full";
  const text = post.content ?? "";
  const long = text.length > COLLAPSE_CHARS || text.split("\n").length > COLLAPSE_LINES;
  const [expanded, setExpanded] = useState(isFull);
  const collapsed = long && !expanded;
  const authorName = post.profiles?.full_name ?? post.profiles?.username ?? "a member";

  return (
    <>
      <div className="px-4 md:px-5 pb-4 space-y-3">
        {post.post_type === "question" && post.title && (
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#60A5FA" }} aria-hidden />
            <h3
              className={`font-extrabold leading-snug ${isFull ? "text-xl md:text-2xl" : "text-lg"}`}
              style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
            >
              {post.title}
            </h3>
          </div>
        )}

        {post.post_type === "review" && post.review_subject && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3
              className={`font-extrabold leading-snug ${isFull ? "text-xl md:text-2xl" : "text-lg"}`}
              style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
            >
              {post.review_subject}
            </h3>
            {post.rating ? <StarDisplay rating={post.rating} size={isFull ? "md" : "sm"} /> : null}
          </div>
        )}

        {text && (
          <div>
            <RichText
              text={text}
              className={`leading-relaxed ${isFull ? "text-lg" : "text-base"} ${collapsed ? "line-clamp-6" : ""}`}
              style={{ color: post.post_type === "question" ? "var(--hm-text-muted)" : CREAM, fontFamily: "var(--font-body)" }}
            />
            {long && !isFull && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-1 text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber)"
                style={{ color: SUBTLE }}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {post.post_type === "question" && post.accepted_comment_id && !isFull && (
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: "#4ADE80" }}>
            <CheckCircle2 className="w-4 h-4" aria-hidden /> Answered
          </p>
        )}

        {post.post_type === "recipe" && post.recipe_id && (
          <RecipeShareCard recipe={post.recipe ?? null} />
        )}

        {post.linked_recipe && <RecipeShareCard recipe={post.linked_recipe} compact />}
      </div>

      {(post.media_urls?.length ?? 0) > 0 && (
        <PostMedia
          urls={post.media_urls ?? []}
          href={isFull ? undefined : `/social/post/${post.id}`}
          variant={variant}
          alt={`Photo shared by ${authorName}`}
        />
      )}
    </>
  );
}
