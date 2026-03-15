'use server'

import { updateTag } from 'next/cache'
import {
  AssignStaffToServiceBodyDto,
  assignStaffToServiceController,
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
