import {
  FindUsersParams,
  UserRepository,
} from '@/domain/master/application/repositories/user.repository'
import { User } from '@/domain/master/entreprise/entities/user'

export class InMemoryUserRepository implements UserRepository {
  public user: User[] = []

  async create(entity: User): Promise<void> {
    this.user.push(entity)
  }

  async save(entity: User): Promise<void> {
    const userIndex = this.user.findIndex((u) => u.id.toString() === entity.id.toString())
    if (userIndex >= 0) {
      this.user[userIndex] = entity
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = this.user.find((u) => u.id.toString() === id)
    return user || null
  }

  async delete(entity: User): Promise<void> {
    this.user = this.user.filter((u) => u.id.toString() !== entity.id.toString())
  }

  async findAll(organizationId: string): Promise<User[]> {
    return this.user.filter((u) => u.organizationId?.toString() === organizationId)
  }

  async count(organizationId: string, params?: FindUsersParams): Promise<number> {
    const { role, search } = params ?? {}
    return this.user.filter((u) => {
      const matchesOrganization = u.organizationId?.toString() === organizationId
      const matchesRole = role ? u.role === role : true
      const matchesSearch = search ? u.name.toLowerCase().includes(search.toLowerCase()) : true
      return matchesOrganization && matchesRole && matchesSearch
    }).length
  }

  async findUsers(organizationId: string, params?: FindUsersParams): Promise<Array<User>> {
    const { role, search } = params ?? {}
    return this.user.filter((u) => {
      const matchesOrganization = u.organizationId?.toString() === organizationId
      const matchesRole = role ? u.role === role : true
      const matchesSearch = search ? u.name.toLowerCase().includes(search.toLowerCase()) : true
      return matchesOrganization && matchesRole && matchesSearch
    })
  }
}
