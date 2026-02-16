import { faker } from '@faker-js/faker'
import type { Prisma, PrismaClient } from '@/infra/database/generated/prisma/client'

export async function makeSession(
  prisma: PrismaClient,
  userId: string,
  override: Partial<Prisma.SessionCreateInput> = {},
) {
  const session = await prisma.session.create({
    data: {
      token: faker.string.ulid(),
      expiresAt: faker.date.future(),
      user: {
        connect: { id: userId },
      },
      ...override,
    },
  })

  return session
}
