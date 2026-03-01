import { DashboardClientRoot } from '@/components/dashboard/dashboard-client-root'
import { getCurrentUser, listUserOrganizations } from '@/lib/current-user'

export async function DashboardStream() {
  const user = await getCurrentUser()

  const organizations = await listUserOrganizations()

  return <DashboardClientRoot user={user} organizations={organizations} />
}
