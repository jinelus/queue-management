'use client'

import { OrgSwitcher } from '@/components/sidebar/org-switcher'
import { SidebarNav } from '@/components/sidebar/sidebar-nav'
import { SidebarUser } from '@/components/sidebar/sidebar-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession()
  const { data: activeOrg } = authClient.useActiveOrganization()

  if (isPending || !session) {
    return null
  }

  const currentMember = activeOrg?.members?.find(
    (m: { userId: string }) => m.userId === session.user.id,
  )
  const memberRole = currentMember?.role ?? null

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarNav role={memberRole} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: memberRole ?? 'user',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
