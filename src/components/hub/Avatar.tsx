"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
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

export default function Avatar({
  src,
  alt,
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center shrink-0 ${className}`}
      style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 64px, 64px" className="object-cover" />
      ) : (
        <User className={`${iconSizes[size]} text-[#102C26]`} />
      )}
    </div>
  );
}
