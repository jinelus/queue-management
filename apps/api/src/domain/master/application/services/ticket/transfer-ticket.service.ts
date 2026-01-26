import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { NotAllowedError } from "@/core/errors/not-allowed-error";
import { NotFoundError } from "@/core/errors/not-found-error";
import { Ticket } from "@/domain/master/entreprise/entities/ticket";
import { PermissionFactory } from "../../permissions/permission.factory";
import { TicketRepository } from "../../repositories/ticket.repository";
import { ServiceRepository } from "../../repositories/service.repository";

interface TransferTicketServiceParams {
  ticketId: string;
  targetServiceId: string;
  staffId: string;
}

type TransferTicketServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    ticket: Ticket;
  }
>;

@Injectable()
export class TransferTicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    ticketId,
    targetServiceId,
    staffId,
  }: TransferTicketServiceParams): Promise<TransferTicketServiceResponse> {
    const { success } = await this.permissionFactory.userCan(
      "update",
      "ticket",
      { userId: staffId },
    );

    if (!success) {
      return left(new NotAllowedError());
    }

    const ticket = await this.ticketRepository.findById(ticketId);

    if (!ticket) {
      return left(new NotFoundError());
    }

    const targetService =
      await this.serviceRepository.findById(targetServiceId);

    if (!targetService) {
      return left(new NotFoundError());
    }

    ticket.serviceId = targetServiceId;
    ticket.status = "WAITING";
    ticket.servedById = undefined;
    ticket.callCount = 0;

    await this.ticketRepository.save(ticket);

    return right({
      ticket,
    });
  }
}
