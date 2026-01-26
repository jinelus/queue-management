import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface CreateTicketServiceParams {
  guestName: string
  organizationId: string
  serviceId: string
}

type CreateTicketServiceResponse = Either<
  NotFoundError,
  {
    ticket: Ticket
  }
>

@Injectable()
export class CreateTicketService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly ticketRepository: TicketRepository,
  ) {}

  async execute({
    guestName,
    organizationId,
    serviceId,
  }: CreateTicketServiceParams): Promise<CreateTicketServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      throw new NotFoundError('Organization not found')
    }
    const service = await this.serviceRepository.findById(serviceId)

    if (!service) {
      throw new NotFoundError('Service not found')
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
