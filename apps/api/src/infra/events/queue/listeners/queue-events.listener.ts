// queue-events.listener.ts
import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ServiceRepository } from '@/domain/master/application/repositories/service.repository'
import { TicketRepository } from '@/domain/master/application/repositories/ticket.repository'
import { WebSocketBroadcaster } from '@/infra/http/gateway/websocket/websocket-broadcaster.service'
import {
  QUEUE_EVENTS,
  type QueueUpdatedEvent,
  type TicketCalledEvent,
  type TicketCreatedEvent,
  type TicketLeftEvent,
  UserCalledEvent,
  UserNoShowEvent,
} from '../queue.events'

@Injectable()
export class QueueEventsListener {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly broadcaster: WebSocketBroadcaster,
  ) {}

  @OnEvent(QUEUE_EVENTS.USER_CALLED)
  async onUserCalled(data: { ticketId: string; payload: UserCalledEvent }) {
    this.broadcaster.broadcastToTicket(data.ticketId, 'user-called', data.payload)
  }

  @OnEvent(QUEUE_EVENTS.USER_NO_SHOW)
  async onUserNoShow(data: { ticketId: string; payload: UserNoShowEvent }) {
    this.broadcaster.broadcastToTicket(data.ticketId, 'user-no-show', data.payload)
  }

  @OnEvent(QUEUE_EVENTS.TICKET_CREATED)
  async onTicketCreated(data: TicketCreatedEvent) {
    Logger.log(`[QueueEvents] Ticket created: ${data.ticketId}`)
    await this.broadcastQueueUpdate(data.organizationId, data.serviceId)
  }

  @OnEvent(QUEUE_EVENTS.TICKET_CALLED)
  async onTicketCalled(data: TicketCalledEvent) {
    Logger.log(`[QueueEvents] Ticket called: ${data.ticketId}`)
    await this.broadcastQueueUpdate(data.organizationId, data.serviceId)
  }

  @OnEvent(QUEUE_EVENTS.TICKET_LEFT)
  async onTicketLeft(data: TicketLeftEvent) {
    Logger.log(`[QueueEvents] Ticket left queue: ${data.ticketId}`)
    await this.broadcastQueueUpdate(data.organizationId, data.serviceId)
  }

  @OnEvent(QUEUE_EVENTS.QUEUE_UPDATED)
  async onQueueUpdated(data: QueueUpdatedEvent) {
    await this.broadcastQueueUpdate(data.organizationId, data.serviceId)
  }

  private async broadcastQueueUpdate(organizationId: string, serviceId: string) {
    const [queueLength, service] = await Promise.all([
      this.ticketRepository.count(organizationId, {
        serviceId,
        status: 'WAITING',
        orderBy: 'joinedAt',
        order: 'asc',
      }),
      this.serviceRepository.findById(serviceId),
    ])

    let isAlert = false
    if (service?.avgDurationInt && service.alertThresholdMinutes) {
      const estimatedWaitTime = queueLength * service.avgDurationInt
      if (estimatedWaitTime > service.alertThresholdMinutes) {
        isAlert = true
      }
    }

    this.broadcaster.broadcastToOrg(organizationId, 'queue-updated', {
      organizationId,
      serviceId,
      queueLength,
      isAlert,
      timestamp: new Date().toISOString(),
    })
  }
}
