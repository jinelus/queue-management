import { OrganizationRepository } from '@/domain/master/application/repositories/organization.repository'
import { Organization } from '@/domain/master/entreprise/entities/organization'

export class InMemoryOrganizationRepository implements OrganizationRepository {
  public items: Organization[] = []

  async create(entity: Organization): Promise<void> {
    this.items.push(entity)
  }

  async save(entity: Organization): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === entity.id.toString())
    if (index >= 0) {
      this.items[index] = entity
    }
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = this.items.find((item) => item.id.toString() === id)
    return organization || null
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const organization = this.items.find((item) => item.slug === slug)
    return organization || null
  }

  async findAll(): Promise<Organization[]> {
    return this.items
  }

  async delete(entity: Organization): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== entity.id.toString())
  }

  async count(): Promise<number> {
    return this.items.length
  }
}
