import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@repo/env'
import { BetterAuthPlugin, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin as adminPlugin, bearer, openAPI, organization } from 'better-auth/plugins'
import { PrismaClient } from '@/infra/database/generated/prisma/client'
import { ac, admin, developer, employee, user } from './permissions'

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
})

export const prisma = new PrismaClient({
  adapter,
})

export const accessControl = {
  ac,
  roles: {
    admin,
    developer,
    employee,
    user,
  },
}

const frontEndUrl = new URL(env.NEXT_PUBLIC_FRONT_END_URL)
const frontEndHost = frontEndUrl.hostname

const domainParts = frontEndHost.split('.')
const parentDomain = domainParts.length > 1 ? domainParts.slice(-2).join('.') : frontEndHost

const isSecure = env.NEXT_PUBLIC_FRONT_END_URL.startsWith('https://')

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  baseURL: env.NEXT_PUBLIC_FRONT_END_URL,
  trustedOrigins: [env.NEXT_PUBLIC_FRONT_END_URL],
  advanced: {
    useSecureCookies: isSecure,
    crossSubDomainCookies: {
      enabled: isSecure,
      domain: isSecure ? parentDomain : undefined,
    },
    cookiePrefix: 'qm_app',
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 1000 * 60 * 5,
    },
  },
  plugins: [
    openAPI(),
    bearer(),
    organization(),
    adminPlugin({
      ...accessControl,
    }) as BetterAuthPlugin,
  ],
})
