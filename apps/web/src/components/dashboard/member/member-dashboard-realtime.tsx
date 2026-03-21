'use client'

import { env } from '@repo/env'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

type MemberDashboardRealtimeProps = {
  organizationId: string
}

type QueueUpdatedPayload = {
  organizationId: string
  serviceId: string
  queueLength: number
  isAlert: boolean
  timestamp: string
}

export function MemberDashboardRealtime({ organizationId }: MemberDashboardRealtimeProps) {
  const router = useRouter()
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const socketUrl = env.BACKEND_URL

  useEffect(() => {
    const socket = io(`${socketUrl}/queue`, {
      withCredentials: true,
      transports: ['websocket'],
      query: {
        orgId: organizationId,
      },
    })

    function scheduleRefresh() {
      if (refreshTimerRef.current) {
        return
      }

      refreshTimerRef.current = setTimeout(() => {
        router.refresh()
        refreshTimerRef.current = null
      }, 300)
    }

    function onQueueUpdated(payload: QueueUpdatedPayload) {
      if (payload.organizationId !== organizationId) {
        return
      }

      scheduleRefresh()
    }

    socket.on('queue-updated', onQueueUpdated)

    return () => {
      socket.off('queue-updated', onQueueUpdated)
      socket.disconnect()

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [organizationId, router, socketUrl])

  return null
}
