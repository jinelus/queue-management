import { accessControl, prisma } from '.'
import { authClient } from './client'
import { statements } from './permissions'

export type Statements = typeof statements

export type Roles = keyof typeof accessControl.roles

interface UserCanParams {
  userId: string
  organizationId: string
}

export async function userCan<T extends keyof Statements>(
  action: Statements[T][number],
  resource: T,
  { userId, organizationId }: UserCanParams,
): Promise<{ error: Error | null; success: boolean }> {
  const member = await prisma.member.findFirst({
    where: { userId, organizationId },
  })

  if (!member) {
    return {
      error: new Error('User is not a member of this organization'),
      success: false,
    }
  }

  const role = member.role as Roles

  const userHasPermission = authClient.admin.checkRolePermission({
    role,
    permissions: { [resource]: [action] },
  })

  if (!userHasPermission) {
    return {
      error: new Error('User does not have permission'),
      success: false,
    }
  }

  return {
    error: null,
    success: true,
  }
}
