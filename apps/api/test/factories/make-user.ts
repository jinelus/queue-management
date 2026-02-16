import { faker } from '@faker-js/faker'
import { ulid } from 'ulid'
import type { Prisma, PrismaClient } from '@/infra/database/generated/prisma/client'

export async function makeMember(
  prisma: PrismaClient,
  userId: string,
  organizationId: string,
  role = 'member',
) {
  return prisma.member.create({
    data: {
      organizationId,
      userId,
      role,
    },
  })
}

export async function makeUser(
  prisma: PrismaClient,
  override: Partial<Prisma.UserCreateInput> = {},
) {
  const user = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: `${faker.internet.email()}-${ulid()}`,
      emailVerified: true,
      ...override,
      role: 'user',
    },
  })

  return user
}

export async function makeEmployee(
  prisma: PrismaClient,
  organizationId: string,
  override: Partial<Prisma.UserCreateInput> = {},
) {
  const data: Prisma.UserCreateInput = {
    name: faker.person.fullName(),
    email: `${faker.internet.email()}-${ulid()}`,
    emailVerified: true,
    ...override,
    role: 'employee',
  }

  if (organizationId) {
    data.organization = { connect: { id: organizationId } }
  }

  const user = await prisma.user.create({ data })

  if (organizationId) {
    await makeMember(prisma, user.id, organizationId, 'member')
  }

  return user
}

export async function makeAdmin(
  prisma: PrismaClient,
  organizationId: string,
  override: Partial<Prisma.UserCreateInput> = {},
) {
  const data: Prisma.UserCreateInput = {
    name: faker.person.fullName(),
    email: `${faker.internet.email()}-${ulid()}`,
    emailVerified: true,
    ...override,
    role: 'admin',
  }

  if (organizationId) {
    data.organization = { connect: { id: organizationId } }
  }

  const user = await prisma.user.create({ data })

  if (organizationId) {
    await makeMember(prisma, user.id, organizationId, 'admin')
  }

  return user
}
