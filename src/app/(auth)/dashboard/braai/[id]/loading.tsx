import { Skeleton } from '@/components/ui/skeleton'

export default function BraaiDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-16" />
        </div>
      </div>

      {/* Cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}
