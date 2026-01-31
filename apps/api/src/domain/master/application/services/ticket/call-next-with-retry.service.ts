import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { QueueEventsListener } from '@/infra/events/queue/listeners/queue-events.listener'
import { PermissionFactory } from '../../permissions/permission.factory'
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
  private readonly MAX_CALL_ATTEMPTS = 3
  private readonly CALL_TIMEOUT_MS = 30000
  private callTimeouts = new Map<string, NodeJS.Timeout>()

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly permissionFactory: PermissionFactory,
    private readonly queueEventsListener: QueueEventsListener,
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

    const ticket = await this.ticketRepository.findOldestWaiting(serviceId)

    if (!ticket) {
      return right({ ticket: null })
    }

    ticket.status = 'CALLED'
    ticket.servedById = staffId
    ticket.calledAt = new Date()
    ticket.callCount = 1

    await this.ticketRepository.save(ticket)

    // Émettre l'événement WebSocket
    this.queueEventsListener.onUserCalled({
      ticketId: ticket.id.toString(),
      payload: {
        ticketId: ticket.id.toString(),
        position: 1,
        callAttempt: 1,
      },
    })

    // Démarrer le retry logic
    this.scheduleNextCallAttempt(ticket.id.toString(), serviceId, organizationId)

    return right({ ticket })
  }

  private scheduleNextCallAttempt(
    ticketId: string,
    serviceId: string,
    organizationId: string,
  ): void {
    // Nettoyer ancien timeout s'il existe
    if (this.callTimeouts.has(ticketId)) {
      clearTimeout(this.callTimeouts.get(ticketId))
    }

    const timeout = setTimeout(async () => {
      const ticket = await this.ticketRepository.findById(ticketId)

      if (!ticket || ticket.status !== 'CALLED') {
        return
      }

      if (ticket.callCount >= this.MAX_CALL_ATTEMPTS) {
        // Marquer comme absent
        ticket.status = 'ABSENT'
        await this.ticketRepository.save(ticket)

        this.queueEventsListener.onUserNoShow({
          ticketId: ticket.id.toString(),
          payload: { ticketId: ticket.id.toString() },
        })

        // Appeler le suivant automatiquement
        const nextTicket = await this.ticketRepository.findOldestWaiting(serviceId)
        if (nextTicket) {
          // Récursif : appeler le suivant
          await this.execute({
            serviceId,
            staffId: ticket.servedById,
            organizationId,
          })
        }

        return
      }

      // Incrémenter et rappeler
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

      this.scheduleNextCallAttempt(ticketId, serviceId, organizationId)
    }, this.CALL_TIMEOUT_MS)

    this.callTimeouts.set(ticketId, timeout)
  }

  // Nettoyer les timeouts si le ticket est servi
  async markAsServed(ticketId: string): Promise<void> {
    if (this.callTimeouts.has(ticketId)) {
      clearTimeout(this.callTimeouts.get(ticketId))
      this.callTimeouts.delete(ticketId)
    }
  }
}
