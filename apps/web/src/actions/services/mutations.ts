'use server'

import { updateTag } from 'next/cache'
import {
  CreateServiceBodyDto,
  createServiceController,
  deleteServiceController,
  ToggleServiceStatusBodyDto,
  toggleServiceStatusController,
} from '@/gen'

export async function addService(organizationId: string, data: CreateServiceBodyDto) {
  const result = await createServiceController(organizationId, data)

  const [error] = result
  if (!error) {
    updateTag('services')
  }

  return result
}

export async function removeService(organizationId: string, serviceId: string) {
  const result = await deleteServiceController(organizationId, serviceId)

  const [error] = result
  if (!error) {
    updateTag('services')
  }

  return result
}

export async function toggleService(
  organizationId: string,
  serviceId: string,
  data: ToggleServiceStatusBodyDto,
) {
  const result = await toggleServiceStatusController(organizationId, serviceId, data)

  const [error] = result
  if (!error) {
    updateTag('services')
  }

  return result
}
