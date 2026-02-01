import { InMemoryOrganizationRepository, InMemoryServiceRepository } from '@test/repositories'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetAllServicesService } from '@/domain/master/application/services/service/get-all-services.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'

describe('GetAllServicesService', () => {
  let sut: GetAllServicesService
  let organizationRepository: InMemoryOrganizationRepository
  let serviceRepository: InMemoryServiceRepository

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository()
    serviceRepository = new InMemoryServiceRepository()

    sut = new GetAllServicesService(organizationRepository, serviceRepository)
  })

  it('should be able to get all services', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })
    await organizationRepository.create(organization)

    const service1 = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 1',
      isActive: true,
    })
    const service2 = Service.create({
      organizationId: organization.id.toString(),
      name: 'Service 2',
      isActive: true,
    })
    await serviceRepository.create(service1)
    await serviceRepository.create(service2)

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      page: 1,
      perPage: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.services).toHaveLength(2)
      expect(result.value.total).toBe(2)
    }
  })

  it('should not be able to get services if organization not found', async () => {
    const result = await sut.execute({
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
