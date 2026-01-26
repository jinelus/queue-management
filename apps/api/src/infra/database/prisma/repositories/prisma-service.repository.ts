import { Injectable } from '@nestjs/common'
import {
  FindServicesParams,
  ServiceRepository,
} from '@/domain/master/application/repositories/service.repository'
import { Service } from '@/domain/master/entreprise/entities/service'
import { PrismaServiceMapper } from '../mappers/prisma-service-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaServiceRepository implements ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: Service): Promise<void> {
    await this.prisma.service.create({
      data: PrismaServiceMapper.toPrisma(entity),
    })
  }

  async findAll(organizationId: string): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: { organizationId },
    })
    return services.map(PrismaServiceMapper.toDomain)
  }

  async findById(id: string): Promise<Service | null> {
    const service = await this.prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return null
    }

    return PrismaServiceMapper.toDomain(service)
  }

  async save(entity: Service): Promise<void> {
    await this.prisma.service.update({
      where: { id: entity.id.toString() },
      data: PrismaServiceMapper.toPrisma(entity),
    })
  }

  async delete(entity: Service): Promise<void> {
    await this.prisma.service.delete({
      where: { id: entity.id.toString() },
    })
  }

  async count(organizationId: string, params?: FindServicesParams): Promise<number> {
    const { search, isActive } = params ?? {}
    const count = await this.prisma.service.count({
      where: {
        organizationId,
        isActive: isActive === undefined ? undefined : isActive,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    })

    return count
  }

  async findServices(organizationId: string, params?: FindServicesParams): Promise<Array<Service>> {
    const { order, orderBy, page, perPage, search, isActive } = params ?? {}

    const services = await this.prisma.service.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
        organizationId,
        ...(isActive === undefined ? {} : { isActive }),
      },
      take: perPage,
      skip: page && perPage ? (page - 1) * perPage : undefined,
      orderBy: {
        [orderBy ?? 'createdAt']: order,
      },
    })

    return services.map(PrismaServiceMapper.toDomain)
  }
}
