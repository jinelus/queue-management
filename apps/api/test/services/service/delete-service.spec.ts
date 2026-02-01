import { InMemoryOrganizationRepository, InMemoryServiceRepository } from '@test/repositories'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { DeleteServiceService } from '@/domain/master/application/services/service/delete-service.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('DeleteServiceService', () => {
  let sut: DeleteServiceService
  let serviceRepository: InMemoryServiceRepository
  let organizationRepository: InMemoryOrganizationRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    serviceRepository = new InMemoryServiceRepository()
    organizationRepository = new InMemoryOrganizationRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new DeleteServiceService(
      serviceRepository,
      organizationRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to delete a service', async () => {
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
      userId: 'user-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(serviceRepository.items).toHaveLength(0)
  })

  it('should not be able to delete if permission denied', async () => {
    permissionFactory.setPermission(false)

    const result = await sut.execute({
      serviceId: 'service-1',
      userId: 'user-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to delete if organization not found', async () => {
    permissionFactory.setPermission(true)

    const result = await sut.execute({
      serviceId: 'service-1',
      userId: 'user-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to delete if service not found', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      serviceId: 'service-1',
      userId: 'user-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to delete if service belongs to another organization', async () => {
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
      userId: 'user-1',
      organizationId: organization.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
