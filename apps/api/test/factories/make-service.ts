import { faker } from '@faker-js/faker'
import type { Prisma, PrismaClient } from '@/infra/database/generated/prisma/client'

export async function makeService(
  prisma: PrismaClient,
  organizationId: string,
  override: Partial<Prisma.ServiceCreateInput> = {},
) {
  const service = await prisma.service.create({
    data: {
      name: faker.commerce.department(),
      description: faker.commerce.productDescription(),
      avgDurationInt: faker.number.int({ min: 5, max: 60 }),
      maxCapacity: faker.number.int({ min: 10, max: 100 }),
      alertThresholdMinutes: 30,
      isActive: true,
      organization: {
        connect: { id: organizationId },
      },
      ...override,
    },
  })

  return service
}
