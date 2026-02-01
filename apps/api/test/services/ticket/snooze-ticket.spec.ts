import { InMemoryTicketRepository } from '@test/repositories'
import { NotFoundError } from '@/core/errors/not-found-error'
import { SnoozeTicketService } from '@/domain/master/application/services/ticket/snooze-ticket.service'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'

describe('SnoozeTicketService', () => {
  let sut: SnoozeTicketService
  let ticketRepository: InMemoryTicketRepository

  beforeEach(() => {
    ticketRepository = new InMemoryTicketRepository()

    sut = new SnoozeTicketService(ticketRepository)
  })

  it('should be able to snooze a ticket', async () => {
    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: 'org-1',
      serviceId: 'service-1',
    })
    await ticketRepository.create(ticket)
    const initialJoinedAt = ticket.joinedAt

    // Wait a bit to ensure joinedAt changes
    await new Promise((resolve) => setTimeout(resolve, 10))

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      organizationId: 'org-1',
    })

    expect(result.isRight()).toBe(true)
    expect(ticketRepository.items[0].joinedAt.getTime()).toBeGreaterThan(initialJoinedAt.getTime())
  })

  it('should not be able to snooze a ticket if it does not exist', async () => {
    const result = await sut.execute({
      ticketId: 'fake-ticket-id',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to snooze a ticket from another organization', async () => {
    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: 'other-org-id',
      serviceId: 'service-1',
    })
    await ticketRepository.create(ticket)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to snooze a ticket that is not waiting', async () => {
    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: 'org-1',
      serviceId: 'service-1',
    })
    ticket.status = 'CALLED'
    await ticketRepository.create(ticket)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(Error)
  })
})
