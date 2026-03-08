import { ArrowLeftIcon, UserPlusIcon } from 'lucide-react'
import { Route } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { authClient } from '@/lib/auth-client'
import { formatDate, getInitials } from '../../../../../utils/format'

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
}

export const ManageMembers = async (props: PageProps<'/[slug]/members'>) => {
  const { slug } = await props.params

  const { data, error } = await authClient.organization.listMembers({
    query: {
      limit: 100,
      offset: 0,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      organizationSlug: slug,
    },
    fetchOptions: {
      headers: await headers(),
    },
  })

  if (error || !data) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h3 className="font-semibold text-lg">Failed to load members</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          There was an error loading the members. Please try again later.
        </p>
      </div>
    )
  }

  const { members } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${slug}` as Route}>
              <ArrowLeftIcon />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-2xl">Members</h1>
            <p className="text-muted-foreground text-sm">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
        <Button size="sm">
          <UserPlusIcon />
          Invite member
        </Button>
      </div>

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
            {members.map((m) => (
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

      <div className="grid gap-3 md:hidden">
        {members.map((m) => (
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

      {members.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <h3 className="font-semibold text-lg">No members yet</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Invite members to get started with your organization.
          </p>
        </div>
      )}
    </div>
  )
}
