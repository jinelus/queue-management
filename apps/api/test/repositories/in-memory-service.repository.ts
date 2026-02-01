import {
  FindServicesParams,
  ServiceRepository,
} from '@/domain/master/application/repositories/service.repository'
import { Service } from '@/domain/master/entreprise/entities/service'

export class InMemoryServiceRepository implements ServiceRepository {
  public items: Service[] = []

  async create(entity: Service): Promise<void> {
    this.items.push(entity)
  }

  async save(entity: Service): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === entity.id.toString())
    if (index >= 0) {
      this.items[index] = entity
    }
  }

  async findById(id: string): Promise<Service | null> {
    const service = this.items.find((item) => item.id.toString() === id)
    return service || null
  }

  async findAll(organizationId: string): Promise<Service[]> {
    return this.items.filter((item) => item.organizationId === organizationId)
  }

  async delete(entity: Service): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== entity.id.toString())
  }

  async count(organizationId: string, params?: FindServicesParams): Promise<number> {
    const { search, isActive } = params ?? {}
    return this.items.filter((item) => {
      const matchesOrganization = item.organizationId === organizationId
      const matchesActive = isActive === undefined ? true : item.isActive === isActive
      const matchesSearch = search ? item.name.toLowerCase().includes(search.toLowerCase()) : true
      return matchesOrganization && matchesActive && matchesSearch
    }).length
  }

  async findServices(organizationId: string, params?: FindServicesParams): Promise<Service[]> {
    const { search, isActive, page, perPage, order, orderBy } = params ?? {}

    let filtered = this.items.filter((item) => {
      const matchesOrganization = item.organizationId === organizationId
      const matchesActive = isActive === undefined ? true : item.isActive === isActive
      const matchesSearch = search ? item.name.toLowerCase().includes(search.toLowerCase()) : true
      return matchesOrganization && matchesActive && matchesSearch
    })

    // Sort
    if (orderBy) {
      filtered = filtered.sort((a, b) => {
        const aVal = a[orderBy as keyof Service]
        const bVal = b[orderBy as keyof Service]
        if (aVal < bVal) return order === 'asc' ? -1 : 1
        if (aVal > bVal) return order === 'asc' ? 1 : -1
        return 0
      })
    }

    // Paginate
    if (page && perPage) {
      const start = (page - 1) * perPage
      filtered = filtered.slice(start, start + perPage)
    }

    return filtered
  }
}
