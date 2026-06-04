export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row">
      {/* Sidebar Skeleton */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/8 flex flex-col h-screen shrink-0 animate-pulse">
        <div className="p-5 border-b border-gray-100 dark:border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24" />
            <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-16" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-20 mb-4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-white/10 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded flex-1" />
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-8 animate-pulse">
        <div className="flex gap-2 mb-8">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-12" />
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl" />
      </main>
    </div>
  );
}
