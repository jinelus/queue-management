'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '../../../../utils/format'

type OrgHeaderProps = {
  name: string
  slug: string
  logo?: string | null
  createdAt?: Date
  membersCount: number
}

export function OrgHeader({ name, slug, logo, createdAt, membersCount }: OrgHeaderProps) {
  return (
    <div className="flex items-start gap-5">
      <Avatar className="h-16 w-16 rounded-xl text-lg">
        {logo && <AvatarImage src={logo} alt={name} />}
        <AvatarFallback className="rounded-xl font-semibold text-lg">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs">{slug}</span>
        <h1 className="font-bold text-2xl tracking-tight">{name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="default" className="px-2 py-0.5 text-[10px]">
            Free
          </Badge>
          <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
            Active
          </Badge>
          <span className="text-muted-foreground text-xs">
            {membersCount} {membersCount === 1 ? 'member' : 'members'}
          </span>
          {createdAt && (
            <span className="text-muted-foreground text-xs">
              · Created {new Date(createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
