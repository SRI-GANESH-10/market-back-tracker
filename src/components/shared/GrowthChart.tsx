import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { format, parseISO } from 'date-fns'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { SeriesData } from '@/lib/backtest'
import { compactInr, inr } from '@/lib/utils'

const chartConfig = {
  value: { label: 'Portfolio Value', color: 'var(--chart-1)' },
  // a baseline, not a second series -- muted so the value line stays the subject
  invested: { label: 'Invested', color: 'var(--muted-foreground)' },
} satisfies ChartConfig

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
            className="w-[220px]"
            labelFormatter={(v) => format(parseISO(String(v)), 'dd MMM yyyy')}
            formatter={(v, name) => (
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                </span>
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {inr(Number(v))}
                </span>
              </div>
            )}
          />
        }
      />
      <Line
        dataKey="invested"
        type="stepAfter"
        stroke="var(--color-invested)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="value"
        type="monotone"
        stroke="var(--color-value)"
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  </ChartContainer>
)
