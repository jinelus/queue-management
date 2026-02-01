import { InMemoryOrganizationRepository, InMemoryUserRepository } from '@test/repositories'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetUserByIdService } from '@/domain/master/application/services/user/get-user-by-id.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { User } from '@/domain/master/entreprise/entities/user'

describe('GetUserByIdService', () => {
  let sut: GetUserByIdService
  let userRepository: InMemoryUserRepository
  let organizationRepository: InMemoryOrganizationRepository

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    organizationRepository = new InMemoryOrganizationRepository()

    sut = new GetUserByIdService(userRepository, organizationRepository)
  })

  it('should be able to get a user by id', async () => {
    const organization = Organization.create({
      name: 'Org 1',
      slug: 'org-1',
      ownerId: 'user-1',
    })
    await organizationRepository.create(organization)

    const user = User.create({
      organizationId: organization.id.toString(),
      name: 'User 1',
      email: 'user1@example.com',
      password: 'pass',
      role: 'employee',
    })
    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      organizationId: organization.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.user).toBeInstanceOf(User)
    }
  })

  it('should not be able to get user if organization not found', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      organizationId: 'org-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
