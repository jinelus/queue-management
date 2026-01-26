import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ServiceStaff } from "@/domain/master/entreprise/entities/service-staff";
import {
  Prisma,
  ServiceStaff as PrismaServiceStaff,
} from "../../generated/prisma/client";

export class PrismaServiceStaffMapper {
  static toDomain(raw: PrismaServiceStaff): ServiceStaff {
    return ServiceStaff.create(
      {
        userId: raw.userId,
        serviceId: raw.serviceId,
        active: raw.active,
      },
      new UniqueEntityID(`${raw.userId}:${raw.serviceId}`),
    );
  }

  static toPrisma(
    serviceStaff: ServiceStaff,
  ): Prisma.ServiceStaffUncheckedCreateInput {
    return {
      userId: serviceStaff.userId,
      serviceId: serviceStaff.serviceId,
      active: serviceStaff.active,
    };
  }
}
