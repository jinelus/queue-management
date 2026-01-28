import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'

interface DeleteServiceServiceParams {
  serviceId: string
  userId: string
  organizationId: string
}

type DeleteServiceServiceResponse = Either<NotAllowedError | NotFoundError, null>

@Injectable()
export class DeleteServiceService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    serviceId,
    userId,
    organizationId,
  }: DeleteServiceServiceParams): Promise<DeleteServiceServiceResponse> {
    const { success } = await this.permissionFactory.userCan('delete', 'service', { userId })

    if (!success) {
      return left(new NotAllowedError())
    }

    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      return left(new NotFoundError())
    }

    const service = await this.serviceRepository.findById(serviceId)

    if (!service) {
      return left(new NotFoundError())
    }

    if (service.organizationId.toString() !== organization.id.toString()) {
      return left(new NotAllowedError())
    }

    await this.serviceRepository.delete(service)

    return right(null)
  }
}
