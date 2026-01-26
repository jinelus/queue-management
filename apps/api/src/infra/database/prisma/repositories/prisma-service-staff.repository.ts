import { Injectable } from "@nestjs/common";
import { ServiceStaffRepository } from "@/domain/master/application/repositories/service-staff.repository";
import { ServiceStaff } from "@/domain/master/entreprise/entities/service-staff";
import { PrismaServiceStaffMapper } from "../mappers/prisma-service-staff.mapper";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaServiceStaffRepository implements ServiceStaffRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: ServiceStaff): Promise<void> {
    await this.prisma.serviceStaff.create({
      data: PrismaServiceStaffMapper.toPrisma(entity),
    });
  }

  async save(entity: ServiceStaff): Promise<void> {
    await this.prisma.serviceStaff.update({
      where: {
        userId_serviceId: {
          userId: entity.userId,
          serviceId: entity.serviceId,
        },
      },
      data: PrismaServiceStaffMapper.toPrisma(entity),
    });
  }

  async delete(entity: ServiceStaff): Promise<void> {
    await this.prisma.serviceStaff.delete({
      where: {
        userId_serviceId: {
          userId: entity.userId,
          serviceId: entity.serviceId,
        },
      },
    });
  }

  async findById(id: string): Promise<ServiceStaff | null> {
    const parts = id.split(":");
    if (parts.length !== 2) return null;
    const [userId, serviceId] = parts;

    const item = await this.prisma.serviceStaff.findUnique({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
    });

    if (!item) return null;
    return PrismaServiceStaffMapper.toDomain(item);
  }

  async findAll(organizationId: string): Promise<ServiceStaff[]> {
    const items = await this.prisma.serviceStaff.findMany({
      where: {
        service: {
          organizationId,
        },
      },
    });
    return items.map(PrismaServiceStaffMapper.toDomain);
  }

  async count(organizationId: string): Promise<number> {
    return await this.prisma.serviceStaff.count({
      where: {
        service: {
          organizationId,
        },
      },
    });
  }

  async findByServiceId(serviceId: string): Promise<ServiceStaff[]> {
    const items = await this.prisma.serviceStaff.findMany({
      where: { serviceId },
    });
    return items.map(PrismaServiceStaffMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<ServiceStaff[]> {
    const items = await this.prisma.serviceStaff.findMany({
      where: { userId },
    });
    return items.map(PrismaServiceStaffMapper.toDomain);
  }

  async findByPair(
    serviceId: string,
    userId: string,
  ): Promise<ServiceStaff | null> {
    const item = await this.prisma.serviceStaff.findUnique({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
    });

    if (!item) return null;
    return PrismaServiceStaffMapper.toDomain(item);
  }
}
