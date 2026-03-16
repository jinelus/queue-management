import { Suspense } from 'react'
import { Container } from '@/components/custom/container'
import { OrgWrapper } from '@/components/dashboard/admin/org-wrapper'

export default function OrgDashboardPage(props: PageProps<'/[slug]'>) {
  return (
    <Container>
      <Suspense>
        <OrgWrapper {...props} />
      </Suspense>
    </Container>
  )
}
