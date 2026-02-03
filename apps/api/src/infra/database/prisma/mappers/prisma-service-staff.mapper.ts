import { createZodDto } from 'nestjs-zod'
import z from 'zod'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ServiceStaff, ServiceStaffProps } from '@/domain/master/entreprise/entities/service-staff'
import { Prisma, ServiceStaff as PrismaServiceStaff } from '../../generated/prisma/client'
import { ToZodShape } from '../../zod-custom-shape'

export const httpServiceStaffSchema = z.object<ToZodShape<ServiceStaffProps & { id: string }>>({
  id: z.ulid(),
  userId: z.ulid(),
  serviceId: z.ulid(),
  active: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  isCounterClosed: z.boolean().optional(),
})

export class HttpServiceStaff extends createZodDto(httpServiceStaffSchema) {}

export class PrismaServiceStaffMapper {
  static toDomain(raw: PrismaServiceStaff): ServiceStaff {
    return ServiceStaff.create(
      {
        userId: raw.userId,
        serviceId: raw.serviceId,
        active: raw.active,
        isOnline: raw.isOnline,
        isCounterClosed: raw.isCounterClosed,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(serviceStaff: ServiceStaff): Prisma.ServiceStaffUncheckedCreateInput {
    return {
      id: serviceStaff.id.toString(),
      userId: serviceStaff.userId,
      serviceId: serviceStaff.serviceId,
      active: serviceStaff.active,
      isOnline: serviceStaff.isOnline,
      isCounterClosed: serviceStaff.isCounterClosed,
    }
  }

  static toHttp(serviceStaff: ServiceStaff): HttpServiceStaff {
    const httpServiceStaff = httpServiceStaffSchema.parse({
      id: serviceStaff.id.toString(),
      userId: serviceStaff.userId,
      serviceId: serviceStaff.serviceId,
      active: serviceStaff.active,
      isOnline: serviceStaff.isOnline,
      isCounterClosed: serviceStaff.isCounterClosed,
    })
    return httpServiceStaff
  }
}
