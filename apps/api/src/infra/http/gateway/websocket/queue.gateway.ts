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
import { JoinQueueService } from '@/domain/master/application/services/ticket/join-queue.service'
import { LeaveQueueService } from '@/domain/master/application/services/ticket/leave-queue.service'
import * as queueTypes from './queue.types'

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
    private readonly joinQueueService: JoinQueueService,
    private readonly leaveQueueService: LeaveQueueService,
    private readonly callNextWithRetryService: CallNextWithRetryService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      Logger.log(`[Queue] Client connected: ${socket.id}`)
    })
  }

  onModuleDestroy() {
    this.server.close()
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
      const result = await this.joinQueueService.execute({
        guestName: data.guestName,
        organizationId: data.organizationId,
        serviceId: data.serviceId,
      })

      if (result.isRight()) {
        const { ticket, position, estimatedWaitTime } = result.value

        // Faire rejoindre le client à la room du ticket
        client.join(`ticket:${ticket.id}`)

        // Notifier le client de son ticket
        client.emit('ticket-created', {
          ticketId: ticket.id.toString(),
          position,
          estimatedWaitTime,
        })

        // Mettre à jour la queue pour l'organisation
        await this.broadcastQueueUpdate(data.organizationId, data.serviceId)
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

        // Notifier l'agent
        client.emit('next-called', { ticketId: ticket.id.toString() })

        // Mettre à jour la queue
        await this.broadcastQueueUpdate(data.organizationId, data.serviceId)
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

        // Notifier l'organisation de la mise à jour
        const serviceId = ticket.serviceId.toString()
        await this.broadcastQueueUpdate(data.organizationId, serviceId)
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
  async handleGetQueueStatus(@MessageBody() data: { organizationId: string; serviceId: string }) {
    // Optionnel : permettre aux clients de demander le statut actuel
    await this.broadcastQueueUpdate(data.organizationId, data.serviceId)
  }

  private async broadcastQueueUpdate(organizationId: string, serviceId: string) {
    this.server.to(`org:${organizationId}`).emit('queue-updated', {
      organizationId,
      serviceId,
      timestamp: new Date().toISOString(),
    })
  }
}
