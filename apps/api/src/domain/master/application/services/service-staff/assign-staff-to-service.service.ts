import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { ServiceStaff } from '@/domain/master/entreprise/entities/service-staff'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { ServiceRepository } from '../../repositories/service.repository'
import { ServiceStaffRepository } from '../../repositories/service-staff.repository'
import { UserRepository } from '../../repositories/user.repository'

interface AssignStaffToServiceParams {
  actorId: string
  organizationId: string
  serviceId: string
  userId: string
}

type AssignStaffToServiceResponse = Either<
  NotAllowedError | NotFoundError | Error,
  {
    serviceStaff: ServiceStaff
  }
>

@Injectable()
export class AssignStaffToService {
  constructor(
    private readonly serviceStaffRepository: ServiceStaffRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    actorId,
    serviceId,
    userId,
    organizationId,
  }: AssignStaffToServiceParams): Promise<AssignStaffToServiceResponse> {
    const { success } = await this.permissionFactory.userCan('create', 'serviceStaff', {
      userId: actorId,
    })

    const organization = await this.organizationRepository.findById(organizationId)
    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

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

    const user = await this.userRepository.findById(userId)
    if (!user) {
      return left(new NotFoundError('User not found'))
    }

    const existing = await this.serviceStaffRepository.findByPair(serviceId, userId)
    if (existing) {
      if (!existing.active) {
        existing.active = true
        await this.serviceStaffRepository.save(existing)
        return right({ serviceStaff: existing })
      }
      return left(new Error('Staff already assigned'))
    }

    const serviceStaff = ServiceStaff.create({
      serviceId,
      userId,
      active: true,
    })

    await this.serviceStaffRepository.create(serviceStaff)

    return right({ serviceStaff })
  }
}
