// queue-events.listener.ts
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { ServiceRepository } from '@/domain/master/application/repositories/service.repository'
import { TicketRepository } from '@/domain/master/application/repositories/ticket.repository'
import { UserCalledEvent, UserNoShowEvent } from '../queue.events'

@Injectable()
export class QueueEventsListener {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  @OnEvent('queue.user-called')
  async onUserCalled(data: { ticketId: string; payload: UserCalledEvent }) {
    this.server.to(`ticket:${data.ticketId}`).emit('user-called', data.payload)
  }

  @OnEvent('queue.user-no-show')
  async onUserNoShow(data: { ticketId: string; payload: UserNoShowEvent }) {
    this.server.to(`ticket:${data.ticketId}`).emit('user-no-show', data.payload)
  }

  @OnEvent('queue.updated')
  async onQueueUpdated(data: { organizationId: string; serviceId: string }) {
    const [queueLength, service] = await Promise.all([
      this.ticketRepository.count(data.organizationId, {
        serviceId: data.serviceId,
        status: 'WAITING',
        orderBy: 'joinedAt',
        order: 'asc',
      }),
      this.serviceRepository.findById(data.serviceId),
    ])

    let isAlert = false
    if (service?.avgDurationInt && service.alertThresholdMinutes) {
      const estimatedWaitTime = queueLength * service.avgDurationInt
      if (estimatedWaitTime > service.alertThresholdMinutes) {
        isAlert = true
      }
    }

    this.server.to(`org:${data.organizationId}`).emit('queue-updated', {
      organizationId: data.organizationId,
      serviceId: data.serviceId,
      queueLength,
      isAlert,
      timestamp: new Date().toISOString(),
    })
  }
}
