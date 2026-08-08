import type { Metadata } from "next";
import { cache } from "react";
import { hubService } from "@/services/hubService";
import { cldUrl, CLD_POST_IMG } from "@/lib/cldUrl";
import PostDetailClient from "./PostDetailClient";

// Anonymous fetch — post/comment SELECT is public at the RLS level for
// published content (see "Published posts are public" / "Comments are
// public" policies). A null result here isn't necessarily "doesn't exist" —
// it could be the owner's own unpublished post, which RLS only allows their
// *authenticated* session to read ("Users can read own unpublished posts").
// That's why the page below never hard-404s on a null fetch: it always
// renders PostDetailClient, which retries client-side with the real session
// and has its own full loading/error/not-found handling.
//
// Wrapped in React's cache() so generateMetadata and the page body share
// one fetch per request instead of two.
const getPost = cache(async (id: string) => {
  try {
    return await hubService.getPostById(id);
  } catch {
    return null;
  }
});

async function getComments(id: string) {
  try {
    return await hubService.getComments(id);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) return { title: "Post" };

  const author = post.profiles?.full_name ?? post.profiles?.username ?? "HalalMe";
  const title = `${author} on HalalMe Social`;
  const description = post.content?.trim().slice(0, 155) || "A post shared on HalalMe Social.";
  const firstMedia = post.media_urls?.[0];
  const image = firstMedia ? cldUrl(firstMedia, CLD_POST_IMG) : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/social/post/${id}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, comments] = await Promise.all([getPost(id), getComments(id)]);

  return <PostDetailClient id={id} initialPost={post} initialComments={comments} />;
}
