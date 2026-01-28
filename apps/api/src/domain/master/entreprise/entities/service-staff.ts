import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface ServiceStaffProps {
  userId: string
  serviceId: string
  active: boolean
}

export class ServiceStaff extends Entity<ServiceStaffProps> {
  get userId(): string {
    return this.props.userId
  }

  get serviceId(): string {
    return this.props.serviceId
  }

  get active(): boolean {
    return this.props.active
  }

  set active(active: boolean) {
    this.props.active = active
  }

  static create(props: Optional<ServiceStaffProps, 'active'>, id?: UniqueEntityID): ServiceStaff {
    const serviceStaff = new ServiceStaff(
      {
        ...props,
        active: props.active ?? true,
      },
      id,
    )

    return serviceStaff
  }
}
