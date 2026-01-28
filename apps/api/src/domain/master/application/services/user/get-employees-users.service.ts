import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { User } from '../../../entreprise/entities/user'
import { PermissionFactory } from '../../permissions/permission.factory'
import { UserRepository } from '../../repositories/user.repository'

interface GetEmployeesUsersServiceParams {
  userId: string
  organizationId: string

  order?: 'asc' | 'desc'
  orderBy?: 'createdAt' | 'updatedAt' | 'email'
  page?: number
  perPage?: number
  search?: string
}

type GetEmployeesUsersServiceResponse = Either<
  NotAllowedError,
  {
    users: User[]
    total: number
  }
>

@Injectable()
export class GetEmployeesUsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPermission: PermissionFactory,
  ) {}

  async execute({
    userId,
    order,
    orderBy,
    page,
    perPage,
    search,
    organizationId,
  }: GetEmployeesUsersServiceParams): Promise<GetEmployeesUsersServiceResponse> {
    const { success } = await this.userPermission.userCan('list', 'user', { userId })

    if (!success) {
      return left(new NotAllowedError('You are not allowed to access'))
    }

    const users = await this.userRepository.findUsers(organizationId, {
      role: 'employee',
      order: order ?? 'desc',
      orderBy: orderBy ?? 'createdAt',
      page: page ?? 1,
      perPage: perPage ?? 10,
      search,
    })

    const total = await this.userRepository.count(organizationId, {
      role: 'employee',
      search,
      order: 'desc',
      orderBy: orderBy ?? 'createdAt',
    })

    return right({
      users,
      total,
    })
  }
}
