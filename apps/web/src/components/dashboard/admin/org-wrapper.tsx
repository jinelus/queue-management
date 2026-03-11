import { getCurrentMember } from '@/actions/members'
import { Permission } from '@/components/auth/permission'
import { MemberDashboard } from '../member/member-dashboard'
import { OwnerDashboard } from './owner-dashboard'

export const OrgWrapper = async ({ params }: PageProps<'/[slug]'>) => {
  const { slug } = await params

  const { member, organization } = await getCurrentMember({ organizationSlug: slug })

  if (!organization) {
    return (
      <div className='p-4'>
        <p className='text-muted-foreground text-sm'>Organization not found.</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <Permission role={member?.role} allowRoles={['owner', 'admin']}>
        <OwnerDashboard activeOrg={organization} />
      </Permission>

      <Permission role={member?.role} allowRoles={['member']}>
        <MemberDashboard role={member?.role} organizationName={organization?.name} />
      </Permission>
    </div>
  )
}
