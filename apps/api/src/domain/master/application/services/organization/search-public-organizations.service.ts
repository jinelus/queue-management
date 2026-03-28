import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { OrganizationRepository } from '../../repositories/organization.repository'

interface SearchPublicOrganizationsServiceParams {
  search?: string
  page?: number
  perPage?: number
  orderBy?: 'name' | 'slug'
  order?: 'asc' | 'desc'
}

type SearchPublicOrganizationsServiceResponse = Either<
  null,
  {
    organizations: Organization[]
    meta: {
      total: number
      totalPages: number
      hasNext: boolean
    }
  }
>

@Injectable()
export class SearchPublicOrganizationsService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute({
    search,
    page = 1,
    perPage = 10,
    order,
    orderBy,
  }: SearchPublicOrganizationsServiceParams): Promise<SearchPublicOrganizationsServiceResponse> {
    const organizations = await this.organizationRepository.searchByNameOrSlug({
      search,
      page,
      perPage,
      orderBy: orderBy ?? 'name',
      order: order || 'desc',
    })

    const total = await this.organizationRepository.countSearchByNameOrSlug(search)

    const totalPages = Math.ceil(total / perPage)
    const hasNext = page < totalPages

    return right({
      organizations,
      meta: {
        total,
        totalPages,
        hasNext,
      },
    })
  }
}
