import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@repo/env'
import { BetterAuthPlugin, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin as adminPlugin, bearer, organization } from 'better-auth/plugins'
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

const frontEndUrl = new URL(env.FRONT_END_URL)
const frontEndHost = frontEndUrl.hostname

const domainParts = frontEndHost.split('.')
const parentDomain = domainParts.length > 1 ? domainParts.slice(-2).join('.') : frontEndHost

const isSecure = env.FRONT_END_URL.startsWith('https://')

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [env.FRONT_END_URL],
  advanced: {
    useSecureCookies: isSecure,
    crossSubDomainCookies: {
      enabled: isSecure,
      domain: isSecure ? parentDomain : undefined,
    },
    cookiePrefix: 'qm_app_',
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 1000 * 60 * 5,
    },
  },
  plugins: [
    bearer(),
    organization(),
    adminPlugin({
      ...accessControl,
    }) as BetterAuthPlugin,
  ],
})
