import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { TicketRepository } from "../../repositories/ticket.repository";

interface GetHistoricalStatsServiceParams {
  organizationId: string;
  days?: number;
}

type GetHistoricalStatsServiceResponse = Either<
  null,
  {
    servedTicketsByDay: { date: string; count: number }[];
    avgDurationByEmployee: {
      employeeId: string;
      employeeName: string;
      avgDuration: number;
    }[];
  }
>;

@Injectable()
export class GetHistoricalStatsService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async execute({
    organizationId,
    days = 7,
  }: GetHistoricalStatsServiceParams): Promise<GetHistoricalStatsServiceResponse> {
    const [servedTicketsByDay, avgDurationByEmployee] = await Promise.all([
      this.ticketRepository.getServedTicketsCountByDay(organizationId, days),
      this.ticketRepository.getAverageServiceDuration(organizationId),
    ]);

    return right({
      servedTicketsByDay,
      avgDurationByEmployee,
    });
  }
}
