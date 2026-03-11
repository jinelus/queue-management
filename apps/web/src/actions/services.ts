'use server'

import { updateTag } from 'next/cache'
import { assignStaffToServiceController } from '@/gen/clients/assignStaffToServiceController'
import { createServiceController } from '@/gen/clients/createServiceController'
import { deleteServiceController } from '@/gen/clients/deleteServiceController'
import { getAllServicesController } from '@/gen/clients/getAllServicesController'
import { getServiceStaffByServiceIdController } from '@/gen/clients/getServiceStaffByServiceIdController'
import { getServicesStaffByServiceIdsController } from '@/gen/clients/getServicesStaffByServiceIdsController'
import { toggleServiceStatusController } from '@/gen/clients/toggleServiceStatusController'
import { unassignStaffFromServiceController } from '@/gen/clients/unassignStaffFromServiceController'
import type { AssignStaffToServiceBodyDto } from '@/gen/types/AssignStaffToServiceBodyDto'
import type { CreateServiceBodyDto } from '@/gen/types/CreateServiceBodyDto'
import type { GetAllServicesControllerQueryParams } from '@/gen/types/GetAllServicesController'
import type { ToggleServiceStatusBodyDto } from '@/gen/types/ToggleServiceStatusBodyDto'

export async function listServices(
  organizationId: string,
  params?: GetAllServicesControllerQueryParams,
) {
  const result = await getAllServicesController(organizationId, params)

  const [error] = result
  if (error) {
    throw new Error('Failed to load services')
  }

  return result[1]
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

export async function assignStaff(organizationId: string, data: AssignStaffToServiceBodyDto) {
  const result = await assignStaffToServiceController(organizationId, data)

  const [error] = result
  if (!error) {
    updateTag('services')
  }

  return result
}

export async function getServiceStaff(organizationId: string, serviceId: string) {
  const result = await getServiceStaffByServiceIdController(organizationId, serviceId)

  const [error] = result
  if (error) {
    throw new Error('Failed to load service staff')
  }

  return result[1]
}

export async function getServicesStaffByServiceIds(organizationId: string, serviceIds: string[]) {
  const result = await getServicesStaffByServiceIdsController(organizationId, { serviceIds })

  const [error] = result
  if (error) {
    throw new Error('Failed to load services staff')
  }

  return result[1]
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
