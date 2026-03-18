import { getDashboardSummaryController } from '@/gen'
import 'server-only'

export async function getDashboardSummary(organizationId: string) {
  const result = await getDashboardSummaryController(organizationId, {
    next: { tags: ['dashboard-summary'], revalidate: 3600 },
  })

  return result
}
