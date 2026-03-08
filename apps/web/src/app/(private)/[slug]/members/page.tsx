import { Suspense } from 'react'
import { Container } from '@/components/custom/container'
import { ManageMembers } from '@/components/dashboard/admin/members'
import { DashboardShellSkeleton } from '@/components/dashboard/dashboard-shell-skeleton'

export default function MembersPage(params: PageProps<'/[slug]/members'>) {
  return (
    <Container>
      <Suspense fallback={<DashboardShellSkeleton />}>
        <ManageMembers {...params} />
      </Suspense>
    </Container>
  )
}
