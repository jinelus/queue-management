'use client'

import { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { getGuestTicketPosition } from '@/actions/tickets/get'
import { leaveGuestQueue } from '@/actions/tickets/mutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type TicketLiveCardProps = {
  organizationId: string
  organizationName?: string
  slug: string
  ticketId: string
  guestName: string
  serviceName: string
  initialPosition: number | null
  initialEstimatedWaitTime: number | null
  initialStatus: string
}

type QueueUpdatedPayload = {
  organizationId: string
  serviceId: string
  queueLength: number
  isAlert: boolean
  timestamp: string
}

function resolveBackendSocketUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  return 'http://localhost:3333'
}

export function TicketLiveCard({
  organizationId,
  slug,
  ticketId,
  guestName,
  serviceName,
  initialPosition,
  initialEstimatedWaitTime,
  initialStatus,
  organizationName,
}: TicketLiveCardProps) {
  const router = useRouter()
  const [isLeaving, startLeavingTransition] = useTransition()
  const [position, setPosition] = useState<number | null>(initialPosition)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(
    initialEstimatedWaitTime,
  )
  const [status, setStatus] = useState(initialStatus)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socketUrl = useMemo(() => resolveBackendSocketUrl(), [])

  useEffect(() => {
    const socket = io(`${socketUrl}/queue`, {
      withCredentials: true,
      transports: ['websocket'],
      query: {
        orgId: organizationId,
        ticketId,
      },
    })

    async function refreshTicketPosition() {
      const [error, response] = await getGuestTicketPosition(organizationId, ticketId)

      if (error || !response) {
        return
      }

      setPosition(response.position)
      setEstimatedWaitTime(response.estimatedWaitTime)
      setStatus(response.ticket.status)
    }

    function schedulePositionRefresh() {
      if (refreshTimerRef.current) {
        return
      }

      refreshTimerRef.current = setTimeout(() => {
        refreshTicketPosition()
        refreshTimerRef.current = null
      }, 300)
    }

    function onQueueUpdated(payload: QueueUpdatedPayload) {
      if (payload.organizationId !== organizationId) {
        return
      }

      schedulePositionRefresh()
    }

    function onTicketEvent() {
      schedulePositionRefresh()
    }

    socket.on('queue-updated', onQueueUpdated)
    socket.on('ticket-called', onTicketEvent)
    socket.on('ticket-left', onTicketEvent)
    socket.on('user-called', onTicketEvent)
    socket.on('user-no-show', onTicketEvent)

    return () => {
      socket.off('queue-updated', onQueueUpdated)
      socket.off('ticket-called', onTicketEvent)
      socket.off('ticket-left', onTicketEvent)
      socket.off('user-called', onTicketEvent)
      socket.off('user-no-show', onTicketEvent)
      socket.disconnect()

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [organizationId, socketUrl, ticketId])

  function handleLeaveQueue() {
    startLeavingTransition(async () => {
      const [error] = await leaveGuestQueue(organizationId, ticketId)

      if (error) {
        toast.error('Could not leave queue right now.')
        return
      }

      toast.success('You have left the queue.')
      router.push(`/org/${slug}` as Route)
    })
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <Card className="overflow-hidden border-2 border-zinc-200 shadow-xl">
        <div className="bg-zinc-900 px-6 py-5 text-center text-zinc-50">
          <p className="text-xs text-zinc-300 uppercase tracking-[0.25em]">{organizationName}</p>
        </div>

        <CardContent className="space-y-6 bg-zinc-50 px-8 py-8 text-center">
          <div className="space-y-2">
            <h2 className="font-semibold text-3xl text-zinc-800">Hi {guestName},</h2>
            <p className="text-lg text-zinc-600">Thank you for waiting.</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-500 uppercase tracking-wide">Service</p>
            <p className="font-medium text-lg text-zinc-700">{serviceName}</p>
          </div>

          <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full bg-zinc-900 text-zinc-50">
            <div>
              <p className="font-bold text-7xl leading-none">{position ?? '-'}</p>
              <p className="mt-3 text-lg uppercase tracking-wide">position</p>
            </div>
          </div>

          <div className="space-y-1 text-sm text-zinc-600">
            <p>Status: {status}</p>
            <p>
              Estimated wait:{' '}
              {estimatedWaitTime !== null ? `${estimatedWaitTime} min` : 'calculating'}
            </p>
          </div>

          <div className="grid gap-2">
            <Button
              variant="destructive"
              className="w-full"
              disabled={isLeaving || status !== 'WAITING'}
              onClick={handleLeaveQueue}
            >
              {isLeaving ? 'Leaving queue...' : 'Leave queue'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/org/${slug}` as Route)}
            >
              Back to services
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
