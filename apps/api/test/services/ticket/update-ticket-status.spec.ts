import { InMemoryOrganizationRepository, InMemoryTicketRepository } from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { UpdateTicketStatusService } from '@/domain/master/application/services/ticket/update-ticket-status.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('UpdateTicketStatusService', () => {
  let sut: UpdateTicketStatusService
  let ticketRepository: InMemoryTicketRepository
  let organizationRepository: InMemoryOrganizationRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    ticketRepository = new InMemoryTicketRepository()
    organizationRepository = new InMemoryOrganizationRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new UpdateTicketStatusService(
      ticketRepository,
      organizationRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to update ticket status to SERVING', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: organization.id.toString(),
      serviceId: 'service-1',
      status: 'CALLED',
    })
    await ticketRepository.create(ticket)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      status: 'SERVING',
      staffId: 'staff-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(ticketRepository.items[0].status).toBe('SERVING')
    expect(ticketRepository.items[0].servedById).toBe('staff-1')
  })

  it('should be able to update ticket status to ABSENT and increment call count', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: organization.id.toString(),
      serviceId: 'service-1',
      status: 'CALLED',
    })
    ticket.callCount = 1
    await ticketRepository.create(ticket)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      status: 'ABSENT',
      staffId: 'staff-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(ticketRepository.items[0].status).toBe('ABSENT')
    expect(ticketRepository.items[0].callCount).toBe(2)
  })

  it('should not be able to update if permission denied', async () => {
    permissionFactory.setPermission(false)

    const result = await sut.execute({
      ticketId: 'ticket-1',
      status: 'SERVING',
      staffId: 'staff-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to update if ticket not found', async () => {
    permissionFactory.setPermission(true)

    const result = await sut.execute({
      ticketId: 'ticket-1',
      status: 'SERVING',
      staffId: 'staff-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
