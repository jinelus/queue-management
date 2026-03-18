'use server'

import { updateTag } from 'next/cache'
import {
  AssignStaffToServiceBodyDto,
  assignStaffToServiceController,
  ToggleStaffStatusBodyDto,
  toggleStaffStatusController,
  unassignStaffFromServiceController,
} from '@/gen'

export async function assignStaff(organizationId: string, data: AssignStaffToServiceBodyDto) {
  const result = await assignStaffToServiceController(organizationId, data)

  const [error] = result
  if (!error) {
    updateTag('services')
  }

  return result
}

export async function unassignStaff(
  organizationId: string,
  data: { serviceId: string; staffId: string },
) {
  const result = await unassignStaffFromServiceController(organizationId, data)

  const [error] = result
  if (!error) {
    updateTag('services')
  }

  return result
}

export async function toggleStaffStatus(
  organizationId: string,
  serviceStaffId: string,
  data: ToggleStaffStatusBodyDto,
) {
  const result = await toggleStaffStatusController(organizationId, serviceStaffId, data)

  const [error] = result
  if (!error) {
    updateTag('dashboard-summary')
    updateTag('services-staff')
    updateTag('services-staff-by-staff')
  }

  return result
}
