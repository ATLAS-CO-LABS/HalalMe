'use client';

import { motion } from 'framer-motion';

interface ResultsSkeletonProps {
  type: 'flights' | 'hotels' | 'cars';
  count?: number;
}

export default function ResultsSkeleton({ type, count = 3 }: ResultsSkeletonProps) {
  const skeletonItems = Array.from({ length: count }, (_, i) => i);

  const shimmer = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  };

  if (type === 'flights') {
    return (
      <div className="space-y-4">
        {skeletonItems.map((i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-6"
          >
            <div className="flex items-center gap-4">
              {/* Airline Logo */}
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg"
                animate={shimmer.animate}
                transition={shimmer.transition}
                style={{ backgroundSize: '200% 100%' }}
              />

              {/* Flight Details */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <motion.div
                    className="h-8 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                  <motion.div
                    className="h-4 w-32 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                  <motion.div
                    className="h-8 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                </div>
                <div className="flex justify-between">
                  <motion.div
                    className="h-4 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                  <motion.div
                    className="h-4 w-16 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                  <motion.div
                    className="h-4 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="text-right space-y-2">
                <motion.div
                  className="h-8 w-24 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded ml-auto"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
                <motion.div
                  className="h-10 w-28 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded ml-auto"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'hotels') {
    return (
      <div className="space-y-4">
        {skeletonItems.map((i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden flex flex-col md:flex-row"
          >
            {/* Image */}
            <motion.div
              className="w-full md:w-72 h-48 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"
              animate={shimmer.animate}
              transition={shimmer.transition}
              style={{ backgroundSize: '200% 100%' }}
            />

            {/* Content */}
            <div className="flex-1 p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <motion.div
                    className="h-6 w-48 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                  <motion.div
                    className="h-4 w-32 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                </div>
                <motion.div
                  className="h-10 w-16 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>

              <motion.div
                className="h-4 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                animate={shimmer.animate}
                transition={shimmer.transition}
                style={{ backgroundSize: '200% 100%' }}
              />

              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <motion.div
                    key={j}
                    className="h-6 w-24 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <motion.div
                  className="h-4 w-24 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
                <div className="flex items-center gap-4">
                  <motion.div
                    className="h-8 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                  <motion.div
                    className="h-12 w-28 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl"
                    animate={shimmer.animate}
                    transition={shimmer.transition}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Cars skeleton
  return (
    <div className="space-y-4">
      {skeletonItems.map((i) => (
        <div
          key={i}
          className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden flex flex-col md:flex-row"
        >
          {/* Image */}
          <motion.div
            className="w-full md:w-64 h-48 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"
            animate={shimmer.animate}
            transition={shimmer.transition}
            style={{ backgroundSize: '200% 100%' }}
          />

          {/* Content */}
          <div className="flex-1 p-5 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <motion.div
                  className="h-6 w-36 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
                <motion.div
                  className="h-4 w-48 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>
              <motion.div
                className="h-8 w-16 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                animate={shimmer.animate}
                transition={shimmer.transition}
                style={{ backgroundSize: '200% 100%' }}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <motion.div
                  key={j}
                  className="h-6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {[1, 2, 3].map((j) => (
                <motion.div
                  key={j}
                  className="h-6 w-28 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <motion.div
                className="h-4 w-32 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                animate={shimmer.animate}
                transition={shimmer.transition}
                style={{ backgroundSize: '200% 100%' }}
              />
              <div className="flex items-center gap-4">
                <motion.div
                  className="h-8 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
                <motion.div
                  className="h-12 w-28 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl"
                  animate={shimmer.animate}
                  transition={shimmer.transition}
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
