import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { PermissionFactory } from '../../permissions/permission.factory'
import { OrganizationRepository } from '../../repositories/organization.repository'

interface GetOrganizationBySlugServiceParams {
  userId: string
  slug: string
}

type GetOrganizationBySlugServiceResponse = Either<
  NotFoundError | NotAllowedError,
  {
    organization: Organization
  }
>

@Injectable()
export class GetOrganizationBySlugService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly userPermission: PermissionFactory,
  ) {}

  async execute({
    slug,
    userId,
  }: GetOrganizationBySlugServiceParams): Promise<GetOrganizationBySlugServiceResponse> {
    const { success } = await this.userPermission.userCan('get', 'organization', { userId })

    if (!success) {
      return left(new NotAllowedError())
    }

    const organization = await this.organizationRepository.findBySlug(slug)

    if (!organization) {
      return left(new NotFoundError())
    }

    return right({
      organization,
    })
  }
}
