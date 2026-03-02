import { Injectable } from '@nestjs/common'
import { Statements, userCan } from '@/auth/user-permissions'
import { NotAllowedError } from '@/core/errors/not-allowed-error'

@Injectable()
export class PermissionFactory {
  async userCan<T extends keyof Statements>(
    action: Statements[T][number],
    resource: T,
    { userId, organizationId }: { userId: string; organizationId: string },
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

    if (!organizationId) {
      return {
        error: new NotAllowedError('Organization ID is required'),
        success: false,
      }
    }

    const result = await userCan<T>(action, resource, { userId, organizationId })

    if (!result.success) {
      return {
        error: new NotAllowedError(result.error?.message ?? 'Permission denied'),
        success: false,
      }
    }

    return {
      error: null,
      success: true,
    }
  }
}
