'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import type { OrgMember } from './owner-dashboard'

type OrgMembersPreviewProps = {
  members: OrgMember[]
}

const PREVIEW_LIMIT = 5

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function OrgMembersPreview({ members }: OrgMembersPreviewProps) {
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, PREVIEW_LIMIT)

  if (recentMembers.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h3 className="font-semibold text-lg">No members yet</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          Invite members to get started with your organization.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentMembers.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      {m.user.image && <AvatarImage src={m.user.image} alt={m.user.name} />}
                      <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{m.user.name}</span>
                      <span className="text-muted-foreground text-xs">{m.user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[m.role] ?? 'outline'} className="capitalize">
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(m.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {recentMembers.map((m) => (
          <Card key={m.id} className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <Avatar>
                {m.user.image && <AvatarImage src={m.user.image} alt={m.user.name} />}
                <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-sm">{m.user.name}</span>
                  <Badge variant={roleBadgeVariant[m.role] ?? 'outline'} className="capitalize">
                    {m.role}
                  </Badge>
                </div>
                <span className="truncate text-muted-foreground text-xs">{m.user.email}</span>
                <span className="text-muted-foreground text-xs">{formatDate(m.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
