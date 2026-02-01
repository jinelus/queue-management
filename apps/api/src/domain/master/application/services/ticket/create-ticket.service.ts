import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
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

    if (service.organizationId !== organizationId) {
      throw new NotFoundError('Service not found')
    }

    if (!service.isActive) {
      throw new NotAllowedError('Service is not active')
    }

    if (service.maxCapacity !== null && service.maxCapacity !== undefined) {
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

    return right({
      ticket,
    })
  }
}
