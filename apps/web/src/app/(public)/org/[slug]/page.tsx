import { Suspense } from 'react'
import { OrgServicePage } from '@/components/clients/org-service-page'
import { Container } from '@/components/custom/container'

export default function PublicOrgPage(props: PageProps<'/org/[slug]'>) {
  return (
    <Container>
      <div className='flex min-h-svh items-center justify-center py-10'>
        <Suspense>
          <OrgServicePage {...props} />
        </Suspense>
      </div>
    </Container>
  )
}
