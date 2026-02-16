import {
  InMemoryOrganizationRepository,
  InMemoryServiceRepository,
  InMemoryTicketRepository,
} from '@test/repositories'
import { GetTicketPositionService } from '@/domain/master/application/services/ticket/get-ticket-position.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'

describe('GetTicketPositionService', () => {
  let sut: GetTicketPositionService
  let ticketRepository: InMemoryTicketRepository
  let serviceRepository: InMemoryServiceRepository
  let organizationRepository: InMemoryOrganizationRepository

  beforeEach(() => {
    ticketRepository = new InMemoryTicketRepository()
    serviceRepository = new InMemoryServiceRepository()
    organizationRepository = new InMemoryOrganizationRepository()

    sut = new GetTicketPositionService(ticketRepository, serviceRepository, organizationRepository)
  })

  it('should be able to get ticket position and estimated wait time', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: organization.id.toString(),
      description: 'Service 1',
      name: 'Service 1',
      isActive: true,
      avgDurationInt: 5,
    })
    await serviceRepository.create(service)

    // Create 2 tickets before the target ticket
    const precedingTicket1 = Ticket.create({
      guestName: 'First Person',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
      joinedAt: new Date(),
    })
    await ticketRepository.create(precedingTicket1)

    const precedingTicket2 = Ticket.create({
      guestName: 'Second Person',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
      joinedAt: new Date(),
    })
    await ticketRepository.create(precedingTicket2)

    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
      joinedAt: new Date(Date.now() + 1000), // Joined after the preceding tickets
    })
    await ticketRepository.create(ticket)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.position).toBe(3)
      expect(result.value.estimatedWaitTime).toBe(15)
    }
  })

  it('should return nulls if ticket is not waiting', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: organization.id.toString(),
      serviceId: 'service-1',
    })
    ticket.status = 'CALLED'
    await ticketRepository.create(ticket)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.position).toBe(0)
      expect(result.value.estimatedWaitTime).toBe(0)
    }
  })
})
