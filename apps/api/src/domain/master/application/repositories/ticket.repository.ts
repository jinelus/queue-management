import { PaginationParams } from "@/core/repositories/pagination-params";
import { Repository } from "@/core/repositories/repository";
import { Ticket } from "../../entreprise/entities/ticket";

export interface FindTicketsParams extends PaginationParams {
  status?: Ticket["status"];
  serviceId?: string;
  servedById?: string;
}

export abstract class TicketRepository extends Repository<Ticket> {
  abstract findTickets(
    organizationId: string,
    params?: FindTicketsParams,
  ): Promise<Array<Ticket>>;
  abstract count(
    organizationId: string,
    params?: FindTicketsParams,
  ): Promise<number>;
  abstract findOldestWaiting(serviceId: string): Promise<Ticket | null>;
  abstract countPreceding(serviceId: string, createdAt: Date): Promise<number>;
  abstract getServedTicketsCountByDay(
    organizationId: string,
    days: number,
  ): Promise<{ date: string; count: number }[]>;
  abstract getAverageServiceDuration(
    organizationId: string,
  ): Promise<
    { employeeId: string; employeeName: string; avgDuration: number }[]
  >;
}
