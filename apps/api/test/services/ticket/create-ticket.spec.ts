import {
  InMemoryOrganizationRepository,
  InMemoryServiceRepository,
  InMemoryTicketRepository,
} from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { CreateTicketService } from '@/domain/master/application/services/ticket/create-ticket.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'

describe('CreateTicketService', () => {
  let sut: CreateTicketService
  let organizationRepository: InMemoryOrganizationRepository
  let serviceRepository: InMemoryServiceRepository
  let ticketRepository: InMemoryTicketRepository

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository()
    serviceRepository = new InMemoryServiceRepository()
    ticketRepository = new InMemoryTicketRepository()

    sut = new CreateTicketService(organizationRepository, serviceRepository, ticketRepository)
  })

  it('should be able to create a ticket', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 1',
      isActive: true,
    })
    await serviceRepository.create(service)

    const result = await sut.execute({
      guestName: 'John Doe',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      ticket: expect.any(Ticket),
    })
    expect(ticketRepository.items).toHaveLength(1)
  })

  it('should not be able to create a ticket if organization does not exist', async () => {
    await expect(
      sut.execute({
        guestName: 'John Doe',
        organizationId: 'fake-org-id',
        serviceId: 'fake-service-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('should not be able to create a ticket if service does not exist', async () => {
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

  it('should not be able to create a ticket if service belongs to another organization', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: 'other-org-id',
      name: 'Service 1',
      isActive: true,
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

  it('should not be able to create a ticket if service is not active', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 1',
      isActive: false,
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

  it('should not be able to create a ticket if queue is full', async () => {
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
