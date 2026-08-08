import type { Metadata } from "next";
import { getPostBySlug } from "@/data/blogPosts";

// Blog data is a static local module — no fetch needed, this is synchronous.
// The page itself is a client component (needs useParams), so metadata has
// to live in a sibling layout rather than the page's own export.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: "Article Not Found" };

  const title = post.title;
  const description = post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.image],
    },
  };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
