import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Service } from '@/domain/master/entreprise/entities/service'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'

interface CreateServiceServiceParams {
  userId: string

  name: string
  description?: string
  avgDurationInt?: number
  organizationId: string
  isActive?: boolean
}

type CreateServiceServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    service: Service
  }
>

@Injectable()
export class CreateServiceService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    name,
    description,
    avgDurationInt,
    organizationId,
    isActive,
    userId,
  }: CreateServiceServiceParams): Promise<CreateServiceServiceResponse> {
    const { success } = await this.permissionFactory.userCan('create', 'service', { userId })

    if (!success) {
      return left(new NotAllowedError())
    }

    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      return left(new NotFoundError())
    }

    const service = Service.create({
      name,
      description,
      avgDurationInt,
      organizationId,
      isActive,
    })

    await this.serviceRepository.create(service)

    return right({
      service,
    })
  }
}
