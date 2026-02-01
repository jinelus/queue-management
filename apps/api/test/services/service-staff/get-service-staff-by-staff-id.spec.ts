import { InMemoryOrganizationRepository, InMemoryServiceStaffRepository } from '@test/repositories'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { GetServiceStaffByStaffId } from '@/domain/master/application/services/service-staff/get-service-staff-by-staff-id.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('GetServiceStaffByStaffId', () => {
  let sut: GetServiceStaffByStaffId
  let serviceStaffRepository: InMemoryServiceStaffRepository
  let organizationRepository: InMemoryOrganizationRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    serviceStaffRepository = new InMemoryServiceStaffRepository()
    organizationRepository = new InMemoryOrganizationRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new GetServiceStaffByStaffId(
      serviceStaffRepository,
      organizationRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to get services for a staff member', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
      ownerId: 'user-1',
    })
    await organizationRepository.create(organization)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      actorId: 'admin-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.servicesStaff).toEqual([])
    }
  })
})
