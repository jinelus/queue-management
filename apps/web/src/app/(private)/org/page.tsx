import { Suspense } from 'react'
import { Container } from '@/components/custom/container'
import { OrganizationPage } from '@/components/org'

export default function OrgPage() {
  return (
    <Container>
      <div className="flex min-h-svh items-center justify-center p-4">
        <Suspense>
          <OrganizationPage />
        </Suspense>
      </div>
    </Container>
  )
}
