import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Service } from '@/domain/master/entreprise/entities/service'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'

interface GetServiceByIdServiceParams {
  organizationId: string
  serviceId: string
}

type GetServiceByIdServiceResponse = Either<NotFoundError, { service: Service }>

@Injectable()
export class GetServiceByIdService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute({
    serviceId,
    organizationId,
  }: GetServiceByIdServiceParams): Promise<GetServiceByIdServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)
    if (!organization) return left(new NotFoundError('Organization not found'))

    const service = await this.serviceRepository.findById(serviceId)
    if (!service) return left(new NotFoundError('Service not found'))

    return right({ service })
  }
}
