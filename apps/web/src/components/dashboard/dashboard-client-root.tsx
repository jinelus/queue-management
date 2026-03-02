'use client'

import { Permission } from '@/components/auth/permission'
import { AdminEmployeeDashboard } from '@/components/dashboard/admin/admin-employee-dashboard'
import { CreateFirstOrganizationCard } from '@/components/dashboard/create-first-organization-card'
import { MemberDashboard } from '@/components/dashboard/member/member-dashboard'
import { authClient } from '@/lib/auth-client'
import { OrganizationOutput, UserOutput } from '../../../utils/types'

export function DashboardClientRoot({
  user,
  organizations,
}: {
  user: UserOutput
  organizations: Array<OrganizationOutput>
}) {
  const { data: activeOrg } = authClient.useActiveOrganization()

  if (organizations.length === 0 || !activeOrg) {
    return <CreateFirstOrganizationCard organizations={organizations} />
  }

  const currentMember = activeOrg?.members?.find((m: { userId: string }) => m.userId === user.id)
  const memberRole = currentMember?.role

  return (
    <div className="space-y-4">
      <Permission role={memberRole} allowRoles={['owner', 'admin']}>
        <AdminEmployeeDashboard role={memberRole} organizationName={activeOrg.name} />
      </Permission>

      <Permission role={memberRole} allowRoles={['member']}>
        <MemberDashboard role={memberRole} organizationName={activeOrg.name} />
      </Permission>
    </div>
  )
}
