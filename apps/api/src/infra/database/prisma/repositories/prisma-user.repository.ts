import { Injectable } from '@nestjs/common'
import { UserRepository } from '@/domain/master/application/repositories/user.repository'
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

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany()
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

  async count(): Promise<number> {
    return this.prisma.user.count()
  }
}
