interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className = '', lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function McpServerSkeleton() {
  return (
    <div
      className="rounded-lg border bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10 p-3"
      aria-label="Loading server..."
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-4 h-4" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="w-6 h-6 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function McpServerListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading MCP servers...">
      {Array.from({ length: count }).map((_, i) => (
        <McpServerSkeleton key={i} />
      ))}
    </div>
  );
}

export function McpToolStatusSkeleton() {
  return (
    <div
      className="p-3 rounded-lg border bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10"
      aria-label="Loading tool status..."
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function McpToolStatusListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading tool statuses...">
      {Array.from({ length: count }).map((_, i) => (
        <McpToolStatusSkeleton key={i} />
      ))}
    </div>
  );
}
