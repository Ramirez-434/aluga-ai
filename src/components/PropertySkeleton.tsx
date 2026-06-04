'use client';

import { motion } from 'framer-motion';

// A4: Shimmer skeleton premium usando a classe .shimmer do globals.css
export function PropertyCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 shadow-sm"
    >
      {/* Image placeholder com shimmer */}
      <div className="aspect-video w-full shimmer bg-gray-200 dark:bg-white/10" />

      <div className="p-5 space-y-4">
        {/* Title + Address */}
        <div className="space-y-2.5">
          <div className="h-5 shimmer bg-gray-200 dark:bg-white/10 rounded-full w-3/4" />
          <div className="h-3.5 shimmer bg-gray-100 dark:bg-white/5 rounded-full w-1/2" />
        </div>

        {/* Stats row */}
        <div className="flex gap-4 pt-2 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="h-7 w-7 shimmer bg-gray-200 dark:bg-white/10 rounded-lg" />
          <div className="h-7 w-7 shimmer bg-gray-200 dark:bg-white/10 rounded-lg" />
          <div className="h-7 w-16 shimmer bg-gray-200 dark:bg-white/10 rounded-lg" />
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between pt-1">
          <div className="space-y-1.5">
            <div className="h-3 shimmer bg-gray-100 dark:bg-white/5 rounded-full w-16" />
            <div className="h-7 shimmer bg-gray-200 dark:bg-white/10 rounded-full w-32" />
          </div>
          <div className="h-8 w-8 shimmer bg-gray-100 dark:bg-white/5 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

export function PropertyListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
