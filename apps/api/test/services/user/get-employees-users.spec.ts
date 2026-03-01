import { InMemoryUserRepository } from '@test/repositories'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { GetEmployeesUsersService } from '@/domain/master/application/services/user/get-employees-users.service'
import { User } from '@/domain/master/entreprise/entities/user'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('GetEmployeesUsersService', () => {
  let sut: GetEmployeesUsersService
  let userRepository: InMemoryUserRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new GetEmployeesUsersService(
      userRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to get employees', async () => {
    const user1 = User.create({
      name: 'User 1',
      email: 'user1@example.com',
    })
    await userRepository.create(user1)
    userRepository.addMember('org-1', user1.id.toString())

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      userId: 'admin-1',
      organizationId: 'org-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.users).toHaveLength(1)
      expect(result.value.total).toBe(1)
    }
  })
})
