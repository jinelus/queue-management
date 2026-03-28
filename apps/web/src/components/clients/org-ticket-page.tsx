import { notFound } from 'next/navigation'
import { getPublicOrganizationBySlug } from '@/actions/organizations/get'
import { listServices } from '@/actions/services/get'
import { getGuestTicketPosition } from '@/actions/tickets/get'
import { TicketLiveCard } from './ticket-live-card'

export async function OrgTicketPage(props: PageProps<'/org/[slug]/ticket/[ticketId]'>) {
  const { slug, ticketId } = await props.params

  const [organizationError, organizationResponse] = await getPublicOrganizationBySlug(slug)

  if (organizationError || !organizationResponse?.organization) {
    notFound()
  }

  const organization = organizationResponse.organization
  const [positionError, positionResponse] = await getGuestTicketPosition(organization.id, ticketId)

  if (positionError || !positionResponse?.ticket) {
    notFound()
  }

  const [servicesError, servicesResponse] = await listServices(organization.id, {
    page: 1,
    perPage: 100,
  })

  const services = !servicesError && servicesResponse?.services ? servicesResponse.services : []

  const ticketService = services.find((service) => service.id === positionResponse.ticket.serviceId)

  return (
    <TicketLiveCard
      organizationId={organization.id}
      organizationName={organization.name}
      slug={slug}
      ticketId={ticketId}
      guestName={positionResponse.ticket.guestName}
      serviceName={ticketService?.name ?? 'Service'}
      initialPosition={positionResponse.position}
      initialEstimatedWaitTime={positionResponse.estimatedWaitTime}
      initialStatus={positionResponse.ticket.status}
    />
  )
}
