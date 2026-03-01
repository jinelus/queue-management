import { Suspense } from 'react'
import { DashboardShellSkeleton } from '@/components/dashboard/dashboard-shell-skeleton'
import { DashboardStream } from '@/components/dashboard/dashboard-stream'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <DashboardStream />
    </Suspense>
  )
}
