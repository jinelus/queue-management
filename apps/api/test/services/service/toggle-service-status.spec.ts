import { InMemoryOrganizationRepository, InMemoryServiceRepository } from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { ToggleServiceStatusService } from '@/domain/master/application/services/service/toggle-service-status.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('ToggleServiceStatusService', () => {
  let sut: ToggleServiceStatusService
  let serviceRepository: InMemoryServiceRepository
  let organizationRepository: InMemoryOrganizationRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    serviceRepository = new InMemoryServiceRepository()
    organizationRepository = new InMemoryOrganizationRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new ToggleServiceStatusService(
      serviceRepository,
      organizationRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to toggle service status', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
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
      serviceId: service.id.toString(),
      isActive: false,
      userId: 'user-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(serviceRepository.items[0].isActive).toBe(false)
  })

  it('should not be able to toggle status if permission denied', async () => {
    permissionFactory.setPermission(false)

    const result = await sut.execute({
      serviceId: 'service-1',
      isActive: false,
      userId: 'user-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to toggle status if organization not found', async () => {
    permissionFactory.setPermission(true)

    const result = await sut.execute({
      serviceId: 'service-1',
      isActive: false,
      userId: 'user-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to toggle status if service not found', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      serviceId: 'service-1',
      isActive: false,
      userId: 'user-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to toggle status if service belongs to another organization', async () => {
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
      serviceId: service.id.toString(),
      isActive: false,
      userId: 'user-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
