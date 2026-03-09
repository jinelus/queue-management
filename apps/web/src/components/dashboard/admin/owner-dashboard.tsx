import { ArrowRightIcon, LayoutDashboard, Settings, Shield, Users } from 'lucide-react'
import { Route } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrgAnalyticsCharts } from './org-analytics-charts'
import { OrgHeader } from './org-header'
import { OrgMembersPreview } from './org-members-preview'
import { OrgOverview } from './org-overview'
import { OrgUsageStats } from './org-usage-stats'

export type OrgMember = {
  id: string
  userId: string
  role: string
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export type ActiveOrg = {
  id: string
  name: string
  slug: string
  logo?: string | null
  createdAt?: Date
  members?: OrgMember[]
}

type OwnerDashboardProps = {
  activeOrg: ActiveOrg
}

function buildUsageStats(membersCount: number) {
  return [
    { label: 'People in queue', value: 23, limit: 100, trend: 'up' as const },
    { label: 'Active staff', value: 5, limit: 12, trend: 'neutral' as const },
    { label: 'Served today', value: 147, trend: 'up' as const },
    { label: 'Members', value: membersCount, limit: 20, trend: 'neutral' as const },
  ]
}

export function OwnerDashboard({ activeOrg }: OwnerDashboardProps) {
  const membersCount = activeOrg.members?.length ?? 0
  const stats = buildUsageStats(membersCount)

  return (
    <div className="space-y-6">
      <OrgHeader
        name={activeOrg.name}
        slug={activeOrg.slug}
        logo={activeOrg.logo}
        membersCount={membersCount}
      />

      <Separator />

      <OrgAnalyticsCharts />

      <Separator />

      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">
            <LayoutDashboard className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="size-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="access">
            <Shield className="size-4" />
            Access
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="size-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <OrgUsageStats stats={stats} />
          <OrgOverview
            organizationName={activeOrg.name}
            membersCount={membersCount}
            slug={activeOrg.slug}
            createdAt={activeOrg.createdAt}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div>
            <div className="flex w-full justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${activeOrg.slug}/members` as Route}>
                  Manage members
                  <ArrowRightIcon />
                </Link>
              </Button>
            </div>
          </div>
          <OrgMembersPreview members={activeOrg.members ?? []} />
        </TabsContent>

        <TabsContent value="access" className="mt-6">
          <PlaceholderSection
            title="Access"
            description="Role-based access control settings will appear here."
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <PlaceholderSection
            title="Settings"
            description="Organization settings and configuration will appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border p-8 text-center">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
