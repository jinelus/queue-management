import { PaginationParams } from '@/core/repositories/pagination-params'
import { Repository } from '@/core/repositories/repository'
import { User } from '../../entreprise/entities/user'

export interface FindUsersParams extends PaginationParams {
  role?: 'employee'
}

export abstract class UserRepository extends Repository<User> {
  abstract findUsers(organizationId: string, params?: FindUsersParams): Promise<Array<User>>
  abstract count(organizationId: string, params?: FindUsersParams): Promise<number>
}
