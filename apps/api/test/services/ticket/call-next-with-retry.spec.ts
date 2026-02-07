import { EventEmitter2 } from '@nestjs/event-emitter'
import { InMemoryServiceStaffRepository, InMemoryTicketRepository } from '@test/repositories'
import type { Queue } from 'bullmq'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { CallNextWithRetryService } from '@/domain/master/application/services/ticket/call-next-with-retry.service'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import type { QueueEventsListener } from '@/infra/events/queue/listeners/queue-events.listener'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('CallNextWithRetryService', () => {
  let sut: CallNextWithRetryService
  let ticketRepository: InMemoryTicketRepository
  let serviceStaffRepository: InMemoryServiceStaffRepository
  let permissionFactory: FakePermissionFactory
  let queueEventsListener: QueueEventsListener
  let eventEmitter: EventEmitter2
  let ticketCallQueue: { add: ReturnType<typeof vi.fn>; getJob: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    ticketRepository = new InMemoryTicketRepository()
    serviceStaffRepository = new InMemoryServiceStaffRepository()
    permissionFactory = new FakePermissionFactory()
    queueEventsListener = {
      onUserCalled: vi.fn(),
    } as unknown as QueueEventsListener
    eventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2
    ticketCallQueue = {
      add: vi.fn(),
      getJob: vi.fn(),
    }

    sut = new CallNextWithRetryService(
      ticketRepository,
      serviceStaffRepository,
      permissionFactory as unknown as PermissionFactory,
      queueEventsListener,
      eventEmitter,
      ticketCallQueue as unknown as Queue,
    )
  })

  it('should be able to call the next ticket and schedule retry', async () => {
    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: 'org-1',
      serviceId: 'service-1',
    })
    await ticketRepository.create(ticket)

    permissionFactory.setPermission(true)
    ticketCallQueue.getJob.mockResolvedValue(null)

    const result = await sut.execute({
      serviceId: 'service-1',
      staffId: 'staff-1',
      organizationId: 'org-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.ticket).toBeInstanceOf(Ticket)
      expect(result.value.ticket?.status).toBe('CALLED')
    }
    expect(ticketRepository.items[0].status).toBe('CALLED')
    expect(queueEventsListener.onUserCalled).toHaveBeenCalled()
    expect(ticketCallQueue.add).toHaveBeenCalledWith(
      'retry',
      expect.anything(),
      expect.objectContaining({
        jobId: ticket.id.toString(),
        delay: 5000,
      }),
    )
  })

  it('should remove existing job before scheduling retry', async () => {
    const ticket = Ticket.create({
      guestName: 'John Doe',
      organizationId: 'org-1',
      serviceId: 'service-1',
    })
    await ticketRepository.create(ticket)

    const mockJob = { remove: vi.fn() }

    permissionFactory.setPermission(true)
    ticketCallQueue.getJob.mockResolvedValue(mockJob)

    await sut.execute({
      serviceId: 'service-1',
      staffId: 'staff-1',
      organizationId: 'org-1',
    })

    expect(mockJob.remove).toHaveBeenCalled()
    expect(ticketCallQueue.add).toHaveBeenCalled()
  })

  it('should fail if permission denied', async () => {
    permissionFactory.setPermission(false)

    const result = await sut.execute({
      serviceId: 'service-1',
      staffId: 'staff-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
