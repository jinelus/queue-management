import { Injectable } from "@nestjs/common";
import {
  FindTicketsParams,
  TicketRepository,
} from "@/domain/master/application/repositories/ticket.repository";
import { Ticket } from "@/domain/master/entreprise/entities/ticket";
import { PrismaTicketMapper } from "../mappers/prisma-ticket.mapper";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaTicketRepository implements TicketRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: Ticket): Promise<void> {
    await this.prisma.ticket.create({
      data: PrismaTicketMapper.toPrisma(entity),
    });
  }

  async findAll(organizationId: string): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { organizationId },
    });
    return tickets.map(PrismaTicketMapper.toDomain);
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return null;
    }

    return PrismaTicketMapper.toDomain(ticket);
  }

  async save(entity: Ticket): Promise<void> {
    await this.prisma.ticket.update({
      where: { id: entity.id.toString() },
      data: PrismaTicketMapper.toPrisma(entity),
    });
  }

  async delete(entity: Ticket): Promise<void> {
    await this.prisma.ticket.delete({
      where: { id: entity.id.toString() },
    });
  }

  async count(
    organizationId: string,
    params?: FindTicketsParams,
  ): Promise<number> {
    const { serviceId, servedById, search, status } = params ?? {};
    const count = await this.prisma.ticket.count({
      where: {
        organizationId,
        serviceId,
        servedById,
        status,
        guestName: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    return count;
  }

  async findTickets(
    organizationId: string,
    params?: FindTicketsParams,
  ): Promise<Array<Ticket>> {
    const {
      order,
      orderBy,
      page,
      perPage,
      search,
      status,
      servedById,
      serviceId,
    } = params ?? {};

    const tickets = await this.prisma.ticket.findMany({
      where: {
        guestName: {
          contains: search,
          mode: "insensitive",
        },
        organizationId,
        ...(status ? { status } : {}),
        ...(servedById ? { servedById } : {}),
        ...(serviceId ? { serviceId } : {}),
      },
      take: perPage,
      skip: page && perPage ? (page - 1) * perPage : undefined,
      orderBy: {
        [orderBy ?? "joinedAt"]: order,
      },
    });

    return tickets.map(PrismaTicketMapper.toDomain);
  }

  async findOldestWaiting(serviceId: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        serviceId,
        status: "WAITING",
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    if (!ticket) {
      return null;
    }

    return PrismaTicketMapper.toDomain(ticket);
  }

  async countPreceding(serviceId: string, joinedAt: Date): Promise<number> {
    const count = await this.prisma.ticket.count({
      where: {
        serviceId,
        status: "WAITING",
        joinedAt: {
          lt: joinedAt,
        },
      },
    });

    return count;
  }
}
