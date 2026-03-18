import { headers } from 'next/headers'
import { authClient } from '@/lib/auth-client'
import { getCurrentUser } from '@/lib/current-user'
import 'server-only'

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
  params?: { limit?: number; offset?: number; q?: string }
}) {
  const { data, error } = await authClient.organization.listMembers({
    query: {
      limit: params?.limit ?? 10,
      offset: params?.offset ?? 0,
      filterValue: params?.q ?? '',
      sortBy: 'createdAt',
      sortDirection: 'desc',
      organizationSlug,
    },
    fetchOptions: {
      headers: await headers(),
    },
  })

  if (error || !data) {
    return {
      ok: false as const,
      error: error?.message ?? 'Failed to load members',
      members: null,
      total: 0,
    }
  }

  const total =
    typeof (data as { total?: unknown }).total === 'number'
      ? (data as { total: number }).total
      : data.members.length

  return {
    ok: true as const,
    members: data.members,
    total,
  }
}
