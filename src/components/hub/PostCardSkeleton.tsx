"use client";

import { motion } from "framer-motion";

const BG2 = "#111418";
const CREAM = "#F7E7CE";

export default function PostCardSkeleton() {
  return (
    <div className="overflow-hidden border" style={{ backgroundColor: BG2, borderColor: `${CREAM}10` }}>
      {/* User Info Skeleton */}
      <div className="p-4 md:p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full animate-pulse" style={{ backgroundColor: `${CREAM}12` }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse" style={{ backgroundColor: `${CREAM}12` }} />
          <div className="h-3 w-24 animate-pulse" style={{ backgroundColor: `${CREAM}08` }} />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 md:px-5 pb-4 space-y-2">
        <div className="h-4 w-full animate-pulse" style={{ backgroundColor: `${CREAM}12` }} />
        <div className="h-4 w-5/6 animate-pulse" style={{ backgroundColor: `${CREAM}12` }} />
        <div className="h-4 w-4/6 animate-pulse" style={{ backgroundColor: `${CREAM}12` }} />
      </div>

      {/* Image Skeleton */}
      <div className="relative w-full aspect-16/10 animate-pulse" style={{ backgroundColor: `${CREAM}08` }} />

      {/* Actions Skeleton */}
      <div className="p-4 md:p-5 border-t" style={{ borderColor: `${CREAM}10` }}>
        <div className="flex items-center gap-6">
          <div className="h-8 w-16 animate-pulse" style={{ backgroundColor: `${CREAM}12` }} />
          <div className="h-8 w-16 animate-pulse" style={{ backgroundColor: `${CREAM}12` }} />
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
