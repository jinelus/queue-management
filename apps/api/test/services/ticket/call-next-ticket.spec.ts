import { InMemoryTicketRepository } from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { CallNextTicketService } from '@/domain/master/application/services/ticket/call-next-ticket.service'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('CallNextTicketService', () => {
  let sut: CallNextTicketService
  let ticketRepository: InMemoryTicketRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    ticketRepository = new InMemoryTicketRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new CallNextTicketService(
      ticketRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to call the next ticket', async () => {
    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: 'org-1',
      serviceId: 'service-1',
    })
    await ticketRepository.create(ticket)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      serviceId: 'service-1',
      staffId: 'staff-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.ticket).toBeInstanceOf(Ticket)
      expect(result.value.ticket?.status).toBe('CALLED')
      expect(result.value.ticket?.servedById).toBe('staff-1')
    }
  })

  it('should not be able to call the next ticket if user does not have permission', async () => {
    permissionFactory.setPermission(false)

    const result = await sut.execute({
      serviceId: 'service-1',
      staffId: 'staff-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should return null if there are no tickets waiting', async () => {
    permissionFactory.setPermission(true)

    const result = await sut.execute({
      serviceId: 'service-1',
      staffId: 'staff-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.ticket).toBeNull()
    }
  })
})
