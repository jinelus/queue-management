import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/master/entreprise/entities/user'
import { Prisma, User as PrismaUser } from '../../generated/prisma/client'

export const httpUserSchema = z.object({
  id: z.ulid(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  organizationId: z.ulid().optional(),

  banned: z.boolean(),
  banReason: z.string().nullable(),
  banExpires: z.string().nullable(),
  image: z.string().nullable(),
  role: z.string().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
})

export class HttpUser extends createZodDto(httpUserSchema) {}

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,

        email: raw.email,
        emailVerified: raw.emailVerified,
        organizationId: raw.organizationId ? new UniqueEntityID(raw.organizationId) : undefined,

        banExpires: raw.banExpires ?? undefined,
        banned: raw.banned ?? undefined,
        banReason: raw.banReason ?? undefined,

        image: raw.image ?? undefined,

        role: raw.role ?? undefined,

        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),

      name: user.name,

      email: user.email,
      emailVerified: user.emailVerified,
      organizationId: user.organizationId ? user.organizationId.toString() : undefined,

      image: user.image,

      banExpires: user.banExpires,
      banReason: user.banReason,
      banned: user.banned,

      role: user.role,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static toHttp(user: User): HttpUser {
    const httpUser = httpUserSchema.parse({
      id: user.id.toString(),

      name: user.name,

      email: user.email,
      emailVerified: user.emailVerified,
      organizationId: user.organizationId?.toString(),

      banExpires: user.banExpires?.toISOString() ?? null,
      banned: user.banned ?? false,
      banReason: user.banReason ?? null,

      image: user.image ?? null,
      role: user.role,

      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })
    return httpUser
  }
}
