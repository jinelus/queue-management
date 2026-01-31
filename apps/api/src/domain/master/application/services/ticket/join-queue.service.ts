import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { NotAllowedError } from "@/core/errors/not-allowed-error";
import { NotFoundError } from "@/core/errors/not-found-error";
import { Ticket } from "@/domain/master/entreprise/entities/ticket";
import { CreateTicketService } from "./create-ticket.service";
import { GetTicketPositionService } from "./get-ticket-position.service";

interface JoinQueueServiceParams {
  guestName: string;
  organizationId: string;
  serviceId: string;
}

type JoinQueueServiceResponse = Either<
  NotFoundError | NotAllowedError,
  {
    ticket: Ticket;
    position: number | null;
    estimatedWaitTime: number | null;
  }
>;

@Injectable()
export class JoinQueueService {
  constructor(
    private readonly createTicketService: CreateTicketService,
    private readonly getTicketPositionService: GetTicketPositionService,
  ) {}

  async execute({
    guestName,
    organizationId,
    serviceId,
  }: JoinQueueServiceParams): Promise<JoinQueueServiceResponse> {
    // 1. Create the ticket
    const createResult = await this.createTicketService.execute({
      guestName,
      organizationId,
      serviceId,
    });

    if (createResult.isLeft()) {
      return left(createResult.value);
    }

    const { ticket } = createResult.value;

    // 2. Get position info
    const positionResult = await this.getTicketPositionService.execute({
      ticketId: ticket.id.toString(),
      organizationId,
    });

    if (positionResult.isLeft()) {
      // In theory, this shouldn't happen right after creation,
      // but if it does, we return the error or fallback
      return left(positionResult.value);
    }

    const { position, estimatedWaitTime } = positionResult.value;

    return right({
      ticket,
      position,
      estimatedWaitTime,
    });
  }
}
