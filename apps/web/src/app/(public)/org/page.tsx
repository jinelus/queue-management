import { Suspense } from 'react'
import { OrganizationsSearch } from '@/components/clients/organizations-search'
import { Container } from '@/components/custom/container'

export default function OrgPage(props: PageProps<'/org'>) {
  return (
    <Container>
      <div className='flex min-h-svh items-center justify-center py-10'>
        <Suspense>
          <OrganizationsSearch {...props} />
        </Suspense>
      </div>
    </Container>
  )
}
