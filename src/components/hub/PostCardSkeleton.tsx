"use client";

import { motion } from "framer-motion";

const BG2 = "var(--hub-bg2)";

export default function PostCardSkeleton() {
  return (
    <div className="overflow-hidden border" style={{ backgroundColor: BG2, borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
      {/* User Info Skeleton */}
      <div className="p-4 md:p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)` }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)` }} />
          <div className="h-3 w-24 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 3%, transparent)` }} />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 md:px-5 pb-4 space-y-2">
        <div className="h-4 w-full animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)` }} />
        <div className="h-4 w-5/6 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)` }} />
        <div className="h-4 w-4/6 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)` }} />
      </div>

      {/* Image Skeleton */}
      <div className="relative w-full aspect-16/10 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 3%, transparent)` }} />

      {/* Actions Skeleton */}
      <div className="p-4 md:p-5 border-t" style={{ borderColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }}>
        <div className="flex items-center gap-6">
          <div className="h-8 w-16 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)` }} />
          <div className="h-8 w-16 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 7%, transparent)` }} />
        </div>
      </div>
    </div>
  );
}

export function PostCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <PostCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}
