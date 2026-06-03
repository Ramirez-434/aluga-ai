'use client';

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/60 dark:bg-black/40 border border-white/20 dark:border-white/10 shadow-lg animate-pulse">
      {/* Image placeholder */}
      <div className="h-64 w-full bg-gray-200 dark:bg-white/10" />

      <div className="p-5 space-y-4">
        {/* Title + Address */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-3/4" />
          <div className="h-3.5 bg-gray-100 dark:bg-white/5 rounded-full w-1/2" />
        </div>

        {/* Stats row */}
        <div className="flex gap-4 pt-2 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-full w-12" />
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-full w-12" />
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-full w-16" />
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between pt-1">
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-16" />
            <div className="h-7 bg-gray-200 dark:bg-white/10 rounded-full w-32" />
          </div>
          <div className="space-y-1.5 items-end flex flex-col">
            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-20" />
            <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
