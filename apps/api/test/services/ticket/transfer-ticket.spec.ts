import {
  InMemoryOrganizationRepository,
  InMemoryServiceRepository,
  InMemoryServiceStaffRepository,
  InMemoryTicketRepository,
  InMemoryUserRepository,
} from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { TransferTicketService } from '@/domain/master/application/services/ticket/transfer-ticket.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('TransferTicketService', () => {
  let sut: TransferTicketService
  let organizationRepository: InMemoryOrganizationRepository
  let ticketRepository: InMemoryTicketRepository
  let serviceRepository: InMemoryServiceRepository
  let serviceStaffRepository: InMemoryServiceStaffRepository
  let userRepository: InMemoryUserRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository()
    ticketRepository = new InMemoryTicketRepository()
    serviceRepository = new InMemoryServiceRepository()
    serviceStaffRepository = new InMemoryServiceStaffRepository()
    userRepository = new InMemoryUserRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new TransferTicketService(
      organizationRepository,
      ticketRepository,
      serviceRepository,
      serviceStaffRepository,
      userRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to transfer a ticket', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
      ownerId: 'user-1',
    })
    await organizationRepository.create(organization)

    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: organization.id.toString(),
      serviceId: 'service-1',
    })
    ticket.status = 'CALLED'
    ticket.servedById = 'staff-1'
    ticket.callCount = 1
    await ticketRepository.create(ticket)

    const targetService = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 2',
      isActive: true,
    })
    await serviceRepository.create(targetService)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      targetServiceId: targetService.id.toString(),
      staffId: 'staff-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(ticketRepository.items[0].serviceId).toBe(targetService.id.toString())
    expect(ticketRepository.items[0].status).toBe('WAITING')
    expect(ticketRepository.items[0].servedById).toBeUndefined()
    expect(ticketRepository.items[0].callCount).toBe(0)
  })

  it('should not be able to transfer if permission denied', async () => {
    permissionFactory.setPermission(false)

    const result = await sut.execute({
      ticketId: 'ticket-1',
      targetServiceId: 'service-2',
      staffId: 'staff-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to transfer if organization not found', async () => {
    permissionFactory.setPermission(true)

    const result = await sut.execute({
      ticketId: 'ticket-1',
      targetServiceId: 'service-2',
      staffId: 'staff-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to transfer if ticket not found', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
      ownerId: 'user-1',
    })
    await organizationRepository.create(organization)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      ticketId: 'ticket-1',
      targetServiceId: 'service-2',
      staffId: 'staff-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to transfer if target service not found', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
      ownerId: 'user-1',
    })
    await organizationRepository.create(organization)

    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: organization.id.toString(),
      serviceId: 'service-1',
    })
    await ticketRepository.create(ticket)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      targetServiceId: 'service-2',
      staffId: 'staff-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
