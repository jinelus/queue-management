import { Suspense } from 'react'
import { Container } from '@/components/custom/container'
import { ManageServices } from '@/components/dashboard/admin/services'
import { DashboardShellSkeleton } from '@/components/dashboard/dashboard-shell-skeleton'

export default function ServicesPage(params: PageProps<'/[slug]/services'>) {
  return (
    <Container>
      <Suspense fallback={<DashboardShellSkeleton />}>
        <ManageServices {...params} />
      </Suspense>
    </Container>
  )
}
