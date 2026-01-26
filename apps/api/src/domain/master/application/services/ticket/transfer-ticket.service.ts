import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface TransferTicketServiceParams {
  ticketId: string
  targetServiceId: string
  staffId: string
  organizationId: string
}

type TransferTicketServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    ticket: Ticket
  }
>

@Injectable()
export class TransferTicketService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    ticketId,
    targetServiceId,
    staffId,
    organizationId,
  }: TransferTicketServiceParams): Promise<TransferTicketServiceResponse> {
    const { success } = await this.permissionFactory.userCan('update', 'ticket', {
      userId: staffId,
    })

    if (!success) {
      return left(new NotAllowedError())
    }

    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    const ticket = await this.ticketRepository.findById(ticketId)

    if (!ticket) {
      return left(new NotFoundError('Ticket not found'))
    }

    if (ticket.organizationId.toString() !== organization.id.toString()) {
      return left(new NotAllowedError())
    }

    const targetService = await this.serviceRepository.findById(targetServiceId)

    if (!targetService) {
      return left(new NotFoundError('Target service not found'))
    }

    if (targetService.organizationId.toString() !== organization.id.toString()) {
      return left(new NotAllowedError())
    }

    ticket.serviceId = targetServiceId
    ticket.status = 'WAITING'
    ticket.servedById = undefined
    ticket.callCount = 0

    await this.ticketRepository.save(ticket)

    return right({
      ticket,
    })
  }
}
