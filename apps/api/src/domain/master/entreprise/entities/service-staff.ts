import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface ServiceStaffProps {
  userId: string
  serviceId: string
  active: boolean
  isOnline: boolean
  isCounterClosed: boolean
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

  get isOnline(): boolean {
    return this.props.isOnline
  }

  set isOnline(isOnline: boolean) {
    this.props.isOnline = isOnline
  }

  get isCounterClosed(): boolean {
    return this.props.isCounterClosed
  }

  set isCounterClosed(isCounterClosed: boolean) {
    this.props.isCounterClosed = isCounterClosed
  }

  static create(
    props: Optional<ServiceStaffProps, 'active' | 'isOnline' | 'isCounterClosed'>,
    id?: UniqueEntityID,
  ): ServiceStaff {
    const serviceStaff = new ServiceStaff(
      {
        ...props,
        active: props.active ?? true,
        isOnline: props.isOnline ?? false,
        isCounterClosed: props.isCounterClosed ?? false,
      },
      id,
    )

    return serviceStaff
  }
}
