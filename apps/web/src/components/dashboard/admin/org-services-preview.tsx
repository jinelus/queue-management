'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Service = {
  id: string
  name: string
  description?: string
  isActive?: boolean
  maxCapacity?: number | null
  avgDurationInt?: number
}

type OrgServicesPreviewProps = {
  services: Service[]
}

export function OrgServicesPreview({ services }: OrgServicesPreviewProps) {
  if (services.length === 0) {
    return (
      <div className='rounded-lg border p-8 text-center'>
        <h3 className='font-semibold text-lg'>No services yet</h3>
        <p className='mt-1 text-muted-foreground text-sm'>
          Create your first service to start managing your queues.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='hidden md:block'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Avg Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium text-sm'>{service.name}</span>
                    {service.description && (
                      <span className='text-muted-foreground text-xs'>{service.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={service.isActive ? 'default' : 'secondary'}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  {service.maxCapacity ?? '—'}
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  {service.avgDurationInt ? `${service.avgDurationInt} min` : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='grid gap-3 md:hidden'>
        {services.map((service) => (
          <Card key={service.id} className='py-4'>
            <CardContent className='flex items-center justify-between px-4'>
              <div className='flex flex-col'>
                <span className='font-medium text-sm'>{service.name}</span>
                {service.description && (
                  <span className='text-muted-foreground text-xs'>{service.description}</span>
                )}
              </div>
              <Badge variant={service.isActive ? 'default' : 'secondary'}>
                {service.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
