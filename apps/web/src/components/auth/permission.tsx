import { ReactNode } from 'react'

type PermissionProps = {
  role?: string | null
  allowRoles?: string[]
  check?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function Permission({
  role,
  allowRoles,
  check = true,
  fallback = null,
  children,
}: PermissionProps) {
  const hasRoleConstraint = Array.isArray(allowRoles) && allowRoles.length > 0
  const roleAllowed = hasRoleConstraint ? Boolean(role && allowRoles.includes(role)) : true

  if (!check || !roleAllowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
