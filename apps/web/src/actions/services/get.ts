import { GetAllServicesControllerQueryParams, getAllServicesController } from '@/gen'
import 'server-only'

export async function listServices(
  organizationId: string,
  params?: GetAllServicesControllerQueryParams,
) {
  const result = await getAllServicesController(organizationId, params, {
    next: { tags: ['services'] },
  })

  return result
}
