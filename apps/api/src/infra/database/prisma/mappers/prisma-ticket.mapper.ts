import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Ticket, TicketProps } from '@/domain/master/entreprise/entities/ticket'
import { Prisma, Ticket as PrismaTicket } from '../../generated/prisma/client'
import { ToZodShape } from '../../zod-custom-shape'

const httpTicketSchema = z.object<ToZodShape<TicketProps & { id: string }>>({
  id: z.ulid(),
  guestName: z.string(),
  status: z.enum(['WAITING', 'CALLED', 'SERVING', 'SERVED', 'ABSENT', 'CANCELLED']),
  callCount: z.number().optional(),
  organizationId: z.string(),
  serviceId: z.string(),
  servedById: z.string().optional(),

  joinedAt: z.string(),
  calledAt: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
})

export class HttpTicket extends createZodDto(httpTicketSchema) {}

export class PrismaTicketMapper {
  static toDomain(raw: PrismaTicket): Ticket {
    return Ticket.create(
      {
        guestName: raw.guestName,
        status: raw.status as Ticket['status'],
        callCount: raw.callCount,
        organizationId: raw.organizationId,
        serviceId: raw.serviceId,
        servedById: raw.servedById ?? undefined,

        calledAt: raw?.calledAt,
        startedAt: raw?.startedAt,
        completedAt: raw?.completedAt,
        joinedAt: raw?.joinedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(ticket: Ticket): Prisma.TicketUncheckedCreateInput {
    return {
      id: ticket.id.toString(),

      guestName: ticket.guestName,
      status: ticket.status,
      callCount: ticket.callCount,
      organizationId: ticket.organizationId,
      serviceId: ticket.serviceId,
      servedById: ticket.servedById,

      joinedAt: ticket.joinedAt ?? undefined,
      calledAt: ticket.calledAt ?? undefined,
      startedAt: ticket.startedAt ?? undefined,
      completedAt: ticket.completedAt ?? undefined,
    }
  }

  static toHttp(ticket: Ticket): HttpTicket {
    const httpTicket = httpTicketSchema.parse({
      id: ticket.id.toString(),

      guestName: ticket.guestName,

      status: ticket.status,
      callCount: ticket.callCount,
      organizationId: ticket.organizationId,
      serviceId: ticket.serviceId,
      servedById: ticket.servedById,

      joinedAt: ticket.joinedAt.toISOString(),
      calledAt: ticket.calledAt?.toISOString(),
      startedAt: ticket.startedAt?.toISOString(),
      completedAt: ticket.completedAt?.toISOString(),
    })
    return httpTicket
  }
}
