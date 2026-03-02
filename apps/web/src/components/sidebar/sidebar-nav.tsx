'use client'

import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Ticket,
  UserCog,
  Users,
} from 'lucide-react'
import { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Permission } from '@/components/auth/permission'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  allowRoles?: string[]
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Tickets',
    href: '/dashboard/tickets',
    icon: Ticket,
  },
  {
    title: 'Services',
    href: '/dashboard/services',
    icon: Briefcase,
    allowRoles: ['owner', 'admin', 'member'],
  },
  {
    title: 'Staff',
    href: '/dashboard/staff',
    icon: UserCog,
    allowRoles: ['owner', 'admin'],
  },
]

const adminNavItems: NavItem[] = [
  {
    title: 'Members',
    href: '/dashboard/members',
    icon: Users,
    allowRoles: ['owner', 'admin'],
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    allowRoles: ['owner', 'admin'],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    allowRoles: ['owner', 'admin'],
  },
]

type SidebarNavProps = {
  role?: string | null
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>General</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <Permission key={item.href} role={role} allowRoles={item.allowRoles}>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href as Route}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Permission>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Permission role={role} allowRoles={['owner', 'admin']}>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <Permission key={item.href} role={role} allowRoles={item.allowRoles}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href as Route}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Permission>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </Permission>
    </>
  )
}
