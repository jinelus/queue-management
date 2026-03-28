'use server'

import { CreateTicketBodyDto, createTicketController, leaveQueueController } from '@/gen'

export async function createGuestTicket(organizationId: string, data: CreateTicketBodyDto) {
  return createTicketController(organizationId, data)
}

export async function leaveGuestQueue(organizationId: string, ticketId: string) {
  return leaveQueueController(organizationId, ticketId)
}
