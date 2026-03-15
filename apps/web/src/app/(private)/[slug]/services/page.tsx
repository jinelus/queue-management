import { Suspense } from 'react'
import { Container } from '@/components/custom/container'
import { ManageServices } from '@/components/dashboard/admin/services'
import { ManageServicesSkeleton } from '@/components/dashboard/admin/services/skeleton'

export default function ServicesPage(params: PageProps<'/[slug]/services'>) {
  return (
    <Container>
      <Suspense fallback={<ManageServicesSkeleton />}>
        <ManageServices {...params} />
      </Suspense>
    </Container>
  )
}
