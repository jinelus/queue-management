export const QUEUE_EVENTS = {
  QUEUE_UPDATED: 'queue.updated',
  TICKET_CREATED: 'queue.ticket-created',
  TICKET_CALLED: 'queue.ticket-called',
  TICKET_LEFT: 'queue.ticket-left',
  USER_CALLED: 'queue.user-called',
  USER_NO_SHOW: 'queue.user-no-show',
}

export type QueueUpdatedEvent = {
  organizationId: string
  serviceId: string
}

export type TicketCreatedEvent = {
  ticketId: string
  organizationId: string
  serviceId: string
  position: number
  estimatedWaitTime: number | null
}

export type TicketCalledEvent = {
  ticketId: string
  organizationId: string
  serviceId: string
}

export type TicketLeftEvent = {
  ticketId: string
  organizationId: string
  serviceId: string
}

export type UserCalledEvent = {
  ticketId: string
  position: number
  callAttempt: number
}

export type UserNoShowEvent = {
  ticketId: string
}
