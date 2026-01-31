// queue-events.listener.ts
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { UserCalledEvent, UserNoShowEvent } from '../queue.events'

@WebSocketGateway({
  namespace: 'queue',
  cors: { origin: '*' },
})
@Injectable()
export class QueueEventsListener {
  @WebSocketServer()
  server: Server

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
    this.server.to(`org:${data.organizationId}`).emit('queue-updated', {
      organizationId: data.organizationId,
      serviceId: data.serviceId,
      timestamp: new Date().toISOString(),
    })
  }
}
