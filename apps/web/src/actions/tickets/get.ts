import 'server-only'

import { getTicketPositionController } from '@/gen'

export async function getGuestTicketPosition(organizationId: string, ticketId: string) {
  return getTicketPositionController(organizationId, ticketId)
}
