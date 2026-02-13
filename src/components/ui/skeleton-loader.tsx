import { Skeleton } from '@/components/ui/skeleton';

export const TableSkeleton = ({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) => (
  <div className="space-y-3 p-4 animate-fade-in">
    <div className="flex gap-3 mb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded-md" />
      ))}
    </div>
    <div className="space-y-2">
      <div className="flex gap-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-md" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2" style={{ opacity: 1 - i * 0.08 }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1 rounded-sm" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-[250px] w-full rounded-md" />
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-[250px] w-full rounded-md" />
      </div>
    </div>
  </div>
);

export const KanbanSkeleton = () => (
  <div className="animate-fade-in">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <div className="flex gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-[280px] rounded-xl border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          {Array.from({ length: 3 - i }).map((_, j) => (
            <div key={j} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
