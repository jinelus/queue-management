import {
  InMemoryOrganizationRepository,
  InMemoryServiceRepository,
  InMemoryServiceStaffRepository,
  InMemoryUserRepository,
} from '@test/repositories'
import type { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { AssignStaffToService } from '@/domain/master/application/services/service-staff/assign-staff-to-service.service'
import { Organization } from '@/domain/master/entreprise/entities/organization'
import { Service } from '@/domain/master/entreprise/entities/service'
import { ServiceStaff } from '@/domain/master/entreprise/entities/service-staff'
import { User } from '@/domain/master/entreprise/entities/user'
import { FakePermissionFactory } from '../fake-permission-factory'

describe('AssignStaffToService', () => {
  let sut: AssignStaffToService
  let serviceStaffRepository: InMemoryServiceStaffRepository
  let serviceRepository: InMemoryServiceRepository
  let userRepository: InMemoryUserRepository
  let organizationRepository: InMemoryOrganizationRepository
  let permissionFactory: FakePermissionFactory

  beforeEach(() => {
    serviceStaffRepository = new InMemoryServiceStaffRepository()
    serviceRepository = new InMemoryServiceRepository()
    userRepository = new InMemoryUserRepository()
    organizationRepository = new InMemoryOrganizationRepository()
    permissionFactory = new FakePermissionFactory()

    sut = new AssignStaffToService(
      serviceStaffRepository,
      serviceRepository,
      userRepository,
      organizationRepository,
      permissionFactory as unknown as PermissionFactory,
    )
  })

  it('should be able to assign staff to service', async () => {
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

    const user = User.create({
      organizationId: organization.id.toString(),
      name: 'Staff 1',
      email: 'staff@example.com',
      password: 'pass',
      role: 'employee',
    })
    await userRepository.create(user)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      actorId: 'admin-1',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
      userId: user.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.serviceStaff).toBeInstanceOf(ServiceStaff)
      expect(result.value.serviceStaff.active).toBe(true)
    }
    expect(serviceStaffRepository.items.length).toBe(1)
  })

  it('should reactivate existing inactive assignment', async () => {
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

    const user = User.create({
      organizationId: organization.id.toString(),
      name: 'Staff 1',
      email: 'staff@example.com',
      password: 'pass',
      role: 'employee',
    })
    await userRepository.create(user)

    const existing = ServiceStaff.create({
      serviceId: service.id.toString(),
      userId: user.id.toString(),
      active: false,
    })
    await serviceStaffRepository.create(existing)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      actorId: 'admin-1',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
      userId: user.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.serviceStaff.active).toBe(true)
    }
    expect(serviceStaffRepository.items[0].active).toBe(true)
  })

  it('should fail if staff already assigned', async () => {
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

    const user = User.create({
      organizationId: organization.id.toString(),
      name: 'Staff 1',
      email: 'staff@example.com',
      password: 'pass',
      role: 'employee',
    })
    await userRepository.create(user)

    const existing = ServiceStaff.create({
      serviceId: service.id.toString(),
      userId: user.id.toString(),
      active: true,
    })
    await serviceStaffRepository.create(existing)

    permissionFactory.setPermission(true)

    const result = await sut.execute({
      actorId: 'admin-1',
      organizationId: organization.id.toString(),
      serviceId: service.id.toString(),
      userId: user.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(Error)
  })
})
