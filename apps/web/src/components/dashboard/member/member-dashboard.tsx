import { getDashboardSummary } from '@/actions/dashboard/get'
import { getServiceStaffByStaffId } from '@/actions/service-staff/get'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MemberDashboardRealtime } from './member-dashboard-realtime'
import { MemberStaffStatusToggle } from './member-staff-status-toggle'

type MemberDashboardProps = {
  organizationId: string
  organizationName?: string
}

export async function MemberDashboard({ organizationId, organizationName }: MemberDashboardProps) {
  const [[summaryError, summaryData], [staffError, staffData]] = await Promise.all([
    getDashboardSummary(organizationId),
    getServiceStaffByStaffId(organizationId),
  ])

  if (summaryError || !summaryData) {
    return (
      <div className='p-4'>
        <p className='text-muted-foreground text-sm'>Failed to load staff dashboard data.</p>
      </div>
    )
  }

  if (staffError || !staffData) {
    return (
      <div className='p-4'>
        <p className='text-muted-foreground text-sm'>Failed to load staff services data.</p>
      </div>
    )
  }

  const servicesById = new Map(summaryData.services.map((service) => [service.serviceId, service]))
  const assignedServices = staffData.servicesStaff.map((staff) => {
    const service = servicesById.get(staff.serviceId)
    return {
      serviceStaffId: staff.id,
      serviceName: service?.serviceName ?? 'Unknown service',
      waitingCount: service?.waitingCount ?? 0,
      estimatedWaitTime: service?.estimatedWaitTime ?? null,
      isAlert: service?.isAlert ?? false,
      isOnline: staff.isOnline ?? false,
      isCounterClosed: staff.isCounterClosed ?? false,
      isActive: service?.isActive ?? false,
    }
  })

  const onlineAssignments = assignedServices.filter((service) => service.isOnline).length
  const offlineAssignments = assignedServices.length - onlineAssignments

  return (
    <div className='space-y-4'>
      <MemberDashboardRealtime organizationId={organizationId} />

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant='secondary'>{organizationName ?? 'Active org'}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Total Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-semibold text-2xl'>{summaryData.totalWaiting}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>My Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-semibold text-2xl'>{assignedServices.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>My Status</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>Online</span>
              <Badge>{onlineAssignments}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>Offline</span>
              <Badge variant='secondary'>{offlineAssignments}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Assigned Services</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedServices.length === 0 ? (
            <div className='rounded-lg border p-6 text-center'>
              <h3 className='font-semibold text-lg'>No assigned services</h3>
              <p className='mt-1 text-muted-foreground text-sm'>
                Ask an admin to assign you to at least one service.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Estimated wait</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedServices.map((service) => (
                  <TableRow key={service.serviceStaffId}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-sm'>{service.serviceName}</span>
                        {service.isAlert && <Badge variant='destructive'>Alert</Badge>}
                        {!service.isActive && <Badge variant='secondary'>Inactive</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {service.waitingCount} waiting
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {service.estimatedWaitTime ? `${service.estimatedWaitTime} min` : '—'}
                    </TableCell>
                    <TableCell>
                      <MemberStaffStatusToggle
                        organizationId={organizationId}
                        serviceStaffId={service.serviceStaffId}
                        isOnline={service.isOnline}
                        isCounterClosed={service.isCounterClosed}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Queue Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryData.services.length === 0 ? (
            <p className='text-muted-foreground text-sm'>No active services found.</p>
          ) : (
            <div className='space-y-2'>
              {summaryData.services.slice(0, 5).map((service) => (
                <div key={service.serviceId} className='flex items-center justify-between'>
                  <span className='text-sm'>{service.serviceName}</span>
                  <Badge variant={service.waitingCount > 0 ? 'default' : 'secondary'}>
                    {service.waitingCount} waiting
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
