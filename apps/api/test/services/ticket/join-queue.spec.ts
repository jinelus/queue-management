import {
  InMemoryOrganizationRepository,
  InMemoryServiceRepository,
  InMemoryTicketRepository,
} from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { JoinQueueService } from '@/domain/master/application/services/ticket/join-queue.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'

describe('JoinQueueService', () => {
  let sut: JoinQueueService
  let organizationRepository: InMemoryOrganizationRepository
  let serviceRepository: InMemoryServiceRepository
  let ticketRepository: InMemoryTicketRepository

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository()
    serviceRepository = new InMemoryServiceRepository()
    ticketRepository = new InMemoryTicketRepository()

    sut = new JoinQueueService(organizationRepository, serviceRepository, ticketRepository)
  })

  it('should be able to join a queue', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 1',
      isActive: true,
      avgDurationInt: 10,
      description: 'Service 1',
    })
    await serviceRepository.create(service)

    // Add 2 waiting tickets
    for (let i = 0; i < 2; i++) {
      const existingTicket = Ticket.create({
        guestName: `Guest ${i}`,
        organizationId: organization.id.toString(),
        serviceId: service.id.toString(),
        joinedAt: new Date(Date.now() - (3 - i) * 60000), // Joined earlier
        status: 'WAITING',
      })
      await ticketRepository.create(existingTicket)
    }

    const result = await sut.execute({
      guestName: 'John Doe',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.ticket).toBeInstanceOf(Ticket)
      expect(result.value.position).toBe(3)
      expect(result.value.estimatedWaitTime).toBe(30)
    }
    expect(ticketRepository.items).toHaveLength(3)
  })

  it('should not be able to join a queue if organization does not exist', async () => {
    await expect(
      sut.execute({
        guestName: 'John Doe',
        organizationId: 'fake-org-id',
        serviceId: 'fake-service-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('should not be able to join a queue if service does not exist', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    await expect(
      sut.execute({
        guestName: 'John Doe',
        organizationId: organization.id.toString(),
        serviceId: 'fake-service-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('should not be able to join a queue if service belongs to another organization', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: 'other-org-id',
      name: 'Service 1',
      isActive: true,
      description: 'Service 1',
    })
    await serviceRepository.create(service)

    await expect(
      sut.execute({
        guestName: 'John Doe',
        organizationId: organization.id.toString(),
        serviceId: service.id.toString(),
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('should not be able to join a queue if service is not active', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 1',
      isActive: false,
      description: 'Service 1',
    })
    await serviceRepository.create(service)

    await expect(
      sut.execute({
        guestName: 'John Doe',
        organizationId: organization.id.toString(),
        serviceId: service.id.toString(),
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to join a queue if full', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 1',
      isActive: true,
      maxCapacity: 2,
      description: 'Service 1',
    })
    await serviceRepository.create(service)

    // Fill queue to capacity
    for (let i = 0; i < 2; i++) {
      const ticket = Ticket.create({
        guestName: `Guest ${i}`,
        organizationId: organization.id.toString(),
        serviceId: service.id.toString(),
      })
      await ticketRepository.create(ticket)
    }

    await expect(
      sut.execute({
        guestName: 'John Doe',
        organizationId: organization.id.toString(),
        serviceId: service.id.toString(),
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
