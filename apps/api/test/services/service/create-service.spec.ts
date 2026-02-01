import { InMemoryOrganizationRepository, InMemoryServiceRepository } from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { CreateServiceService } from '@/domain/master/application/services/service/create-service.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('CreateServiceService', () => {
  let sut: CreateServiceService
  let organizationRepository: InMemoryOrganizationRepository
  let serviceRepository: InMemoryServiceRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository()
    serviceRepository = new InMemoryServiceRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new CreateServiceService(
      organizationRepository,
      serviceRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to create a service', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      userId: 'user-1',
      name: 'Service 1',
      organizationId: organization.id.toString(),
      isActive: true,
      maxCapacity: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.service).toBeInstanceOf(Service)
      expect(result.value.service.name).toBe('Service 1')
    }
    expect(serviceRepository.items).toHaveLength(1)
  })

  it('should not be able to create a service if permission denied', async () => {
    permissionFactory.setPermission(false)

    const result = await sut.execute({
      userId: 'user-1',
      name: 'Service 1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to create a service if organization not found', async () => {
    permissionFactory.setPermission(true)

    const result = await sut.execute({
      userId: 'user-1',
      name: 'Service 1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to create a service with invalid maxCapacity', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      userId: 'user-1',
      name: 'Service 1',
      organizationId: organization.id.toString(),
      maxCapacity: 0,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
