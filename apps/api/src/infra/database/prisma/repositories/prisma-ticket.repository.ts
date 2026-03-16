import { Injectable } from '@nestjs/common'
import {
  FindTicketsParams,
  TicketRepository,
} from '@/domain/master/application/repositories/ticket.repository'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'
import { PrismaTicketMapper } from '../mappers/prisma-ticket.mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaTicketRepository implements TicketRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: Ticket): Promise<void> {
    await this.prisma.ticket.create({
      data: PrismaTicketMapper.toPrisma(entity),
    })
  }

  async findAll(organizationId: string): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { organizationId },
    })
    return tickets.map(PrismaTicketMapper.toDomain)
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return null
    }

    return PrismaTicketMapper.toDomain(ticket)
  }

  async save(entity: Ticket): Promise<void> {
    await this.prisma.ticket.update({
      where: { id: entity.id.toString() },
      data: PrismaTicketMapper.toPrisma(entity),
    })
  }

  async delete(entity: Ticket): Promise<void> {
    await this.prisma.ticket.delete({
      where: { id: entity.id.toString() },
    })
  }

  async count(organizationId: string, params?: FindTicketsParams): Promise<number> {
    const { serviceId, servedById, search, status } = params ?? {}
    const count = await this.prisma.ticket.count({
      where: {
        organizationId,
        serviceId,
        servedById,
        status,
        guestName: {
          contains: search,
          mode: 'insensitive',
        },
      },
    })

    return count
  }

  async findTickets(organizationId: string, params?: FindTicketsParams): Promise<Array<Ticket>> {
    const { order, orderBy, page, perPage, search, status, servedById, serviceId } = params ?? {}

    const tickets = await this.prisma.ticket.findMany({
      where: {
        guestName: {
          contains: search,
          mode: 'insensitive',
        },
        organizationId,
        ...(status ? { status } : {}),
        ...(servedById ? { servedById } : {}),
        ...(serviceId ? { serviceId } : {}),
      },
      take: perPage,
      skip: page && perPage ? (page - 1) * perPage : undefined,
      orderBy: {
        [orderBy ?? 'joinedAt']: order,
      },
    })

    return tickets.map(PrismaTicketMapper.toDomain)
  }

  async findOldestWaiting(serviceId: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        serviceId,
        status: 'WAITING',
      },
      orderBy: {
        joinedAt: 'asc',
      },
    })

    if (!ticket) {
      return null
    }

    return PrismaTicketMapper.toDomain(ticket)
  }

  async countPreceding(serviceId: string, joinedAt: Date): Promise<number> {
    const count = await this.prisma.ticket.count({
      where: {
        serviceId,
        status: 'WAITING',
        joinedAt: {
          lt: joinedAt,
        },
      },
    })

    return count
  }

  async getServedTicketsCountByDay(
    organizationId: string,
    days: number,
  ): Promise<{ day: string; served: number; queue: number }[]> {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - (days - 1))

    const results = await this.prisma.$queryRaw<{ date: Date; served: number; queue: number }[]>`
      WITH days AS (
        SELECT generate_series(${startDate}::date, CURRENT_DATE, '1 day'::interval)::date AS day
      ),
      served AS (
        SELECT
          "completedAt"::date AS day,
          COUNT(*)::int AS served
        FROM "ticket"
        WHERE "organizationId" = ${organizationId}
          AND "status" = 'SERVED'
          AND "completedAt" >= ${startDate}
        GROUP BY "completedAt"::date
      ),
      queued AS (
        SELECT
          "joinedAt"::date AS day,
          COUNT(*)::int AS queue
        FROM "ticket"
        WHERE "organizationId" = ${organizationId}
          AND "joinedAt" >= ${startDate}
        GROUP BY "joinedAt"::date
      )
      SELECT
        d.day AS date,
        COALESCE(s.served, 0)::int AS served,
        COALESCE(q.queue, 0)::int AS queue
      FROM days d
      LEFT JOIN served s ON s.day = d.day
      LEFT JOIN queued q ON q.day = d.day
      ORDER BY d.day ASC
    `

    return results.map((r) => ({
      day: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(r.date)),
      served: Number(r.served),
      queue: Number(r.queue),
    }))
  }

  async getAverageWaitTimeByDay(
    organizationId: string,
    days: number,
  ): Promise<{ day: string; time: number }[]> {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - (days - 1))

    const results = await this.prisma.$queryRaw<{ date: Date; time: number }[]>`
      WITH days AS (
        SELECT generate_series(${startDate}::date, CURRENT_DATE, '1 day'::interval)::date AS day
      ),
      avg_wait AS (
        SELECT
          "completedAt"::date AS day,
          AVG(EXTRACT(EPOCH FROM ("startedAt" - "joinedAt")) / 60.0)::float AS time
        FROM "ticket"
        WHERE "organizationId" = ${organizationId}
          AND "status" = 'SERVED'
          AND "startedAt" IS NOT NULL
          AND "joinedAt" IS NOT NULL
          AND "completedAt" IS NOT NULL
          AND "completedAt" >= ${startDate}
        GROUP BY "completedAt"::date
      )
      SELECT
        d.day AS date,
        COALESCE(a.time, 0)::float AS time
      FROM days d
      LEFT JOIN avg_wait a ON a.day = d.day
      ORDER BY d.day ASC
    `

    return results.map((r) => ({
      day: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(r.date)),
      time: Math.round(Number(r.time)),
    }))
  }

  async getAverageServiceDuration(
    organizationId: string,
  ): Promise<{ employeeId: string; employeeName: string; avgDuration: number }[]> {
    const results = await this.prisma.$queryRaw<
      { servedById: string; employeeName: string; avgDuration: number }[]
    >`
        SELECT
            t."servedById",
            u."name" as "employeeName",
            AVG(EXTRACT(EPOCH FROM (t."completedAt" - t."startedAt")))::float as "avgDuration"
        FROM "ticket" t
        JOIN "user" u ON t."servedById" = u."id"
        WHERE t."organizationId" = ${organizationId}
          AND t."status" = 'SERVED'
          AND t."startedAt" IS NOT NULL
          AND t."completedAt" IS NOT NULL
        GROUP BY t."servedById", u."name"
     `

    return results.map((r) => ({
      employeeId: r.servedById,
      employeeName: r.employeeName,
      avgDuration: Math.round(r.avgDuration),
    }))
  }

  async atomicClaimOldestWaiting(serviceId: string, staffId: string): Promise<Ticket | null> {
    const result = await this.prisma.$transaction(async (tx) => {
      const tickets = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM "ticket"
        WHERE "serviceId" = ${serviceId}
          AND status = 'WAITING'
        ORDER BY "joinedAt" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `

      if (!tickets || tickets.length === 0) {
        return null
      }

      const ticketId = tickets[0].id

      const updatedTicket = await tx.ticket.update({
        where: {
          id: ticketId,
          status: 'WAITING',
        },
        data: {
          status: 'CALLED',
          servedById: staffId,
          calledAt: new Date(),
          callCount: { increment: 1 },
        },
      })

      return updatedTicket
    })

    if (!result) {
      return null
    }

    return PrismaTicketMapper.toDomain(result)
  }
}
