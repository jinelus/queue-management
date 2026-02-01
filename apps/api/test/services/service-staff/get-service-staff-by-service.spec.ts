import {
  InMemoryOrganizationRepository,
  InMemoryServiceRepository,
  InMemoryServiceStaffRepository,
} from '@test/repositories'
import { NotFoundError } from '@/core/errors/not-found-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { GetServiceStaffByServiceId } from '@/domain/master/application/services/service-staff/get-service-staff-by-service.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('GetServiceStaffByServiceId', () => {
  let sut: GetServiceStaffByServiceId
  let serviceStaffRepository: InMemoryServiceStaffRepository
  let serviceRepository: InMemoryServiceRepository
  let organizationRepository: InMemoryOrganizationRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    serviceStaffRepository = new InMemoryServiceStaffRepository()
    serviceRepository = new InMemoryServiceRepository()
    organizationRepository = new InMemoryOrganizationRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new GetServiceStaffByServiceId(
      serviceStaffRepository,
      serviceRepository,
      organizationRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to get staff for a service', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
      ownerId: 'user-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 1',
      isActive: true,
    })
    await serviceRepository.create(service)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      actorId: 'admin-1',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.servicesStaff).toEqual([])
    }
  })

  it('should fail if service belongs to another organization', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
      ownerId: 'user-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: 'other-org-id',
      name: 'Service 1',
      isActive: true,
    })
    await serviceRepository.create(service)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      actorId: 'admin-1',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
