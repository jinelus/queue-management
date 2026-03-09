import { Building2, Plus } from 'lucide-react'
import { CreateOrganizationDialog } from '@/components/org/create-organization-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OrgPageClient() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>Create your first organization</CardTitle>
        <CardDescription>
          You need an organization to get started. Create one now to begin managing your queues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CreateOrganizationDialog
          trigger={
            <Button className="w-full gap-2" variant={'default'}>
              <Plus className="h-4 w-4" />
              Create organization
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}
