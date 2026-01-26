import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { TicketRepository } from '../../repositories/ticket.repository'

interface LeaveQueueServiceParams {
  ticketId: string
}

type LeaveQueueServiceResponse = Either<
  NotFoundError,
  {
    ticket: Ticket
  }
>

@Injectable()
export class LeaveQueueService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async execute({ ticketId }: LeaveQueueServiceParams): Promise<LeaveQueueServiceResponse> {
    const ticket = await this.ticketRepository.findById(ticketId)

    if (!ticket) {
      return left(new NotFoundError())
    }

    ticket.status = 'CANCELLED'

    await this.ticketRepository.save(ticket)

    return right({
      ticket,
    })
  }
}
