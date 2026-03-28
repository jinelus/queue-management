import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicOrganizationBySlug } from '@/actions/organizations/get'
import { listServices } from '@/actions/services/get'
import { OrganizationTicketForm } from './organization-ticket-form'

export async function OrgServicePage(props: PageProps<'/org/[slug]'>) {
  const { slug } = await props.params

  const [orgError, orgResponse] = await getPublicOrganizationBySlug(slug)

  if (orgError || !orgResponse?.organization) {
    notFound()
  }

  const organization = orgResponse.organization
  const [servicesError, servicesResponse] = await listServices(organization.id, {
    page: 1,
    perPage: 100,
  })

  if (servicesError || !servicesResponse?.services || servicesResponse.services.length === 0) {
    return (
      <div className='mx-auto w-full max-w-2xl rounded-lg border bg-white p-6 text-center'>
        <h2 className='font-semibold text-2xl'>{organization.name}</h2>
        <p className='text-muted-foreground'>No active services available for this organization.</p>
        <Link
          href='/org'
          className='mt-4 inline-block rounded bg-primary px-4 py-2 text-white hover:bg-primary/90'
        >
          Back to Organizations
        </Link>
      </div>
    )
  }

  const services = servicesResponse?.services

  const activeServices = services
    .filter((service) => service.isActive !== false)
    .map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      avgDurationInt: service.avgDurationInt,
    }))

  return <OrganizationTicketForm organization={organization} services={activeServices} />
}
