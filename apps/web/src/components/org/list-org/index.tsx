import { listUserOrganizations } from "@/lib/current-user"
import { Route } from "next"
import { redirect } from "next/navigation"
import { SyncActiveOrg } from "../sync-active-org"


export const ListSyncOrganizations = async ({ params }: { params: Promise<{ slug: string }>}) => {
  const { slug } = await params
  const organizations = await listUserOrganizations()

  const org = organizations.find((o) => o.slug === slug)

  if (!org) {
    redirect('/org' as Route)
  }

  return (
    <SyncActiveOrg slug={slug} />
  )
}