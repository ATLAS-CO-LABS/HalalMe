"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { cldUrl, CLD_AVATAR } from "@/lib/cldUrl";
import { getFlairTheme } from "@/lib/flairTheme";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Redeemed profile flair slug (e.g. "gold-frame") — renders a ring around the avatar. */
  flair?: string | null;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

// Ring thickness per size — kept proportional so small avatars (sm) don't
// get swallowed by the ring.
const ringPadding = {
  sm: "p-[2px]",
  md: "p-[2px]",
  lg: "p-[2.5px]",
  xl: "p-[3px]",
};

export default function Avatar({
  src,
  alt,
  size = "md",
  className = "",
  flair,
}: AvatarProps) {
  const theme = getFlairTheme(flair);
  const ring = theme?.ring ?? null;

  const inner = (
    <div
      className={`relative ${ring ? "w-full h-full" : sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center shrink-0`}
      style={{ background: "linear-gradient(135deg, var(--hm-amber) 0%, #D97706 100%)" }}
    >
      {src ? (
        <Image src={cldUrl(src, CLD_AVATAR) ?? src} alt={alt} fill sizes="(max-width: 768px) 64px, 64px" className="object-cover" />
      ) : (
        <User className={`${iconSizes[size]} text-[#102C26]`} />
      )}
    </div>
  );

  if (!ring) {
    return <div className={`${className}`}>{inner}</div>;
  }

  return (
    <div
      className={`${sizeClasses[size]} ${ringPadding[size]} rounded-full shrink-0 ${className}`}
      style={{ background: ring }}
      title="Has an equipped profile flair"
    >
      {inner}
    </div>
  );
}
