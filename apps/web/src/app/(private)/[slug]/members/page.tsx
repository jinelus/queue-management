import { Suspense } from 'react'
import { Container } from '@/components/custom/container'
import { ManageMembers } from '@/components/dashboard/admin/members'
import { ManageMembersSkeleton } from '@/components/dashboard/admin/members/skeleton'

export default function MembersPage(params: PageProps<'/[slug]/members'>) {
  return (
    <Container>
      <Suspense fallback={<ManageMembersSkeleton />}>
        <ManageMembers {...params} />
      </Suspense>
    </Container>
  )
}
