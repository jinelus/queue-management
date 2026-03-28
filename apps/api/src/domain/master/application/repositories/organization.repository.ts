import { Repository } from '@/core/repositories/repository'
import { Organization } from '../../entreprise/entities/organization'

export interface SearchByNameOrSlugParams {
  search?: string
  page?: number
  perPage?: number
  orderBy?: 'name' | 'slug'
  order?: 'asc' | 'desc'
}

export abstract class OrganizationRepository extends Repository<Organization> {
  abstract findBySlug(slug: string): Promise<Organization | null>
  abstract searchByNameOrSlug(params?: SearchByNameOrSlugParams): Promise<Organization[]>
  abstract countSearchByNameOrSlug(search?: string): Promise<number>
}
