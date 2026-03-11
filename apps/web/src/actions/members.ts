'use server'

import { headers } from 'next/headers'
import { authClient } from '@/lib/auth-client'
import { getCurrentUser } from '@/lib/current-user'

export async function getCurrentMember({ organizationSlug }: { organizationSlug: string }) {
  const user = await getCurrentUser()
  const { data } = await authClient.organization.getFullOrganization({
    query: {
      organizationSlug,
    },
    fetchOptions: {
      headers: await headers(),
    },
  })

  if (!data) {
    return {
      organization: null,
      member: null,
    }
  }

  const currentMember = data?.members?.find((m: { userId: string }) => m.userId === user?.id)

  return {
    organization: data,
    member: currentMember,
  }
}

export async function listMembers({
  organizationSlug,
  params,
}: {
  organizationSlug: string
  params?: { limit?: number; offset?: number }
}) {
  const { data, error } = await authClient.organization.listMembers({
    query: {
      limit: params?.limit || 10,
      offset: params?.offset || 0,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      organizationSlug,
    },
    fetchOptions: {
      headers: await headers(),
    },
  })

  if (error || !data) {
    throw new Error('Failed to load members')
  }

  return {
    members: data.members,
  }
}
