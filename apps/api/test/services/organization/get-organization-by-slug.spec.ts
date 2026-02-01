import { GetOrganizationBySlugService } from '@/domain/master/application/services/organization/get-organization-by-slug.service'
import { OrganizationRepository } from '@/domain/master/application/repositories/organization.repository'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { NotFoundError } from '@/core/errors/not-found-error'
import { Organization } from '@/domain/master/entreprise/entities/organization'

describe('GetOrganizationBySlugService', () => {
  let sut: GetOrganizationBySlugService
  let organizationRepository: OrganizationRepository
  let permissionFactory: PermissionFactory

  beforeEach(() => {
    organizationRepository = {
      findBySlug: vi.fn(),
    } as any
    permissionFactory = {
      userCan: vi.fn(),
    } as any

    sut = new GetOrganizationBySlugService(
      organizationRepository,
      permissionFactory,
    )
  })

  it('should be able to get organization by slug', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
      ownerId: 'user-1',
    })

    vi.spyOn(permissionFactory, 'userCan').mockResolvedValue({ success: true })
    vi.spyOn(organizationRepository, 'findBySlug').mockResolvedValue(organization)

    const result = await sut.execute({
      slug: 'org-1',
      userId: 'user-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.organization).toBeInstanceOf(Organization)
      expect(result.value.organization.slug).toBe('org-1')
    }
  })

  it('should not be able to get organization if not found', async () => {
    vi.spyOn(permissionFactory, 'userCan').mockResolvedValue({ success: true })
    vi.spyOn(organizationRepository, 'findBySlug').mockResolvedValue(null)

    const result = await sut.execute({
      slug: 'org-1',
      userId: 'user-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
