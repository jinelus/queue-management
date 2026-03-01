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

  return (
    <div className="space-y-4">
      <Permission role={user.role} allowRoles={['admin', 'developer', 'owner', 'employee']}>
        <AdminEmployeeDashboard role={user.role} organizationName={activeOrg.name} />
      </Permission>

      <Permission role={user.role} allowRoles={['member', 'user']}>
        <MemberDashboard role={user.role} organizationName={activeOrg.name} />
      </Permission>
    </div>
  )
}
