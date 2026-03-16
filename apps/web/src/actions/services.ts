'use server'

import { updateTag } from 'next/cache'
import { createServiceController } from '@/gen/clients/createServiceController'
import { deleteServiceController } from '@/gen/clients/deleteServiceController'
import { getAllServicesController } from '@/gen/clients/getAllServicesController'
import { toggleServiceStatusController } from '@/gen/clients/toggleServiceStatusController'
import type { CreateServiceBodyDto } from '@/gen/types/CreateServiceBodyDto'
import type { GetAllServicesControllerQueryParams } from '@/gen/types/GetAllServicesController'
import type { ToggleServiceStatusBodyDto } from '@/gen/types/ToggleServiceStatusBodyDto'

export async function listServices(
  organizationId: string,
  params?: GetAllServicesControllerQueryParams,
) {
  const result = await getAllServicesController(organizationId, params, {
    next: { tags: ['services'] },
  })

  return result
}

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
