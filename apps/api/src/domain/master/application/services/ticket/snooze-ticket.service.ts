import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { NotFoundError } from "@/core/errors/not-found-error";
import { TicketRepository } from "../../repositories/ticket.repository";
import { Ticket } from "@/domain/master/entreprise/entities/ticket";

interface SnoozeTicketServiceParams {
  ticketId: string;
  organizationId: string;
}

type SnoozeTicketServiceResponse = Either<
  NotFoundError | Error,
  {
    ticket: Ticket;
  }
>;

@Injectable()
export class SnoozeTicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async execute({
    ticketId,
    organizationId,
  }: SnoozeTicketServiceParams): Promise<SnoozeTicketServiceResponse> {
    const ticket = await this.ticketRepository.findById(ticketId);

    if (!ticket) {
      return left(new NotFoundError("Ticket not found"));
    }

    if (ticket.organizationId !== organizationId) {
      return left(new NotFoundError("Ticket not found in this organization"));
    }

    if (ticket.status !== "WAITING") {
      return left(new Error("Only waiting tickets can be snoozed"));
    }

    // Move to back of queue by updating joinedAt to now
    ticket.joinedAt = new Date();

    await this.ticketRepository.save(ticket);

    return right({
      ticket,
    });
  }
}
