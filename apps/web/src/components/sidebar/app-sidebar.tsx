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

  if (isPending || !session) {
    return null
  }

  const user = session.user as typeof session.user & { role?: string }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarNav role={user.role} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role ?? 'user',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
