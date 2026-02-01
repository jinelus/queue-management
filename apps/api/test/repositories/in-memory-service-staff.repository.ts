import { ServiceStaffRepository } from '@/domain/master/application/repositories/service-staff.repository'
import { ServiceStaff } from '@/domain/master/entreprise/entities/service-staff'

export class InMemoryServiceStaffRepository implements ServiceStaffRepository {
  public items: ServiceStaff[] = []

  async create(entity: ServiceStaff): Promise<void> {
    this.items.push(entity)
  }

  async save(entity: ServiceStaff): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === entity.id.toString())
    if (index >= 0) {
      this.items[index] = entity
    }
  }

  async findById(id: string): Promise<ServiceStaff | null> {
    const serviceStaff = this.items.find((item) => item.id.toString() === id)
    return serviceStaff || null
  }

  async findAll(_organizationId: string): Promise<ServiceStaff[]> {
    // Note: In real implementation this would need to join with services
    // For testing, we store the organizationId relationship in the test setup
    return this.items
  }

  async delete(entity: ServiceStaff): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== entity.id.toString())
  }

  async count(_organizationId: string): Promise<number> {
    return this.items.length
  }

  async findByServiceId(serviceId: string): Promise<ServiceStaff[]> {
    return this.items.filter((item) => item.serviceId === serviceId)
  }

  async findByUserId(_organizationId: string, userId: string): Promise<ServiceStaff[]> {
    return this.items.filter((item) => item.userId === userId)
  }

  async findByPair(serviceId: string, userId: string): Promise<ServiceStaff | null> {
    const serviceStaff = this.items.find(
      (item) => item.serviceId === serviceId && item.userId === userId,
    )
    return serviceStaff || null
  }
}
