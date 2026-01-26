import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket, TicketStatus } from '@/domain/master/entreprise/entities/ticket'
import { PermissionFactory } from '../../permissions/permission.factory'
import { TicketRepository } from '../../repositories/ticket.repository'

interface UpdateTicketStatusServiceParams {
  ticketId: string
  status: TicketStatus
  staffId: string
}

type UpdateTicketStatusServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    ticket: Ticket
  }
>

@Injectable()
export class UpdateTicketStatusService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    ticketId,
    status,
    staffId,
  }: UpdateTicketStatusServiceParams): Promise<UpdateTicketStatusServiceResponse> {
    const { success } = await this.permissionFactory.userCan('update', 'ticket', {
      userId: staffId,
    })

    if (!success) {
      return left(new NotAllowedError())
    }

    const ticket = await this.ticketRepository.findById(ticketId)

    if (!ticket) {
      return left(new NotFoundError())
    }

    ticket.status = status

    // Logic for specific statuses
    if (status === 'SERVING') {
      ticket.servedById = staffId
    }

    // Logic for ABSENT count
    if (status === 'ABSENT') {
      ticket.callCount = ticket.callCount + 1
    }

    await this.ticketRepository.save(ticket)

    return right({
      ticket,
    })
  }
}
