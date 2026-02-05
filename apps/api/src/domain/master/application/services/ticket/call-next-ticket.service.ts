import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { PermissionFactory } from '../../permissions/permission.factory'
import { TicketRepository } from '../../repositories/ticket.repository'

interface CallNextTicketServiceParams {
  serviceId: string
  staffId: string
}

type CallNextTicketServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    ticket: Ticket | null
  }
>

@Injectable()
export class CallNextTicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    serviceId,
    staffId,
  }: CallNextTicketServiceParams): Promise<CallNextTicketServiceResponse> {
    const { success } = await this.permissionFactory.userCan('update', 'ticket', {
      userId: staffId,
    })

    if (!success) {
      return left(new NotAllowedError())
    }

    const ticket = await this.ticketRepository.atomicClaimOldestWaiting(serviceId, staffId)

    if (!ticket) {
      return right({ ticket: null })
    }

    return right({
      ticket,
    })
  }
}
