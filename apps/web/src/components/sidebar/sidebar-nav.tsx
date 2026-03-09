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
import { useParams, usePathname } from 'next/navigation'
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
  path: string
  icon: LucideIcon
  allowRoles?: string[]
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '',
    icon: LayoutDashboard,
  },
  {
    title: 'Tickets',
    path: '/tickets',
    icon: Ticket,
  },
  {
    title: 'Services',
    path: '/services',
    icon: Briefcase,
    allowRoles: ['owner', 'admin', 'member'],
  },
  {
    title: 'Staff',
    path: '/staff',
    icon: UserCog,
    allowRoles: ['owner', 'admin'],
  },
]

const adminNavItems: NavItem[] = [
  {
    title: 'Members',
    path: '/members',
    icon: Users,
    allowRoles: ['owner', 'admin'],
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    allowRoles: ['owner', 'admin'],
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    allowRoles: ['owner', 'admin'],
  },
]

type SidebarNavProps = {
  role?: string | null
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  function href(path: string) {
    return `/${slug}${path}` as Route
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>General</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <Permission key={item.path} role={role} allowRoles={item.allowRoles}>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === href(item.path)}>
                    <Link href={href(item.path)}>
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
                <Permission key={item.path} role={role} allowRoles={item.allowRoles}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === href(item.path)}>
                      <Link href={href(item.path)}>
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
