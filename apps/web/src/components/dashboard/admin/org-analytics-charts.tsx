'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// ── Fictitious data ──────────────────────────────────────────────────

const queueTrendData = [
  { day: 'Mon', queued: 42, served: 38 },
  { day: 'Tue', queued: 55, served: 50 },
  { day: 'Wed', queued: 61, served: 58 },
  { day: 'Thu', queued: 48, served: 45 },
  { day: 'Fri', queued: 73, served: 68 },
  { day: 'Sat', queued: 35, served: 30 },
  { day: 'Sun', queued: 20, served: 18 },
]

const avgWaitData = [
  { day: 'Mon', minutes: 12 },
  { day: 'Tue', minutes: 15 },
  { day: 'Wed', minutes: 10 },
  { day: 'Thu', minutes: 18 },
  { day: 'Fri', minutes: 22 },
  { day: 'Sat', minutes: 8 },
  { day: 'Sun', minutes: 6 },
]

const queueChartConfig = {
  queued: { label: 'Queued', color: 'var(--chart-1)' },
  served: { label: 'Served', color: 'var(--chart-2)' },
} satisfies ChartConfig

const waitChartConfig = {
  minutes: { label: 'Avg wait (min)', color: 'var(--chart-3)' },
} satisfies ChartConfig

// ── Component ────────────────────────────────────────────────────────

export function OrgAnalyticsCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-sm">Queue volume</CardTitle>
          <CardDescription>Queued vs served · last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={queueChartConfig} className="aspect-4/2 w-full">
            <AreaChart data={queueTrendData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="queued"
                type="monotone"
                fill="var(--color-queued)"
                fillOpacity={0.15}
                stroke="var(--color-queued)"
                strokeWidth={2}
              />
              <Area
                dataKey="served"
                type="monotone"
                fill="var(--color-served)"
                fillOpacity={0.15}
                stroke="var(--color-served)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-sm">Average wait time</CardTitle>
          <CardDescription>Minutes · last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={waitChartConfig} className="aspect-4/2 w-full">
            <BarChart data={avgWaitData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="minutes" fill="var(--color-minutes)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
