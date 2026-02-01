import { Processor, WorkerHost } from '@nestjs/bullmq'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { Job } from 'bullmq'
import { TicketRepository } from '@/domain/master/application/repositories/ticket.repository'
import { CallNextWithRetryService } from '@/domain/master/application/services/ticket/call-next-with-retry.service'
import { QueueEventsListener } from '@/infra/events/queue/listeners/queue-events.listener'

export interface TicketCallJobData {
  ticketId: string
  serviceId: string
  organizationId: string
}

@Processor('ticket-call-queue')
@Injectable()
export class TicketCallProcessor extends WorkerHost {
  private readonly MAX_CALL_ATTEMPTS = 3

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly queueEventsListener: QueueEventsListener,
    @Inject(forwardRef(() => CallNextWithRetryService))
    private readonly callNextWithRetryService: CallNextWithRetryService,
  ) {
    super()
  }

  async process(job: Job<TicketCallJobData>): Promise<void> {
    const { ticketId, serviceId, organizationId } = job.data
    const ticket = await this.ticketRepository.findById(ticketId)

    if (!ticket || ticket.status !== 'CALLED') {
      return
    }

    if (ticket.callCount >= this.MAX_CALL_ATTEMPTS) {
      ticket.status = 'ABSENT'
      await this.ticketRepository.save(ticket)

      this.queueEventsListener.onUserNoShow({
        ticketId: ticket.id.toString(),
        payload: { ticketId: ticket.id.toString() },
      })

      const nextTicket = await this.ticketRepository.findOldestWaiting(serviceId)
      if (nextTicket && ticket.servedById) {
        await this.callNextWithRetryService.execute({
          serviceId,
          staffId: ticket.servedById,
          organizationId,
        })
      }

      return
    }

    ticket.callCount += 1
    await this.ticketRepository.save(ticket)

    this.queueEventsListener.onUserCalled({
      ticketId: ticket.id.toString(),
      payload: {
        ticketId: ticket.id.toString(),
        position: 1,
        callAttempt: ticket.callCount,
      },
    })

    await this.callNextWithRetryService.scheduleNextCallAttempt(ticketId, serviceId, organizationId)
  }
}
