import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Organization, OrganizationProps } from '@/domain/master/entreprise/entities/organization'
import { Prisma, Organization as PrismaOrganization } from '../../generated/prisma/client'
import { ToZodShape } from '../../zod-custom-shape'

const httpOrganizationSchema = z.object<ToZodShape<OrganizationProps & { id: string }>>({
  id: z.ulid(),
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  logoUrl: z.string().optional(),
  logo: z.string().optional(),
  metadata: z.string().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
})

export class HttpOrganization extends createZodDto(httpOrganizationSchema) {}

export class PrismaOrganizationMapper {
  static toDomain(raw: PrismaOrganization): Organization {
    return Organization.create(
      {
        name: raw.name,
        description: raw.description ?? undefined,
        slug: raw.slug,
        logoUrl: raw.logoUrl ?? undefined,
        logo: raw.logo ?? undefined,
        metadata: raw.metadata ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(organization: Organization): Prisma.OrganizationUncheckedCreateInput {
    return {
      id: organization.id.toString(),

      name: organization.name,
      description: organization.description,
      slug: organization.slug,
      logoUrl: organization.logoUrl ?? undefined,
      logo: organization.logo ?? undefined,
      metadata: organization.metadata ?? undefined,

      createdAt: organization.createdAt ?? undefined,
      updatedAt: organization.updatedAt ?? undefined,
    }
  }

  static toHttp(organization: Organization): HttpOrganization {
    const httpOrganization = httpOrganizationSchema.parse({
      id: organization.id.toString(),

      name: organization.name,
      description: organization.description,
      slug: organization.slug,
      logoUrl: organization.logoUrl,
      logo: organization.logo,
      metadata: organization.metadata,

      createdAt: organization.createdAt?.toISOString(),
      updatedAt: organization.updatedAt?.toISOString(),
    })
    return httpOrganization
  }
}
