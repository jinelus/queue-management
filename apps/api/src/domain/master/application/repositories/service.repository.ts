import { PaginationParams } from '@/core/repositories/pagination-params'
import { Repository } from '@/core/repositories/repository'
import { Service } from '../../entreprise/entities/service'

export interface FindServicesParams extends PaginationParams {
  isActive?: boolean
}

export abstract class ServiceRepository extends Repository<Service> {
  abstract findServices(
    organizationId: string,
    params?: FindServicesParams,
  ): Promise<Array<Service>>
  abstract count(organizationId: string, params?: FindServicesParams): Promise<number>
}
