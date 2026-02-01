export const QUEUE_EVENTS = {
  QUEUE_UPDATED: 'queue.updated',
  USER_CALLED: 'queue.user-called',
  USER_NO_SHOW: 'queue.user-no-show',
}

export type UserCalledEvent = {
  ticketId: string
  position: number
  callAttempt: number
}

export type UserNoShowEvent = {
  ticketId: string
}
