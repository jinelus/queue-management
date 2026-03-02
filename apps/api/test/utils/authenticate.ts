import { makeAdmin, makeEmployee, makeUser } from '@test/factories'
import type { PrismaClient } from '@/infra/database/generated/prisma/client'
import { makeOrganization } from '../factories/make-organization'
import { makeSession } from '../factories/make-session'

interface AuthenticateOptions {
  userId?: string
  role?: 'user' | 'member' | 'admin'
  organizationId?: string
}

export async function authenticate(prisma: PrismaClient, options: AuthenticateOptions = {}) {
  const { userId, role = 'user', organizationId } = options

  let finalUserId = userId
  let orgId = organizationId

  if (!finalUserId) {
    if (role === 'admin' || role === 'member') {
      orgId = orgId ?? (await makeOrganization(prisma)).id
      if (role === 'admin') {
        const user = await makeAdmin(prisma, orgId)
        finalUserId = user.id
      } else {
        const user = await makeEmployee(prisma, orgId)
        finalUserId = user.id
      }
    } else {
      const user = await makeUser(prisma)
      finalUserId = user.id
    }
  }

  const session = await makeSession(prisma, finalUserId, {
    ...(orgId ? { activeOrganizationId: orgId } : {}),
  })

  return {
    token: session.token,
    userId: finalUserId,
  }
}
