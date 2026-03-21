'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { toggleStaffStatus } from '@/actions/service-staff/mutation'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

type MemberStaffStatusToggleProps = {
  organizationId: string
  serviceStaffId: string
  isOnline: boolean
  isCounterClosed: boolean
}

export function MemberStaffStatusToggle({
  organizationId,
  serviceStaffId,
  isOnline,
  isCounterClosed,
}: MemberStaffStatusToggleProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleOnlineToggle(checked: boolean) {
    startTransition(async () => {
      const [error] = await toggleStaffStatus(organizationId, serviceStaffId, {
        isOnline: checked,
      })

      if (error) {
        toast.error('Failed to update online status.')
        return
      }

      toast.success(checked ? 'You are online.' : 'You are offline.')
      router.refresh()
    })
  }

  function handleCounterToggle(checked: boolean) {
    startTransition(async () => {
      const [error] = await toggleStaffStatus(organizationId, serviceStaffId, {
        isCounterClosed: checked,
      })

      if (error) {
        toast.error('Failed to update counter status.')
        return
      }

      toast.success(checked ? 'Counter closed.' : 'Counter reopened.')
      router.refresh()
    })
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <Switch
          checked={isOnline}
          onCheckedChange={handleOnlineToggle}
          disabled={isPending}
          size='sm'
        />
        <Badge variant={isOnline ? 'default' : 'secondary'}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>
      <div className='flex items-center gap-2'>
        <Switch
          checked={isCounterClosed}
          onCheckedChange={handleCounterToggle}
          disabled={isPending}
          size='sm'
        />
        <Badge variant={isCounterClosed ? 'secondary' : 'outline'}>
          {isCounterClosed ? 'Counter closed' : 'Counter open'}
        </Badge>
      </div>
    </div>
  )
}
