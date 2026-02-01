import { Module } from "@nestjs/common";
import { PermissionFactory } from "@/domain/master/application/permissions/permission.factory";
import { CreateTicketService } from "@/domain/master/application/services/ticket/create-ticket.service";
import { GetTicketPositionService } from "@/domain/master/application/services/ticket/get-ticket-position.service";
import { LeaveQueueService } from "@/domain/master/application/services/ticket/leave-queue.service";
import { TransferTicketService } from "@/domain/master/application/services/ticket/transfer-ticket.service";
import { UpdateTicketStatusService } from "@/domain/master/application/services/ticket/update-ticket-status.service";
import { SnoozeTicketService } from "@/domain/master/application/services/ticket/snooze-ticket.service";
import { DatabaseModule } from "@/infra/database/database.module";
import { CreateTicketController } from "./create-ticket.controller";
import { GetTicketPositionController } from "./get-ticket-position.controller";
import { LeaveQueueController } from "./leave-queue.controller";
import { TransferTicketController } from "./transfer-ticket.controller";
import { UpdateTicketStatusController } from "./update-ticket-status.controller";
import { SnoozeTicketController } from "./snooze-ticket.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateTicketController,
    UpdateTicketStatusController,
    TransferTicketController,
    LeaveQueueController,
    GetTicketPositionController,
    SnoozeTicketController,
  ],
  providers: [
    PermissionFactory,
    CreateTicketService,
    UpdateTicketStatusService,
    TransferTicketService,
    LeaveQueueService,
    GetTicketPositionService,
    SnoozeTicketService,
  ],
})
export class TicketModule {}
