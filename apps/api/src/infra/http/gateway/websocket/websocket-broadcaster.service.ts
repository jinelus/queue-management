import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'

@Injectable()
export class WebSocketBroadcaster {
  private server: Server | null = null

  setServer(server: Server): void {
    this.server = server
  }

  getServer(): Server | null {
    return this.server
  }

  broadcastToOrg(organizationId: string, event: string, data: unknown): void {
    if (this.server) {
      this.server.to(`org:${organizationId}`).emit(event, data)
    }
  }

  broadcastToTicket(ticketId: string, event: string, data: unknown): void {
    if (this.server) {
      this.server.to(`ticket:${ticketId}`).emit(event, data)
    }
  }
}
