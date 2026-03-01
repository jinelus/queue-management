import { env } from '@repo/env'
import { BetterAuthClientPlugin } from 'better-auth'
import { adminClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { ac, admin, developer, employee, user } from '../../../api/src/auth/permissions'

const accessControl = {
  ac,
  roles: {
    developer,
    admin,
    employee,
    user,
  },
}

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ...accessControl,
    }) as BetterAuthClientPlugin,
    organizationClient(),
  ],
  baseURL: env.NEXT_PUBLIC_FRONT_END_URL,
  basePath: '/reverse-proxy/auth',
  fetchOptions: {
    credentials: 'include',
  },
})
