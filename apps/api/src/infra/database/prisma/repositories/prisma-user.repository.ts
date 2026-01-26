import { Injectable } from '@nestjs/common'
import {
  FindUsersParams,
  UserRepository,
} from '@/domain/master/application/repositories/user.repository'
import { User } from '@/domain/master/entreprise/entities/user'
import { PrismaUserMapper } from '../mappers/prisma-user.mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: User): Promise<void> {
    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(entity),
    })
  }

  async findAll(organizationId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
    })
    return users.map(PrismaUserMapper.toDomain)
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async save(entity: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: entity.id.toString() },
      data: PrismaUserMapper.toPrisma(entity),
    })
  }

  async delete(entity: User): Promise<void> {
    await this.prisma.user.delete({
      where: { id: entity.id.toString() },
    })
  }

  async count(organizationId: string, params?: FindUsersParams): Promise<number> {
    const { role, search } = params ?? {}
    const count = await this.prisma.user.count({
      where: {
        organizationId,
        role,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    })

    return count
  }

  async findUsers(organizationId: string, params?: FindUsersParams): Promise<Array<User>> {
    const { order, orderBy, page, perPage, role, search } = params ?? {}

    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
        role,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      take: perPage,
      skip: page && perPage ? (page - 1) * perPage : undefined,
      orderBy: {
        [orderBy ?? 'createdAt']: order,
      },
    })

    return users.map(PrismaUserMapper.toDomain)
  }
}
