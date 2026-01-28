import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface GetTicketPositionServiceParams {
  ticketId: string
  organizationId: string
}

type GetTicketPositionServiceResponse = Either<
  NotFoundError,
  {
    ticket: Ticket
    position: number | null
    estimatedWaitTime: number | null
  }
>

@Injectable()
export class GetTicketPositionService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    ticketId,
    organizationId,
  }: GetTicketPositionServiceParams): Promise<GetTicketPositionServiceResponse> {
    const ticket = await this.ticketRepository.findById(ticketId)

    if (!ticket) {
      return left(new NotFoundError())
    }

    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    if (ticket.organizationId.toString() !== organization.id.toString()) {
      return left(new NotFoundError('Ticket does not belong to the organization'))
    }

    if (ticket.status !== 'WAITING') {
      return right({
        ticket,
        position: null,
        estimatedWaitTime: null,
      })
    }

    const service = await this.serviceRepository.findById(ticket.serviceId)

    if (!service) {
      return left(new NotFoundError())
    }

    const positionCount = await this.ticketRepository.countPreceding(
      ticket.serviceId,
      ticket.joinedAt,
    )
    const position = positionCount + 1

    let estimatedWaitTime: number | null = null

    if (service.avgDurationInt) {
      estimatedWaitTime = position * service.avgDurationInt
    }

    return right({
      ticket,
      position,
      estimatedWaitTime,
    })
  }
}
