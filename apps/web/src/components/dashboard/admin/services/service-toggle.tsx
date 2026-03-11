'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { toggleService } from '@/actions/services'
import { Switch } from '@/components/ui/switch'

type ServiceToggleProps = {
  organizationId: string
  serviceId: string
  isActive: boolean
}

export function ServiceToggle({ organizationId, serviceId, isActive }: ServiceToggleProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const [error] = await toggleService(organizationId, serviceId, { isActive: checked })

      if (error) {
        toast.error('Failed to toggle service status.')
        return
      }

      toast.success(`Service ${checked ? 'activated' : 'deactivated'}.`)
      router.refresh()
    })
  }

  return <Switch checked={isActive} onCheckedChange={handleToggle} disabled={isPending} size="sm" />
}
