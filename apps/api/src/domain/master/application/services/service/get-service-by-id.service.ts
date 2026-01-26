import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Service } from '@/domain/master/entreprise/entities/service'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'

interface GetServiceServiceParams {
  organizationId: string
  serviceId: string
}

type GetServiceServiceResponse = Either<NotFoundError, { service: Service }>

@Injectable()
export class GetServiceService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute({
    serviceId,
    organizationId,
  }: GetServiceServiceParams): Promise<GetServiceServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)
    if (!organization) return left(new NotFoundError('Organization not found'))

    const service = await this.serviceRepository.findById(serviceId)
    if (!service) return left(new NotFoundError('Service not found'))

    return right({ service })
  }
}
