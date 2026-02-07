import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { QUEUE_EVENTS } from '@/infra/events/queue/queue.events'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface CreateTicketServiceParams {
  guestName: string
  organizationId: string
  serviceId: string
}

type CreateTicketServiceResponse = Either<
  NotFoundError | NotAllowedError,
  {
    ticket: Ticket
    position: number
    estimatedWaitTime: number | null
  }
>

@Injectable()
export class CreateTicketService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute({
    guestName,
    organizationId,
    serviceId,
  }: CreateTicketServiceParams): Promise<CreateTicketServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }
    const service = await this.serviceRepository.findById(serviceId)

    if (!service) {
      return left(new NotFoundError('Service not found'))
    }

    if (service.organizationId !== organizationId) {
      return left(new NotFoundError('Service not found'))
    }

    if (!service.isActive) {
      return left(new NotAllowedError('Service is not active'))
    }

    if (service.maxCapacity !== null && service.maxCapacity !== undefined) {
      const pendingCount = await this.ticketRepository.count(organizationId, {
        serviceId,
        status: 'WAITING',
        orderBy: 'joinedAt',
        order: 'asc',
      })

      if (pendingCount >= service.maxCapacity) {
        return left(new NotAllowedError('Queue is full'))
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

    this.eventEmitter.emit(QUEUE_EVENTS.TICKET_CREATED, {
      ticketId: ticket.id.toString(),
      organizationId,
      serviceId,
      position,
      estimatedWaitTime,
    })

    return right({
      ticket,
      position,
      estimatedWaitTime,
    })
  }
}
