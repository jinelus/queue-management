import type { Prisma, PrismaClient } from '@/infra/database/generated/prisma/client'

export async function makeServiceStaff(
  prisma: PrismaClient,
  userId: string,
  serviceId: string,
  override: Partial<Prisma.ServiceStaffCreateInput> = {},
) {
  const serviceStaff = await prisma.serviceStaff.create({
    data: {
      active: true,
      isOnline: false,
      isCounterClosed: false,
      user: {
        connect: { id: userId },
      },
      service: {
        connect: { id: serviceId },
      },
      ...override,
    },
  })

  return serviceStaff
}
