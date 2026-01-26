import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Service } from '@/domain/master/entreprise/entities/service'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'

interface UpdateServiceServiceParams {
  userId: string
  organizationId: string

  serviceId: string
  name?: string
  description?: string
  avgDurationInt?: number
  isActive?: boolean
}

type UpdateServiceServiceResponse = Either<NotAllowedError | NotFoundError, { service: Service }>

@Injectable()
export class UpdateServiceService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    userId,
    serviceId,
    name,
    description,
    avgDurationInt,
    isActive,
    organizationId,
  }: UpdateServiceServiceParams): Promise<UpdateServiceServiceResponse> {
    const { success } = await this.permissionFactory.userCan('update', 'service', { userId })
    if (!success) return left(new NotAllowedError())

    const organization = await this.organizationRepository.findById(organizationId)
    if (!organization) return left(new NotFoundError('Organization not found'))

    const service = await this.serviceRepository.findById(serviceId)
    if (!service) return left(new NotFoundError('Service not found'))

    if (service.organizationId.toString() !== organization.id.toString()) {
      return left(new NotFoundError('Service not found in this organization'))
    }

    if (name !== undefined) service.name = name
    if (description !== undefined) service.description = description
    if (avgDurationInt !== undefined) service.avgDurationInt = avgDurationInt
    if (isActive !== undefined) service.isActive = isActive

    await this.serviceRepository.save(service)
    return right({ service })
  }
}
