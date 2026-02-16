import { accessControl, prisma } from '.'
import { authClient } from './client'
import { statements } from './permissions'

export type Statements = typeof statements

export type Roles = keyof typeof accessControl.roles

type UserCanParams = { role: Roles; userId?: string } | { role?: Roles; userId: string }

export async function userCan<T extends keyof Statements>(
  action: Statements[T][number],
  resource: T,
  { role, userId }: UserCanParams,
): Promise<{ error: Error | null; success: boolean }> {
  if (role) {
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

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    return {
      error: new Error('User does not exist'),
      success: false,
    }
  }

  const userHasPermission = authClient.admin.checkRolePermission({
    role: (user.role as Roles) || 'user',
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
