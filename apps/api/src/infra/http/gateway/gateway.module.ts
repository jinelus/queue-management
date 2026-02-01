// gateway.module.ts

import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { CallNextWithRetryService } from '@/domain/master/application/services/ticket/call-next-with-retry.service'
import { CreateTicketService } from '@/domain/master/application/services/ticket/create-ticket.service'
import { GetTicketPositionService } from '@/domain/master/application/services/ticket/get-ticket-position.service'
import { JoinQueueService } from '@/domain/master/application/services/ticket/join-queue.service'
import { LeaveQueueService } from '@/domain/master/application/services/ticket/leave-queue.service'
import { DatabaseModule } from '@/infra/database/database.module'
import { EventsModule } from '@/infra/events/events.module'
import { TicketCallProcessor } from '@/infra/queue/processors/ticket-call.processor'
import { QueueGateway } from './websocket/queue.gateway'

@Module({
  imports: [
    DatabaseModule,
    EventsModule,
    BullModule.registerQueue({
      name: 'ticket-call-queue',
    }),
  ],
  providers: [
    PermissionFactory,
    QueueGateway,
    CreateTicketService,
    GetTicketPositionService,
    JoinQueueService,
    LeaveQueueService,
    CallNextWithRetryService,
    TicketCallProcessor,
  ],
})
export class GatewayModule {}
