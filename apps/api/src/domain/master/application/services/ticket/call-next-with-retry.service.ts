import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { QueueEventsListener } from '@/infra/events/queue/listeners/queue-events.listener'
import { PermissionFactory } from '../../permissions/permission.factory'
import { ServiceStaffRepository } from '../../repositories/service-staff.repository'
import { TicketRepository } from '../../repositories/ticket.repository'

interface CallNextWithRetryServiceParams {
  serviceId: string
  staffId: string
  organizationId: string
}

type CallNextWithRetryServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    ticket: Ticket | null
  }
>

@Injectable()
export class CallNextWithRetryService {
  private readonly CALL_TIMEOUT_MS = 5000

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly serviceStaffRepository: ServiceStaffRepository,
    private readonly permissionFactory: PermissionFactory,
    private readonly queueEventsListener: QueueEventsListener,
    @InjectQueue('ticket-call-queue') private readonly ticketCallQueue: Queue,
  ) {}

  async execute({
    serviceId,
    staffId,
    organizationId,
  }: CallNextWithRetryServiceParams): Promise<CallNextWithRetryServiceResponse> {
    const { success } = await this.permissionFactory.userCan('update', 'ticket', {
      userId: staffId,
    })

    if (!success) {
      return left(new NotAllowedError())
    }

    // Check if staff has counter closed
    const staffAssignment = await this.serviceStaffRepository.findByPair(serviceId, staffId)

    if (staffAssignment?.isCounterClosed) {
      return left(new NotAllowedError('Counter is closed. Finish current customers first.'))
    }

    const ticket = await this.ticketRepository.findOldestWaiting(serviceId)

    if (!ticket) {
      return right({ ticket: null })
    }

    ticket.status = 'CALLED'
    ticket.servedById = staffId
    ticket.calledAt = new Date()
    ticket.callCount = 1

    await this.ticketRepository.save(ticket)

    this.queueEventsListener.onUserCalled({
      ticketId: ticket.id.toString(),
      payload: {
        ticketId: ticket.id.toString(),
        position: 1,
        callAttempt: 1,
      },
    })

    await this.scheduleNextCallAttempt(ticket.id.toString(), serviceId, organizationId)

    return right({ ticket })
  }

  async scheduleNextCallAttempt(
    ticketId: string,
    serviceId: string,
    organizationId: string,
  ): Promise<void> {
    const existingJob = await this.ticketCallQueue.getJob(ticketId)
    if (existingJob) {
      await existingJob.remove()
    }

    await this.ticketCallQueue.add(
      'retry',
      { ticketId, serviceId, organizationId },
      {
        jobId: ticketId,
        delay: this.CALL_TIMEOUT_MS,
      },
    )
  }

  async markAsServed(ticketId: string): Promise<void> {
    const job = await this.ticketCallQueue.getJob(ticketId)
    if (job) {
      await job.remove()
    }
  }
}
