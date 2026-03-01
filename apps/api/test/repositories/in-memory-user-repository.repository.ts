import {
  FindUsersParams,
  UserRepository,
} from '@/domain/master/application/repositories/user.repository'
import { User } from '@/domain/master/entreprise/entities/user'

export class InMemoryUserRepository implements UserRepository {
  public user: User[] = []
  public membersByOrg: Map<string, Set<string>> = new Map()

  addMember(organizationId: string, userId: string): void {
    if (!this.membersByOrg.has(organizationId)) {
      this.membersByOrg.set(organizationId, new Set())
    }
    const members = this.membersByOrg.get(organizationId)
    if (members) members.add(userId)
  }

  private isOrgMember(organizationId: string, userId: string): boolean {
    return this.membersByOrg.get(organizationId)?.has(userId) ?? false
  }

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
    return this.user.filter((u) => this.isOrgMember(organizationId, u.id.toString()))
  }

  async count(organizationId: string, params?: FindUsersParams): Promise<number> {
    const { search } = params ?? {}
    return this.user.filter((u) => {
      const matchesOrganization = this.isOrgMember(organizationId, u.id.toString())
      const matchesSearch = search ? u.name.toLowerCase().includes(search.toLowerCase()) : true
      return matchesOrganization && matchesSearch
    }).length
  }

  async findUsers(organizationId: string, params?: FindUsersParams): Promise<Array<User>> {
    const { search } = params ?? {}
    return this.user.filter((u) => {
      const matchesOrganization = this.isOrgMember(organizationId, u.id.toString())
      const matchesSearch = search ? u.name.toLowerCase().includes(search.toLowerCase()) : true
      return matchesOrganization && matchesSearch
    })
  }
}
