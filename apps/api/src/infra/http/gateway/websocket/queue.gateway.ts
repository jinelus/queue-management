import { Injectable, Logger, OnModuleDestroy, OnModuleInit, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { AllowAnonymous, AuthGuard, OptionalAuth } from '@thallesp/nestjs-better-auth'
import { Server, Socket } from 'socket.io'
import { CallNextWithRetryService } from '@/domain/master/application/services/ticket/call-next-with-retry.service'
import { CreateTicketService } from '@/domain/master/application/services/ticket/create-ticket.service'
import { LeaveQueueService } from '@/domain/master/application/services/ticket/leave-queue.service'
import * as queueTypes from './queue.types'
import { WebSocketBroadcaster } from './websocket-broadcaster.service'

@WebSocketGateway({
  namespace: 'queue',
  cors: { origin: '*' },
})
@UseGuards(AuthGuard)
@Injectable()
export class QueueGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  server: Server

  constructor(
    private readonly createTicketService: CreateTicketService,
    private readonly leaveQueueService: LeaveQueueService,
    private readonly callNextWithRetryService: CallNextWithRetryService,
    private readonly broadcaster: WebSocketBroadcaster,
  ) {}

  onModuleInit() {
    // Share server reference with broadcaster for event handlers to use
    this.broadcaster.setServer(this.server)

    this.server.on('connection', (socket: Socket) => {
      Logger.log(`[Queue] Client connected: ${socket.id}`)
    })
  }

  onModuleDestroy() {
    if (this.server && typeof this.server.close === 'function') {
      this.server.close()
    }
  }

  async handleConnection(client: Socket) {
    const orgId = client.handshake.query.orgId as string
    const ticketId = client.handshake.query.ticketId as string

    Logger.log(`[Queue] Joining rooms - Org: ${orgId}, Ticket: ${ticketId}`)

    if (orgId) {
      client.join(`org:${orgId}`)
    }
    if (ticketId) {
      client.join(`ticket:${ticketId}`)
    }
  }

  handleDisconnect(client: Socket) {
    Logger.log(`[Queue] Client disconnected: ${client.id}`)
  }

  @AllowAnonymous()
  @SubscribeMessage('join-queue')
  async handleJoinQueue(
    @MessageBody() data: queueTypes.JoinQueuePayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.createTicketService.execute({
        guestName: data.guestName,
        organizationId: data.organizationId,
        serviceId: data.serviceId,
      })

      if (result.isRight()) {
        const { ticket, position, estimatedWaitTime } = result.value

        client.join(`ticket:${ticket.id}`)

        client.emit('ticket-created', {
          ticketId: ticket.id.toString(),
          position,
          estimatedWaitTime,
        })
        // Event is now emitted by CreateTicketService
      } else {
        const error = result.value
        client.emit('error', { message: error.message })
        Logger.error(`[Queue] Join queue failed: ${error.message}`)
      }
    } catch (error) {
      client.emit('error', { message: 'Failed to join queue' })
      Logger.error('[Queue] Error joining queue:', error)
    }
  }

  @SubscribeMessage('call-next')
  async handleCallNext(
    @MessageBody() data: queueTypes.CallNextPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.callNextWithRetryService.execute({
        serviceId: data.serviceId,
        staffId: data.staffId,
        organizationId: data.organizationId,
      })

      if (result.isRight() && result.value.ticket) {
        const { ticket } = result.value

        client.emit('next-called', { ticketId: ticket.id.toString() })
        // Event is now emitted by CallNextWithRetryService
      } else if (result.isRight() && !result.value.ticket) {
        client.emit('queue-empty', { message: 'No tickets waiting' })
      } else {
        client.emit('error', { message: 'Not authorized' })
      }
    } catch (error) {
      client.emit('error', { message: 'Failed to call next' })
      Logger.error('[Queue] Error calling next:', error)
    }
  }

  @AllowAnonymous()
  @SubscribeMessage('leave-queue')
  async handleLeaveQueue(
    @MessageBody() data: queueTypes.LeaveQueuePayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.leaveQueueService.execute({
        ticketId: data.ticketId,
        organizationId: data.organizationId,
      })

      if (result.isRight()) {
        const { ticket } = result.value

        client.emit('left-queue', { ticketId: ticket.id.toString() })
        // Event is now emitted by LeaveQueueService
      } else {
        client.emit('error', { message: 'Failed to leave queue' })
      }
    } catch (error) {
      client.emit('error', { message: 'Failed to leave queue' })
      Logger.error('[Queue] Error leaving queue:', error)
    }
  }

  @OptionalAuth()
  @SubscribeMessage('get-queue-status')
  async handleGetQueueStatus(
    @MessageBody() data: { organizationId: string; serviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.emit('queue-status', {
      organizationId: data.organizationId,
      serviceId: data.serviceId,
      timestamp: new Date().toISOString(),
      // TODO: Add actual queue data (position count, etc.)
    })
  }
}
