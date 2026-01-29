"use client";

import { motion } from "framer-motion";

export default function PostCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      {/* User Info Skeleton */}
      <div className="p-4 md:p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-3 bg-gray-700 rounded w-24 animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 md:px-5 pb-4 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse" />
      </div>

      {/* Image Skeleton */}
      <div className="relative w-full aspect-[16/10] bg-gray-700 animate-pulse" />

      {/* Actions Skeleton */}
      <div className="p-4 md:p-5 border-t border-gray-700">
        <div className="flex items-center gap-6">
          <div className="h-8 bg-gray-700 rounded w-16 animate-pulse" />
          <div className="h-8 bg-gray-700 rounded w-16 animate-pulse" />
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
