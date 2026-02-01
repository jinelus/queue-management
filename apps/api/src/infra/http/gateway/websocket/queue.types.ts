export interface CallNextPayload {
  organizationId: string
  serviceId: string
  staffId: string
}

export interface JoinQueuePayload {
  organizationId: string
  serviceId: string
  guestName: string
}

export interface LeaveQueuePayload {
  organizationId: string
  ticketId: string
}

export interface QueueUpdatedEvent {
  organizationId: string
  serviceId: string
  position: number
  estimatedWaitTime: number | null
  ticketId: string
}

export interface UserCalledEvent {
  ticketId: string
  // ticketNumber: string
  position: number
  callAttempt: number
}

export interface UserNoShowEvent {
  ticketId: string
  // ticketNumber: string
}
