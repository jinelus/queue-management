import { Injectable } from '@nestjs/common'
import { Roles, Statements, userCan } from '@/auth/user-permissions'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import * as Repository from '../repositories/user.repository'

type UserCanParams = Parameters<typeof userCan>

@Injectable()
export class PermissionFactory {
  constructor(private userRepository: Repository.UserRepository) {}

  async userCan<T extends keyof Statements>(
    action: Statements[T][number],
    resource: T,
    { userId }: Omit<UserCanParams['2'], 'role'>,
  ): Promise<{
    error: NotAllowedError | null
    success: boolean
  }> {
    if (!userId) {
      return {
        error: new NotAllowedError('User ID is required'),
        success: false,
      }
    }
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return {
        error: new NotAllowedError('User not found'),
        success: false,
      }
    }

    if (!user.role) {
      return {
        error: new NotAllowedError('User role not found'),
        success: false,
      }
    }

    const role = user.role as Roles
    return userCan<T>(action, resource, { role })
  }
}
