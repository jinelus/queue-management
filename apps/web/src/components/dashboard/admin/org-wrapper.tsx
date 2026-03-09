import { authClient } from "@/lib/auth-client"
import { getCurrentUser } from "@/lib/current-user"
import { Permission } from "@/components/auth/permission"
import { OwnerDashboard } from "./owner-dashboard"
import { MemberDashboard } from "../member/member-dashboard"
import { headers } from "next/headers"


export const OrgWrapper = async ({ params }: PageProps<'/[slug]'>) => {
  const { slug } = await params

  const user = await getCurrentUser()
  const { data: activeOrg } = await authClient.organization.getFullOrganization({
    query: {
        organizationSlug: slug
    },
    fetchOptions: {
        headers: await headers()
    }
  })

  if (!activeOrg) {
    return (<div className="p-4">
      <p className="text-sm text-muted-foreground">Organization not found.</p>
    </div>
    )
  }


  const currentMember = activeOrg?.members?.find(
    (m: { userId: string }) => m.userId === user?.id,
  )
  const memberRole = currentMember?.role

  return (
    <div className="space-y-4">
      <Permission role={memberRole} allowRoles={['owner', 'admin']}>
        <OwnerDashboard activeOrg={activeOrg} />
      </Permission>

      <Permission role={memberRole} allowRoles={['member']}>
        <MemberDashboard role={memberRole} organizationName={activeOrg?.name} />
      </Permission>
    </div>
  )
}