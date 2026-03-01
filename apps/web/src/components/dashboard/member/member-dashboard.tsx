import { Permission } from '@/components/auth/permission'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MemberDashboardProps = {
  role?: string
  organizationName?: string
}

export function MemberDashboard({ role, organizationName }: MemberDashboardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr_20rem]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Queue Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Organization</span>
            <Badge variant="secondary">{organizationName ?? 'Active org'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Waiting</span>
            <span className="font-semibold">--</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Status</span>
            <Badge>Online</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Name</p>
            <p className="font-semibold text-lg">No active client</p>
            <p className="mt-2 text-muted-foreground text-sm">Service: --</p>
            <p className="text-muted-foreground text-sm">Timer: --</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Permission role={role} allowRoles={['member', 'employee', 'admin']}>
              <Button variant="default">Served</Button>
            </Permission>
            <Permission role={role} allowRoles={['member', 'employee', 'admin']}>
              <Button variant="destructive">Absent</Button>
            </Permission>
            <Permission role={role} allowRoles={['member', 'employee', 'admin']}>
              <Button variant="secondary">Transfer</Button>
            </Permission>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Up Next</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>No queued clients</li>
          </ul>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <Permission role={role} allowRoles={['member', 'employee', 'admin']}>
          <Button size="lg" className="w-full md:w-auto">
            CALL NEXT
          </Button>
        </Permission>
      </div>
    </div>
  )
}
