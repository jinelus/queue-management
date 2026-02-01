import { InMemoryOrganizationRepository, InMemoryServiceRepository } from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { UpdateServiceService } from '@/domain/master/application/services/service/update-service.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('UpdateServiceService', () => {
  let sut: UpdateServiceService
  let organizationRepository: InMemoryOrganizationRepository
  let serviceRepository: InMemoryServiceRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository()
    serviceRepository = new InMemoryServiceRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new UpdateServiceService(
      organizationRepository,
      serviceRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to update service details', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 1',
      isActive: true,
      description: 'Desc 1',
      avgDurationInt: 10,
    })
    await serviceRepository.create(service)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      userId: 'user-1',
      serviceId: service.id.toString(),
      organizationId: organization.id.toString(),
      name: 'Service Updated',
      description: 'Desc Updated',
      avgDurationInt: 20,
    })

    expect(result.isRight()).toBe(true)
    expect(serviceRepository.items[0].name).toBe('Service Updated')
    expect(serviceRepository.items[0].description).toBe('Desc Updated')
    expect(serviceRepository.items[0].avgDurationInt).toBe(20)
  })

  it('should not be able to update if permission denied', async () => {
    permissionFactory.setPermission(false)

    const result = await sut.execute({
      userId: 'user-1',
      serviceId: 'service-1',
      organizationId: 'org-1',
      name: 'New Name',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to update if organization not found', async () => {
    permissionFactory.setPermission(true)

    const result = await sut.execute({
      userId: 'user-1',
      serviceId: 'service-1',
      organizationId: 'org-1',
      name: 'New Name',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to update if service not found', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      userId: 'user-1',
      serviceId: 'service-1',
      organizationId: organization.id.toString(),
      name: 'New Name',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to update if service belongs to another organization', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
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
      userId: 'user-1',
      serviceId: service.id.toString(),
      organizationId: organization.id.toString(),
      name: 'New Name',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
