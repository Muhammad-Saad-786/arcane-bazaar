export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-arcane-surface rounded-lg ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-3 sm:p-4 space-y-3">
      <Skeleton className="aspect-video rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow({ count = 3 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex gap-3 p-3">
          <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
