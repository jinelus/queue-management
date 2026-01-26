import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface OrganizationProps {
  name: string
  slug: string
  description?: string
  logoUrl?: string
  logo?: string
  metadata?: string

  createdAt?: Date
  updatedAt?: Date
}

export class Organization extends Entity<OrganizationProps> {
  get name(): OrganizationProps['name'] {
    return this.props.name
  }

  get slug(): OrganizationProps['slug'] {
    return this.props.slug
  }

  get description(): OrganizationProps['description'] {
    return this.props.description
  }

  get logoUrl(): OrganizationProps['logoUrl'] {
    return this.props.logoUrl
  }

  get logo(): OrganizationProps['logo'] {
    return this.props.logo
  }

  get metadata(): OrganizationProps['metadata'] {
    return this.props.metadata
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  set name(name: OrganizationProps['name']) {
    this.props.name = name
    this.touch()
  }

  set slug(slug: OrganizationProps['slug']) {
    this.props.slug = slug
    this.touch()
  }

  set description(description: OrganizationProps['description']) {
    this.props.description = description
    this.touch()
  }

  set logoUrl(logoUrl: OrganizationProps['logoUrl']) {
    this.props.logoUrl = logoUrl
    this.touch()
  }

  set logo(logo: OrganizationProps['logo']) {
    this.props.logo = logo
    this.touch()
  }

  set metadata(metadata: OrganizationProps['metadata']) {
    this.props.metadata = metadata
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<OrganizationProps, 'createdAt' | 'updatedAt' | 'logo' | 'metadata' | 'logoUrl'>,
    id?: UniqueEntityID,
  ): Organization {
    const organization = new Organization(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        logo: props.logo ?? undefined,
        metadata: props.metadata ?? undefined,
        logoUrl: props.logoUrl ?? undefined,
      },
      id,
    )

    return organization
  }
}
