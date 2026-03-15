import { getAnalyticsController } from '@/gen'
import 'server-only'

export async function getAnalyticsData(organizationId: string) {
  const res = await getAnalyticsController(organizationId, undefined, {
    next: { tags: ['analytics'], revalidate: 3600 },
  })

  return res
}
