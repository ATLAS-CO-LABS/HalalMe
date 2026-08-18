"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGate } from "@/hooks/useAuthGate";
import { profileHref } from "@/lib/profileHref";

interface ProfileLinkProps {
  userId: string;
  username?: string | null;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  children: React.ReactNode;
}

/**
 * A link to a user's profile that stays a real `<a href>` — so search
 * engines and "open in new tab" keep working — but for a logged-out visitor
 * intercepts the click and opens the sign-in modal instead of navigating.
 * Same gate Like/Comment/Bookmark already use; a signed-in click is
 * indistinguishable from a plain Link.
 *
 * Without this, viewing profiles was the one social interaction with no
 * gate at all, letting a logged-out visitor browse the whole user graph
 * without ever hitting a sign-up prompt.
 */
export default function ProfileLink({ userId, username, className, style, ariaLabel, children }: ProfileLinkProps) {
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  const href = profileHref(userId, username);

  return (
    <Link
      href={href}
      className={className}
      style={style}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        requireAuth(() => router.push(href), "Sign in to view profiles");
      }}
    >
      {children}
    </Link>
  );
}
