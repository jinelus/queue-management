import { Route } from 'next'
import { redirect } from 'next/navigation'
import { listUserOrganizations } from '@/lib/current-user'
import { OrgPageClient } from './org-page-client'

export const OrganizationPage = async () => {
  const organizations = await listUserOrganizations()

  if (organizations.length >= 1) {
    redirect(`/${organizations[0]?.slug}` as Route)
  }

  return <OrgPageClient />
}
