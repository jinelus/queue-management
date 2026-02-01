import { NotAllowedError } from '@/core/errors/not-allowed-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'

type PermissionResult = Awaited<ReturnType<PermissionFactory['userCan']>>

export class FakePermissionFactory {
  private shouldSucceed = true

  setPermission(success: boolean): void {
    this.shouldSucceed = success
  }

  async userCan(): Promise<PermissionResult> {
    if (this.shouldSucceed) {
      return { error: null, success: true }
    }
    return { error: new NotAllowedError('Permission denied'), success: false }
  }
}
