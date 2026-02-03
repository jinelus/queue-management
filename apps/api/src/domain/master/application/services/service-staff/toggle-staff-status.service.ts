import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { ServiceStaff } from '@/domain/master/entreprise/entities/service-staff'
import { PermissionFactory } from '../../permissions/permission.factory'
import { ServiceStaffRepository } from '../../repositories/service-staff.repository'

interface ToggleStaffStatusServiceParams {
  serviceStaffId: string
  actorId: string
  isOnline?: boolean
  isCounterClosed?: boolean
}

type ToggleStaffStatusServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    serviceStaff: ServiceStaff
  }
>

@Injectable()
export class ToggleStaffStatusService {
  constructor(
    private readonly serviceStaffRepository: ServiceStaffRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    serviceStaffId,
    actorId,
    isOnline,
    isCounterClosed,
  }: ToggleStaffStatusServiceParams): Promise<ToggleStaffStatusServiceResponse> {
    const { success } = await this.permissionFactory.userCan('update', 'service', {
      userId: actorId,
    })

    if (!success) {
      return left(new NotAllowedError())
    }

    const serviceStaff = await this.serviceStaffRepository.findById(serviceStaffId)

    if (!serviceStaff) {
      return left(new NotFoundError('Service staff assignment not found'))
    }

    if (isOnline !== undefined) {
      serviceStaff.isOnline = isOnline
    }

    if (isCounterClosed !== undefined) {
      serviceStaff.isCounterClosed = isCounterClosed
    }

    await this.serviceStaffRepository.save(serviceStaff)

    return right({ serviceStaff })
  }
}
