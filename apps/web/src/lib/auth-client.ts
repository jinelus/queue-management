import { ac, admin, developer, employee, user } from '@repo/api'
import { env } from '@repo/env'
import { adminClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

const accessControl = {
  ac,
  roles: {
    developer,
    admin,
    employee,
    user,
  },
}

type AuthClient = ReturnType<typeof createAuthClient>

export const authClient: AuthClient = createAuthClient({
  plugins: [
    adminClient({
      ...accessControl,
    } as Parameters<typeof adminClient>[0]),
    organizationClient(),
  ],
  baseURL: env.NEXT_PUBLIC_FRONT_END_URL,
  basePath: '/reverse-proxy/auth',
})
