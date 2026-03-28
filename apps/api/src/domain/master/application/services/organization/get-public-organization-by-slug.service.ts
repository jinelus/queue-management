import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { OrganizationRepository } from '../../repositories/organization.repository'

interface GetPublicOrganizationBySlugServiceParams {
  slug: string
}

type GetPublicOrganizationBySlugServiceResponse = Either<
  NotFoundError,
  {
    organization: Organization
  }
>

@Injectable()
export class GetPublicOrganizationBySlugService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute({
    slug,
  }: GetPublicOrganizationBySlugServiceParams): Promise<GetPublicOrganizationBySlugServiceResponse> {
    const organization = await this.organizationRepository.findBySlug(slug)

    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    return right({ organization })
  }
}
