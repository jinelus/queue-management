import { faker } from '@faker-js/faker'
import { ulid } from 'ulid'
import type { Prisma, PrismaClient } from '@/infra/database/generated/prisma/client'

export async function makeOrganization(
  prisma: PrismaClient,
  override: Partial<Prisma.OrganizationCreateInput> = {},
) {
  const name = faker.company.name()
  const slug = override.slug ?? `${faker.helpers.slugify(name).toLowerCase()}-${ulid()}`

  const organization = await prisma.organization.create({
    data: {
      name,
      slug,
      description: faker.company.catchPhrase(),
      ...override,
    },
  })

  return organization
}
