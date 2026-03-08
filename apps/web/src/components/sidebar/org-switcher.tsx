'use client'

import { ChevronsUpDown, Plus } from 'lucide-react'
import { Route } from 'next'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { CreateOrganizationDialog } from '@/components/org/create-organization-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'
import { getInitials } from '@/utils/format'
import { Button } from '../ui/button'

export function OrgSwitcher() {
  const { data: organizations, isPending: isLoadingOrgs } = authClient.useListOrganizations()
  const { data: activeOrg, isPending: isLoadingActive } = authClient.useActiveOrganization()
  const { isMobile } = useSidebar()
  const params = useParams<{ slug: string }>()
  const [open, setOpen] = useState(false)

  const isLoading = isLoadingOrgs || isLoadingActive

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {activeOrg && (
                <Avatar className="h-8 w-8 rounded-lg">
                  {activeOrg?.logo && <AvatarImage src={activeOrg.logo} alt={activeOrg.name} />}
                  <AvatarFallback className="rounded-lg text-xs">
                    {getInitials(activeOrg.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrg?.name ?? 'Select organization'}
                </span>
                <span className="truncate text-muted-foreground text-xs">
                  {activeOrg?.slug ?? 'No org selected'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {organizations?.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className="gap-2 p-2"
                asChild
                onSelect={() => setOpen(false)}
              >
                <Link href={`/${org.slug}` as Route}>
                  <Avatar className="h-6 w-6 rounded-md">
                    {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
                    <AvatarFallback className="rounded-md text-xs">
                      {getInitials(org.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{org.name}</span>
                  {params.slug === org.slug && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
            {(!organizations || organizations.length === 0) && (
              <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                No organizations found
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <CreateOrganizationDialog
              trigger={
                <Button
                  className="w-full items-center justify-center gap-2 p-2 hover:bg-background/50"
                  variant={'ghost'}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <span className="font-medium text-muted-foreground">Create organization</span>
                </Button>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
