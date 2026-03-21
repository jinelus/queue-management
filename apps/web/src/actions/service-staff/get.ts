import 'server-only'

import {
  getServiceStaffByServiceIdController,
  getServiceStaffByStaffIdController,
  getServicesStaffByServiceIdsController,
} from '@/gen'

export async function getServicesStaffByServiceIds(organizationId: string, serviceIds: string[]) {
  const result = await getServicesStaffByServiceIdsController(
    organizationId,
    { serviceIds },
    {
      next: { tags: ['services-staff'], revalidate: 3600 },
    },
  )

  return result
}

export async function getServiceStaff(organizationId: string, serviceId: string) {
  const result = await getServiceStaffByServiceIdController(organizationId, serviceId, {
    next: { tags: [`services-staff-${serviceId}`], revalidate: 3600 },
  })

  return result
}

export async function getServiceStaffByStaffId(organizationId: string) {
  const result = await getServiceStaffByStaffIdController(organizationId, {
    next: { tags: ['services-staff-by-staff'], revalidate: 3600 },
  })

  return result
}
