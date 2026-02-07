import { EventEmitter2 } from '@nestjs/event-emitter'
import { InMemoryOrganizationRepository, InMemoryTicketRepository } from '@test/repositories'
import { NotFoundError } from '@/core/errors/not-found-error'
import { LeaveQueueService } from '@/domain/master/application/services/ticket/leave-queue.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { QUEUE_EVENTS } from '@/infra/events/queue/queue.events'

describe('LeaveQueueService', () => {
  let sut: LeaveQueueService
  let ticketRepository: InMemoryTicketRepository
  let organizationRepository: InMemoryOrganizationRepository
  let eventEmitter: EventEmitter2

  beforeEach(() => {
    ticketRepository = new InMemoryTicketRepository()
    organizationRepository = new InMemoryOrganizationRepository()
    eventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2

    sut = new LeaveQueueService(ticketRepository, organizationRepository, eventEmitter)
  })

  it('should be able to leave the queue', async () => {
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
    await ticketRepository.create(ticket)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(ticketRepository.items[0].status).toBe('CANCELLED')
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      QUEUE_EVENTS.TICKET_LEFT,
      expect.objectContaining({
        ticketId: ticket.id.toString(),
        organizationId: organization.id.toString(),
        serviceId: 'service-1',
      }),
    )
  })

  it('should not be able to leave the queue if ticket does not exist', async () => {
    const result = await sut.execute({
      ticketId: 'fake-ticket-id',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to leave the queue if organization does not exist', async () => {
    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: 'org-1',
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

  it('should not be able to leave the queue if ticket belongs to another organization', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: 'other-org-id',
      serviceId: 'service-1',
    })
    await ticketRepository.create(ticket)

    const result = await sut.execute({
      ticketId: ticket.id.toString(),
      organizationId: organization.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
