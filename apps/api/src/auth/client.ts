import { BetterAuthClientPlugin, createAuthClient } from 'better-auth/client'
import { adminClient, anonymousClient, organizationClient } from 'better-auth/client/plugins'
import { accessControl } from '.'

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ...accessControl,
    }) as BetterAuthClientPlugin,
    organizationClient(),
    anonymousClient(),
  ],
})
