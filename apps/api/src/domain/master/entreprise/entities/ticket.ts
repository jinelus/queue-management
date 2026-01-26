import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export type TicketStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'SERVED' | 'ABSENT' | 'CANCELLED'

export interface TicketProps {
  guestName: string
  status?: TicketStatus
  callCount?: number

  organizationId: string
  serviceId: string
  servedById?: string

  joinedAt?: Date
  calledAt?: Date
  startedAt?: Date
  completedAt?: Date
}

export class Ticket extends Entity<TicketProps> {
  get guestName(): string {
    return this.props.guestName
  }

  get status(): TicketStatus {
    return this.props.status
  }

  get callCount(): number {
    return this.props.callCount
  }

  get organizationId(): string {
    return this.props.organizationId
  }
  get serviceId(): string {
    return this.props.serviceId
  }

  get servedById(): string | undefined {
    return this.props.servedById
  }

  get joinedAt(): Date {
    return this.props.joinedAt
  }

  get calledAt(): Date | undefined {
    return this.props.calledAt
  }

  get startedAt(): Date | undefined {
    return this.props.startedAt
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt
  }

  set status(value: TicketStatus) {
    this.props.status = value
  }

  set callCount(value: number) {
    this.props.callCount = value
  }

  set servedById(value: string | undefined) {
    this.props.servedById = value
  }

  set calledAt(value: Date | undefined) {
    this.props.calledAt = value
  }

  set serviceId(value: string) {
    this.props.serviceId = value
  }

  static create(
    props: Optional<
      TicketProps,
      'joinedAt' | 'calledAt' | 'startedAt' | 'completedAt' | 'callCount' | 'status'
    >,
    id?: UniqueEntityID,
  ): Ticket {
    const ticket = new Ticket(
      {
        ...props,
        joinedAt: props.joinedAt ?? new Date(),
        startedAt: props.startedAt ?? undefined,
        calledAt: props.calledAt ?? undefined,
        completedAt: props.completedAt ?? undefined,
        callCount: props.callCount ?? 0,
        status: props.status ?? 'WAITING',
      },
      id,
    )

    return ticket
  }
}
