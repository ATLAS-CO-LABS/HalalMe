import type { Metadata } from "next";
import { cache } from "react";
import { hubService } from "@/services/hubService";
import { cldUrl, CLD_AVATAR } from "@/lib/cldUrl";
import ProfileClient from "./ProfileClient";

// Same pattern as social/post/[id]/page.tsx: an anonymous server fetch (profile
// SELECT is public at the RLS level - "USING (true)" in 002_auth_profiles.sql)
// feeds both generateMetadata and the page body via cache() so they share one
// request. The client component owns the authenticated re-fetch (follow state,
// badges) once useAuth() resolves.
const getProfile = cache(async (handle: string) => {
  try {
    return await hubService.getProfileByHandle(handle);
  } catch {
    return null;
  }
});

async function getPosts(userId: string) {
  try {
    return await hubService.getUserPosts(userId);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfile(handle);

  if (!profile) return { title: "Profile" };

  const name = profile.full_name ?? profile.username ?? "HalalMe member";
  const title = `${name} on HalalMe Social`;
  const description = profile.bio?.trim().slice(0, 155) || `View ${name}'s profile on HalalMe Social.`;
  const image = profile.avatar_url ? cldUrl(profile.avatar_url, CLD_AVATAR) : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/social/u/${handle}` },
    openGraph: {
      title,
      description,
      type: "profile",
      images: image ? [{ url: image, width: 400, height: 400, alt: name }] : undefined,
    },
    twitter: {
      card: image ? "summary" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfile(handle);
  const posts = profile ? await getPosts(profile.id) : [];

  return <ProfileClient handle={handle} initialProfile={profile} initialPosts={posts} />;
}
