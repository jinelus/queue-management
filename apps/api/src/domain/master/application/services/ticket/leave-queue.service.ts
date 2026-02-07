import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { QUEUE_EVENTS } from '@/infra/events/queue/queue.events'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface LeaveQueueServiceParams {
  ticketId: string
  organizationId: string
}

type LeaveQueueServiceResponse = Either<
  NotFoundError,
  {
    ticket: Ticket
  }
>

@Injectable()
export class LeaveQueueService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute({
    ticketId,
    organizationId,
  }: LeaveQueueServiceParams): Promise<LeaveQueueServiceResponse> {
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

    ticket.status = 'CANCELLED'

    await this.ticketRepository.save(ticket)

    this.eventEmitter.emit(QUEUE_EVENTS.TICKET_LEFT, {
      ticketId: ticket.id.toString(),
      organizationId,
      serviceId: ticket.serviceId.toString(),
    })

    return right({
      ticket,
    })
  }
}
