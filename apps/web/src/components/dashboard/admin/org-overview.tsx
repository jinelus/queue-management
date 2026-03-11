'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/utils/format'

type OrgOverviewProps = {
  description?: string
  organizationName: string
  membersCount: number
  slug: string
  createdAt?: Date
}

export function OrgOverview({
  description,
  organizationName,
  membersCount,
  slug,
  createdAt,
}: OrgOverviewProps) {
  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <Card className='lg:col-span-2'>
        <CardHeader>
          <CardTitle className='text-base'>About</CardTitle>
          <CardDescription>Organization details</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              {description ??
                `${organizationName} is a queue management organization. Add a description to tell members and visitors what this organization is about.`}
            </p>
          </div>
          <Separator />
          <dl className='grid gap-3 text-sm sm:grid-cols-2'>
            <div>
              <dt className='font-medium text-muted-foreground'>Slug</dt>
              <dd className='mt-0.5'>{slug}</dd>
            </div>
            <div>
              <dt className='font-medium text-muted-foreground'>Members</dt>
              <dd className='mt-0.5'>{membersCount}</dd>
            </div>
            {createdAt && (
              <div>
                <dt className='font-medium text-muted-foreground'>Created</dt>
                <dd className='mt-0.5'>{formatDate(createdAt)}</dd>
              </div>
            )}
            <div>
              <dt className='font-medium text-muted-foreground'>Plan</dt>
              <dd className='mt-0.5'>Free</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <QuickActionItem label='Invite members' description='Add team members to your org' />
          <QuickActionItem label='Configure services' description='Set up queue services' />
          <QuickActionItem label='Manage staff' description='Assign roles and schedules' />
        </CardContent>
      </Card>
    </div>
  )
}

function QuickActionItem({ label, description }: { label: string; description: string }) {
  return (
    <div className='flex flex-col gap-0.5 rounded-md border p-3 transition-colors hover:bg-muted/50'>
      <span className='font-medium'>{label}</span>
      <span className='text-muted-foreground text-xs'>{description}</span>
    </div>
  )
}
