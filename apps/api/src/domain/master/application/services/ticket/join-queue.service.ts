import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface JoinQueueServiceParams {
  guestName: string
  organizationId: string
  serviceId: string
}

type JoinQueueServiceResponse = Either<
  NotFoundError | NotAllowedError,
  {
    ticket: Ticket
    position: number | null
    estimatedWaitTime: number | null
  }
>

@Injectable()
export class JoinQueueService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly ticketRepository: TicketRepository,
  ) {}

  async execute({
    guestName,
    organizationId,
    serviceId,
  }: JoinQueueServiceParams): Promise<JoinQueueServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      throw new NotFoundError('Organization not found')
    }
    const service = await this.serviceRepository.findById(serviceId)

    if (!service) {
      throw new NotFoundError('Service not found')
    }

    if (service.organizationId !== organizationId) {
      throw new NotFoundError('Service not found')
    }

    if (!service.isActive) {
      throw new NotAllowedError('Service is not active')
    }

    if (service.maxCapacity) {
      const pendingCount = await this.ticketRepository.count(organizationId, {
        serviceId,
        status: 'WAITING',
        orderBy: 'joinedAt',
        order: 'asc',
      })

      if (pendingCount >= service.maxCapacity) {
        throw new NotAllowedError('Queue is full')
      }
    }

    const ticket = Ticket.create({
      guestName,
      organizationId,
      serviceId,
    })

    await this.ticketRepository.create(ticket)

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
