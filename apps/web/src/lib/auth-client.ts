import { env } from '@repo/env'
import { BetterAuthClientPlugin } from 'better-auth'
import { adminClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { ac, admin, member, owner, user } from '../../../api/src/auth/permissions'

const accessControl = {
  ac,
  roles: {
    owner,
    admin,
    member,
    user,
  },
}

export const authClient = createAuthClient({
  plugins: [adminClient(accessControl) as BetterAuthClientPlugin, organizationClient()],
  baseURL: env.NEXT_PUBLIC_FRONT_END_URL,
  basePath: '/reverse-proxy/auth',
  fetchOptions: {
    credentials: 'include',
  },
})
