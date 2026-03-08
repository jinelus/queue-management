'use client'

import { Permission } from '@/components/auth/permission'
import { OwnerDashboard } from '@/components/dashboard/admin/owner-dashboard'
import { DashboardShellSkeleton } from '@/components/dashboard/dashboard-shell-skeleton'
import { MemberDashboard } from '@/components/dashboard/member/member-dashboard'
import { authClient } from '@/lib/auth-client'

export default function OrgDashboardPage() {
  const { data: session } = authClient.useSession()
  const { data: activeOrg, isPending } = authClient.useActiveOrganization()

  if (isPending || !activeOrg) {
    return <DashboardShellSkeleton />
  }

  const currentMember = activeOrg?.members?.find(
    (m: { userId: string }) => m.userId === session?.user?.id,
  )
  const memberRole = currentMember?.role

  return (
    <div className="space-y-4">
      <Permission role={memberRole} allowRoles={['owner', 'admin']}>
        <OwnerDashboard activeOrg={activeOrg} />
      </Permission>

      <Permission role={memberRole} allowRoles={['member']}>
        <MemberDashboard role={memberRole} organizationName={activeOrg.name} />
      </Permission>
    </div>
  )
}
