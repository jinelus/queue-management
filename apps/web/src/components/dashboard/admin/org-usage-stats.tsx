'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type UsageStat = {
  label: string
  value: string | number
  limit?: string | number
  trend?: 'up' | 'down' | 'neutral'
}

type OrgUsageStatsProps = {
  stats: UsageStat[]
}

export function OrgUsageStats({ stats }: OrgUsageStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-2xl tabular-nums">
                {stat.value}
                {stat.limit != null && (
                  <span className="font-normal text-muted-foreground text-sm"> / {stat.limit}</span>
                )}
              </p>
              <p className="text-muted-foreground text-xs">{stat.label}</p>
            </div>
            {stat.trend && stat.trend !== 'neutral' && (
              <div className={stat.trend === 'up' ? 'text-emerald-500' : 'text-destructive'}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="size-5" />
                ) : (
                  <ArrowDownRight className="size-5" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
