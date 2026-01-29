import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { ServiceStaff } from '@/domain/master/entreprise/entities/service-staff'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'
import { ServiceStaffRepository } from '../../repositories/service-staff.repository'

interface GetServiceStaffByServiceIdParams {
  actorId: string
  organizationId: string
  serviceId: string
}

type GetServiceStaffByServiceIdResponse = Either<
  NotAllowedError | NotFoundError | Error,
  {
    servicesStaff: ServiceStaff[]
  }
>

@Injectable()
export class GetServiceStaffByServiceId {
  constructor(
    private readonly serviceStaffRepository: ServiceStaffRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    actorId,
    serviceId,
    organizationId,
  }: GetServiceStaffByServiceIdParams): Promise<GetServiceStaffByServiceIdResponse> {
    const organization = await this.organizationRepository.findById(organizationId)
    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    const { success } = await this.permissionFactory.userCan('get', 'serviceStaff', {
      userId: actorId,
    })

    if (!success) {
      return left(new NotAllowedError())
    }

    const service = await this.serviceRepository.findById(serviceId)
    if (!service) {
      return left(new NotFoundError('Service not found'))
    }

    if (service.organizationId.toString() !== organization.id.toString()) {
      return left(new NotFoundError('Service does not belong to the organization'))
    }

    const servicesStaff = await this.serviceStaffRepository.findByServiceId(serviceId)

    return right({ servicesStaff })
  }
}
