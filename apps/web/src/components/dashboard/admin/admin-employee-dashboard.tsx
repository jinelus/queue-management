import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type AdminEmployeeDashboardProps = {
  role?: string
  organizationName?: string
}

export function AdminEmployeeDashboard({ role, organizationName }: AdminEmployeeDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{role}</Badge>
        <Badge variant="outline">{organizationName ?? 'Active org'}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-sm">People waiting</CardTitle>
          </CardHeader>
          <CardContent className="font-semibold text-2xl">--</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-sm">Active staff</CardTitle>
          </CardHeader>
          <CardContent className="font-semibold text-2xl">--</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-sm">Serving now</CardTitle>
          </CardHeader>
          <CardContent className="font-semibold text-2xl">--</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-sm">Throughput today</CardTitle>
          </CardHeader>
          <CardContent className="font-semibold text-2xl">--</CardContent>
        </Card>
      </div>
    </div>
  )
}
