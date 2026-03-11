'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { assignStaff, unassignStaff } from '@/actions/services'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getInitials } from '@/utils/format'

type Staff = {
  id: string
  name: string
  email: string
  image?: string | null
}

type AssignStaffDialogProps = {
  organizationId: string
  serviceId: string
  serviceName: string
  members: Staff[]
  assignedStaffIds: string[]
  trigger: React.ReactNode
}

export function AssignStaffDialog({
  organizationId,
  serviceId,
  serviceName,
  members,
  assignedStaffIds,
  trigger,
}: AssignStaffDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const activeIdRef = useRef<string | null>(null)
  const router = useRouter()

  const availableMembers = members.filter((m) => !assignedStaffIds.includes(m.id))
  const assignedMembers = members.filter((m) => assignedStaffIds.includes(m.id))

  function handleAssign(staffId: string) {
    activeIdRef.current = staffId
    startTransition(async () => {
      const [error] = await assignStaff(organizationId, { serviceId, staffId })

      if (error) {
        toast.error('Failed to assign staff. Please try again.')
        return
      }

      toast.success('Staff assigned successfully.')
      router.refresh()
    })
  }

  function handleUnassign(staffId: string) {
    activeIdRef.current = staffId
    startTransition(async () => {
      const [error] = await unassignStaff(organizationId, { serviceId, staffId })

      if (error) {
        toast.error('Failed to unassign staff. Please try again.')
        return
      }

      toast.success('Staff unassigned successfully.')
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign staff to {serviceName}</DialogTitle>
          <DialogDescription>Select a member to assign to this service.</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-4 overflow-y-auto">
          {availableMembers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Available members
              </h4>
              {availableMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      {member.image && <AvatarImage src={member.image} alt={member.name} />}
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{member.name}</span>
                      <span className="text-muted-foreground text-xs">{member.email}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending && activeIdRef.current === member.id}
                    onClick={() => handleAssign(member.id)}
                  >
                    {isPending && activeIdRef.current === member.id ? 'Assigning...' : 'Assign'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {assignedMembers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Assigned members
              </h4>
              {assignedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-md border border-dashed p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      {member.image && <AvatarImage src={member.image} alt={member.name} />}
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{member.name}</span>
                      <span className="text-muted-foreground text-xs">{member.email}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending && activeIdRef.current === member.id}
                    onClick={() => handleUnassign(member.id)}
                  >
                    {isPending && activeIdRef.current === member.id ? 'Removing...' : 'Unassign'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {availableMembers.length === 0 && assignedMembers.length === 0 && (
            <p className="text-muted-foreground text-sm">No members found.</p>
          )}

          {availableMembers.length === 0 && assignedMembers.length > 0 && (
            <p className="text-muted-foreground text-sm">
              All members are already assigned to this service.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
