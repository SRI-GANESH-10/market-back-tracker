import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { format, parseISO } from 'date-fns'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { SeriesData } from '@/hooks/useMarketCagr'

const chartConfig = {
  finalValue: { label: 'Portfolio Value', color: 'var(--chart-1)' },
} satisfies ChartConfig

const inr = (n: number) =>
  n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

const compactInr = (n: number) =>
  n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  })

type GrowthChartProps = {
  data: SeriesData[]
}

export const GrowthChart = ({ data }: GrowthChartProps) => (
  <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
    <LineChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="date"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={32}
        tickFormatter={(v) => format(parseISO(String(v)), 'dd MMM yy')}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        width={68}
        tickFormatter={(v) => compactInr(Number(v))}
      />
      <ChartTooltip
        content={
          <ChartTooltipContent
            className="w-[200px]"
            labelFormatter={(v) => format(parseISO(String(v)), 'dd MMM yyyy')}
            formatter={(v) => (
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="text-muted-foreground">Value</span>
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {inr(Number(v))}
                </span>
              </div>
            )}
          />
        }
      />
      <Line
        dataKey="finalValue"
        type="monotone"
        stroke="var(--color-finalValue)"
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  </ChartContainer>
)
