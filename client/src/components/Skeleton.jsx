export function SkeletonLine({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 ${className}`}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonLine className="h-28 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonLine className="h-24" />
        <SkeletonLine className="h-24" />
        <SkeletonLine className="h-24" />
      </div>
      <SkeletonLine className="h-64 w-full" />
    </div>
  )
}
