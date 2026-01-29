import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { ServiceStaff } from '@/domain/master/entreprise/entities/service-staff'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceStaffRepository } from '../../repositories/service-staff.repository'

interface GetServiceStaffByStaffIdParams {
  actorId: string
  organizationId: string
}

type GetServiceStaffByStaffIdResponse = Either<
  NotAllowedError | NotFoundError | Error,
  {
    servicesStaff: ServiceStaff[]
  }
>

@Injectable()
export class GetServiceStaffByStaffId {
  constructor(
    private readonly serviceStaffRepository: ServiceStaffRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    actorId,
    organizationId,
  }: GetServiceStaffByStaffIdParams): Promise<GetServiceStaffByStaffIdResponse> {
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

    const servicesStaff = await this.serviceStaffRepository.findByUserId(organizationId, actorId)

    return right({ servicesStaff })
  }
}
