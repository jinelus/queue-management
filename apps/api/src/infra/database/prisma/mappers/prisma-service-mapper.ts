import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Service, ServiceProps } from '@/domain/master/entreprise/entities/service'
import { Prisma, Service as PrismaService } from '../../generated/prisma/client'
import { ToZodShape } from '../../zod-custom-shape'

export const httpServiceSchema = z.object<ToZodShape<ServiceProps & { id: string }>>({
  id: z.ulid(),
  name: z.string(),
  description: z.string().optional(),
  avgDurationInt: z.number().optional(),
  isActive: z.boolean().optional(),
  organizationId: z.string(),

  createdAt: z.string(),
  updatedAt: z.string(),
})

export class HttpService extends createZodDto(httpServiceSchema) {}

export class PrismaServiceMapper {
  static toDomain(raw: PrismaService): Service {
    return Service.create(
      {
        name: raw.name,
        description: raw.description,
        avgDurationInt: raw.avgDurationInt,
        isActive: raw.isActive,
        organizationId: raw.organizationId,

        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(service: Service): Prisma.ServiceUncheckedCreateInput {
    return {
      id: service.id.toString(),

      name: service.name,
      description: service.description,
      avgDurationInt: service.avgDurationInt,
      isActive: service.isActive,
      organizationId: service.organizationId,

      createdAt: service.createdAt ?? undefined,
      updatedAt: service.updatedAt ?? undefined,
    }
  }

  static toHttp(service: Service): HttpService {
    const httpService = httpServiceSchema.parse({
      id: service.id.toString(),

      name: service.name,
      description: service.description ?? undefined,
      avgDurationInt: service.avgDurationInt,
      isActive: service.isActive,
      organizationId: service.organizationId,

      createdAt: service.createdAt?.toISOString(),
      updatedAt: service.updatedAt?.toISOString(),
    })
    return httpService
  }
}
