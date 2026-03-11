import { ArrowLeftIcon, UsersIcon } from 'lucide-react'
import { Route } from 'next'
import Link from 'next/link'
import { getCurrentMember, listMembers } from '@/actions/members'
import { getServicesStaffByServiceIds, listServices } from '@/actions/services'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AssignStaffDialog } from './assign-staff-dialog'
import { CreateServiceDialog } from './create-service-dialog'
import { DeleteServiceButton } from './delete-service-button'
import { ServiceToggle } from './service-toggle'

export const ManageServices = async (props: PageProps<'/[slug]/services'>) => {
  const { slug } = await props.params

  const { organization } = await getCurrentMember({ organizationSlug: slug })

  if (!organization) {
    return (
      <div className='p-4'>
        <p className='text-muted-foreground text-sm'>Organization not found.</p>
      </div>
    )
  }

  const { services } = await listServices(organization.id)

  const { members } = await listMembers({ organizationSlug: slug })
  const staffList = members.map((m) => ({
    id: m.userId,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
  }))

  const serviceIds = services.map((s) => s.id)
  const { servicesStaff } = serviceIds.length
    ? await getServicesStaffByServiceIds(organization.id, serviceIds)
    : { servicesStaff: [] }

  const assignedStaffByService = new Map<string, string[]>()
  for (const ss of servicesStaff) {
    const list = assignedStaffByService.get(ss.serviceId) ?? []
    list.push(ss.userId)
    assignedStaffByService.set(ss.serviceId, list)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' asChild>
            <Link href={`/${slug}` as Route}>
              <ArrowLeftIcon />
            </Link>
          </Button>
          <div>
            <h1 className='font-semibold text-2xl'>Services</h1>
            <p className='text-muted-foreground text-sm'>
              {services.length} {services.length === 1 ? 'service' : 'services'}
            </p>
          </div>
        </div>
        <CreateServiceDialog organizationId={organization.id} />
      </div>

      <div className='hidden md:block'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Avg Duration</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium text-sm'>{service.name}</span>
                    {service.description && (
                      <span className='text-muted-foreground text-xs'>{service.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <ServiceToggle
                      organizationId={organization.id}
                      serviceId={service.id}
                      isActive={service.isActive ?? false}
                    />
                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  {service.maxCapacity ?? '—'}
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  {service.avgDurationInt ? `${service.avgDurationInt} min` : '—'}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    <AssignStaffDialog
                      organizationId={organization.id}
                      serviceId={service.id}
                      serviceName={service.name}
                      members={staffList}
                      assignedStaffIds={assignedStaffByService.get(service.id) ?? []}
                      trigger={
                        <Button variant='ghost' size='icon'>
                          <UsersIcon className='size-4' />
                        </Button>
                      }
                    />
                    <DeleteServiceButton
                      organizationId={organization.id}
                      serviceId={service.id}
                      serviceName={service.name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='grid gap-3 md:hidden'>
        {services.map((service) => (
          <Card key={service.id} className='py-4'>
            <CardContent className='space-y-3 px-4'>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col'>
                  <span className='font-medium text-sm'>{service.name}</span>
                  {service.description && (
                    <span className='text-muted-foreground text-xs'>{service.description}</span>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <ServiceToggle
                    organizationId={organization.id}
                    serviceId={service.id}
                    isActive={service.isActive ?? false}
                  />
                  <Badge variant={service.isActive ? 'default' : 'secondary'}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className='flex items-center justify-between text-muted-foreground text-xs'>
                <span>Capacity: {service.maxCapacity ?? '—'}</span>
                <span>Avg: {service.avgDurationInt ? `${service.avgDurationInt} min` : '—'}</span>
              </div>
              <div className='flex items-center gap-1'>
                <AssignStaffDialog
                  organizationId={organization.id}
                  serviceId={service.id}
                  serviceName={service.name}
                  members={staffList}
                  assignedStaffIds={assignedStaffByService.get(service.id) ?? []}
                  trigger={
                    <Button variant='ghost' size='sm'>
                      <UsersIcon className='size-4' />
                      Assign staff
                    </Button>
                  }
                />
                <DeleteServiceButton
                  organizationId={organization.id}
                  serviceId={service.id}
                  serviceName={service.name}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className='rounded-lg border p-8 text-center'>
          <h3 className='font-semibold text-lg'>No services yet</h3>
          <p className='mt-1 text-muted-foreground text-sm'>
            Create your first service to start managing your queues.
          </p>
        </div>
      )}
    </div>
  )
}
