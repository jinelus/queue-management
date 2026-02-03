import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'
import { ServiceStaffRepository } from '../../repositories/service-staff.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface ServiceSummary {
  serviceId: string
  serviceName: string
  isActive: boolean
  waitingCount: number
  activeStaffCount: number
  estimatedWaitTime: number | null
  isAlert: boolean
}

interface GetDashboardSummaryServiceParams {
  organizationId: string
  userId: string
}

type GetDashboardSummaryServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    services: ServiceSummary[]
    totalWaiting: number
    totalActiveStaff: number
  }
>

@Injectable()
export class GetDashboardSummaryService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly serviceStaffRepository: ServiceStaffRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    organizationId,
    userId,
  }: GetDashboardSummaryServiceParams): Promise<GetDashboardSummaryServiceResponse> {
    const { success } = await this.permissionFactory.userCan('get', 'service', {
      userId,
    })

    if (!success) {
      return left(new NotAllowedError())
    }

    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    const services = await this.serviceRepository.findAll(organizationId)

    const serviceSummaries: ServiceSummary[] = await Promise.all(
      services.map(async (service) => {
        const [waitingCount, staffAssignments] = await Promise.all([
          this.ticketRepository.count(organizationId, {
            serviceId: service.id.toString(),
            status: 'WAITING',
            orderBy: 'joinedAt',
            order: 'asc',
          }),
          this.serviceStaffRepository.findByServiceId(service.id.toString()),
        ])

        const activeStaffCount = staffAssignments.filter(
          (staff) => staff.active && staff.isOnline && !staff.isCounterClosed,
        ).length

        const avgDuration = service.avgDurationInt ?? 5
        const estimatedWaitTime = waitingCount * avgDuration

        const alertThreshold = service.alertThresholdMinutes ?? 30
        const isAlert = estimatedWaitTime > alertThreshold

        return {
          serviceId: service.id.toString(),
          serviceName: service.name,
          isActive: service.isActive ?? true,
          waitingCount,
          activeStaffCount,
          estimatedWaitTime,
          isAlert,
        }
      }),
    )

    const totalWaiting = serviceSummaries.reduce((sum, s) => sum + s.waitingCount, 0)
    const totalActiveStaff = serviceSummaries.reduce((sum, s) => sum + s.activeStaffCount, 0)

    return right({
      services: serviceSummaries,
      totalWaiting,
      totalActiveStaff,
    })
  }
}
