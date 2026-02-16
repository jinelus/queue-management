import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { PermissionFactory } from '../../permissions/permission.factory'
import { TicketRepository } from '../../repositories/ticket.repository'

interface GetHistoricalStatsServiceParams {
  organizationId: string
  days?: number

  userId: string
}

type GetHistoricalStatsServiceResponse = Either<
  NotAllowedError,
  {
    servedTicketsByDay: { date: string; count: number }[]
    avgDurationByEmployee: {
      employeeId: string
      employeeName: string
      avgDuration: number
    }[]
  }
>

@Injectable()
export class GetHistoricalStatsService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    organizationId,
    days = 7,
    userId,
  }: GetHistoricalStatsServiceParams): Promise<GetHistoricalStatsServiceResponse> {
    const { success } = await this.permissionFactory.userCan('get', 'service', { userId })

    if (!success) {
      return left(new NotAllowedError())
    }

    const requestedDays = Number.isFinite(days) ? days : 7
    const normalizedDays = Math.max(1, Math.min(requestedDays, 365))

    const [servedTicketsByDay, avgDurationByEmployee] = await Promise.all([
      this.ticketRepository.getServedTicketsCountByDay(organizationId, normalizedDays),
      this.ticketRepository.getAverageServiceDuration(organizationId),
    ])

    return right({
      servedTicketsByDay,
      avgDurationByEmployee,
    })
  }
}
