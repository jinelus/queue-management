import { Skeleton } from '@/components/ui/skeleton'

export function DashboardShellSkeleton() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <Skeleton className="h-8 w-52" />
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr_20rem]">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
      <Skeleton className="h-12 w-48" />
    </div>
  )
}
