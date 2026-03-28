import { Suspense } from 'react'
import { OrgTicketPage } from '@/components/clients/org-ticket-page'
import { Container } from '@/components/custom/container'

export default function PublicOrgTicketPage(props: PageProps<'/org/[slug]/ticket/[ticketId]'>) {
  return (
    <Container>
      <div className='flex min-h-svh items-center justify-center py-10'>
        <Suspense>
          <OrgTicketPage {...props} />
        </Suspense>
      </div>
    </Container>
  )
}
