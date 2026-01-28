import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from '@/domain/master/entreprise/entities/user'
import { Prisma, User as PrismaUser } from '../../generated/prisma/client'
import { ToZodShape } from '../../zod-custom-shape'

export const httpUserSchema = z.object<ToZodShape<UserProps & { id: string }>>({
  id: z.ulid(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),

  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.string(),
  image: z.string().optional(),
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

      banExpires: user.banExpires?.toISOString(),
      banned: user.banned,
      banReason: user.banReason,

      image: user.image,
      role: user.role,

      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })
    return httpUser
  }
}
