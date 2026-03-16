'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type QueueTrendData = {
  day: string
  queue: number
  served: number
}

type AvgWaitData = {
  day: string
  time: number
}

interface OrgAnalyticsChartsProps {
  queueTrendData: QueueTrendData[]
  avgWaitData: AvgWaitData[]
}

const queueChartConfig = {
  queue: { label: 'Queue', color: 'var(--chart-1)' },
  served: { label: 'Served', color: 'var(--chart-2)' },
} satisfies ChartConfig

const waitChartConfig = {
  time: { label: 'Avg wait (min)', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function OrgAnalyticsCharts({ queueTrendData, avgWaitData }: OrgAnalyticsChartsProps) {
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
                dataKey="queue"
                type="monotone"
                fill="var(--color-queue)"
                fillOpacity={0.15}
                stroke="var(--color-queue)"
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
              <Bar dataKey="time" fill="var(--color-time)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
