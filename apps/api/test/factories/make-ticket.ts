import { faker } from '@faker-js/faker'
import type { Prisma, PrismaClient, TicketStatus } from '@/infra/database/generated/prisma/client'

type TicketOverride = Partial<Prisma.TicketCreateInput> & {
  servedById?: string
}

export async function makeTicket(
  prisma: PrismaClient,
  organizationId: string,
  serviceId: string,
  override: TicketOverride = {},
) {
  const data: Prisma.TicketCreateInput = {
    guestName: faker.person.fullName(),
    status: 'WAITING' as TicketStatus,
    callCount: 0,
    organization: {
      connect: { id: organizationId },
    },
    service: {
      connect: { id: serviceId },
    },
  }

  // Handle servedBy relation properly
  if (override.servedById) {
    const { servedById, ...restOverride } = override
    data.servedBy = {
      connect: { id: servedById },
    }
    Object.assign(data, restOverride)
  } else {
    Object.assign(data, override)
  }

  // Ensure dates are consistent with status
  if (data.status === 'SERVED' && !data.completedAt) {
    data.completedAt = new Date()
    if (!data.startedAt) data.startedAt = new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
    if (!data.calledAt) data.calledAt = new Date(Date.now() - 1000 * 60 * 20) // 20 mins ago
  } else if (data.status === 'SERVING' && !data.startedAt) {
    data.startedAt = new Date()
    if (!data.calledAt) data.calledAt = new Date(Date.now() - 1000 * 60 * 5) // 5 mins ago
  } else if (data.status === 'CALLED' && !data.calledAt) {
    data.calledAt = new Date()
  }

  const ticket = await prisma.ticket.create({ data })

  return ticket
}
