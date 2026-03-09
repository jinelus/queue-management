'use client'

import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export function SyncActiveOrg({ slug }: { slug: string }) {
  const { data: activeOrg } = authClient.useActiveOrganization()
  const { data: organizations } = authClient.useListOrganizations()

  useEffect(() => {
    if (!organizations) return
    if (activeOrg?.slug === slug) return

    const org = organizations.find((o) => o.slug === slug)
    if (org) {
      authClient.organization.setActive({ organizationId: org.id })
    }
  }, [slug, activeOrg?.slug, organizations])

  return null
}
