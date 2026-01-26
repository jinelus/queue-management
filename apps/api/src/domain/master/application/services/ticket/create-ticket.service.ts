import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface CreateTicketServiceParams {
  guestName: string
  organizationId: string
  serviceId: string
}

type CreateTicketServiceResponse = Either<
  null,
  {
    ticket: Ticket
  }
>

@Injectable()
export class CreateTicketService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly ticketRepository: TicketRepository,
  ) {}

  async execute({
    guestName,
    organizationId,
    serviceId,
  }: CreateTicketServiceParams): Promise<CreateTicketServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      throw new Error('Organization not found')
    }

    const ticket = Ticket.create({
      guestName,
      organizationId,
      serviceId,
    })

    await this.ticketRepository.create(ticket)

    return right({
      ticket,
    })
  }
}
