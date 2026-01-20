import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface UserProps {
  name: string

  email?: string
  emailVerified?: boolean

  image?: string

  createdAt: Date
  updatedAt: Date

  role?: string

  banned?: boolean
  banReason?: string
  banExpires?: Date
}

export class User extends Entity<UserProps> {
  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get emailVerified(): boolean {
    return this.props.emailVerified
  }

  get image(): string | undefined {
    return this.props.image
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  get role(): string | undefined {
    return this.props.role
  }

  set role(value: string | undefined) {
    this.props.role = value
    this.touch()
  }

  get banned(): boolean | undefined {
    return this.props.banned
  }

  get banReason(): string | undefined {
    return this.props.banReason
  }

  get banExpires(): Date | undefined {
    return this.props.banExpires
  }

  static create(props: Optional<UserProps, 'createdAt' | 'updatedAt'>, id?: UniqueEntityID): User {
    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return user
  }

  private touch() {
    this.props.updatedAt = new Date()
  }
}
