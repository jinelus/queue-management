import 'server-only'

import type { SearchPublicOrganizationsControllerQueryParams } from '@/gen'
import { getPublicOrganizationBySlugController, searchPublicOrganizationsController } from '@/gen'

export async function searchPublicOrganizations(
  params?: SearchPublicOrganizationsControllerQueryParams,
) {
  return searchPublicOrganizationsController(params)
}

export async function getPublicOrganizationBySlug(slug: string) {
  return getPublicOrganizationBySlugController(slug)
}
