import { InMemoryOrganizationRepository, InMemoryServiceRepository } from '@test/repositories'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetServiceByIdService } from '@/domain/master/application/services/service/get-service-by-id.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'

describe('GetServiceByIdService', () => {
  let sut: GetServiceByIdService
  let organizationRepository: InMemoryOrganizationRepository
  let serviceRepository: InMemoryServiceRepository

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository()
    serviceRepository = new InMemoryServiceRepository()

    sut = new GetServiceByIdService(organizationRepository, serviceRepository)
  })

  it('should be able to get a service by id', async () => {
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

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.service).toBeInstanceOf(Service)
      expect(result.value.service.id).toEqual(service.id)
    }
  })

  it('should not be able to get service if organization not found', async () => {
    const result = await sut.execute({
      organizationId: 'org-1',
      serviceId: 'service-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to get service if service not found', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      serviceId: 'service-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
