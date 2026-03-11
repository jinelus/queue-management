import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceStaffRepository } from '../../repositories/service-staff.repository'

interface UnassignStaffFromServiceParams {
  actorId: string
  organizationId: string
  serviceId: string
  userId: string
}

type UnassignStaffFromServiceResponse = Either<NotAllowedError | NotFoundError | Error, null>

@Injectable()
export class UnassignStaffFromService {
  constructor(
    private readonly serviceStaffRepository: ServiceStaffRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    actorId,
    organizationId,
    serviceId,
    userId,
  }: UnassignStaffFromServiceParams): Promise<UnassignStaffFromServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)
    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    const { success } = await this.permissionFactory.userCan('delete', 'serviceStaff', {
      userId: actorId,
      organizationId,
    })

    if (!success) {
      return left(new NotAllowedError())
    }

    const serviceStaff = await this.serviceStaffRepository.findByPair(serviceId, userId)
    if (!serviceStaff) {
      return left(new NotFoundError('Staff assignment not found'))
    }

    await this.serviceStaffRepository.delete(serviceStaff)

    return right(null)
  }
}
