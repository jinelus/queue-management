import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Service } from '@/domain/master/entreprise/entities/service'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'

interface GetAllServicesServiceParams {
  organizationId: string

  page?: number
  perPage?: number
  order?: 'asc' | 'desc'
  orderBy?: string
  search?: string
}

type GetAllServicesServiceResponse = Either<NotFoundError, { services: Service[]; count: number }>

@Injectable()
export class GetAllServicesService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute({
    organizationId,
    page,
    perPage,
    order,
    orderBy,
    search,
  }: GetAllServicesServiceParams): Promise<GetAllServicesServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)
    if (!organization) return left(new NotFoundError('Organization not found'))

    const services = await this.serviceRepository.findServices(organizationId, {
      page,
      perPage,
      orderBy,
      order,
      search,
    })

    const count = await this.serviceRepository.count(organizationId, { search, orderBy, order })

    return right({ services, count })
  }
}
