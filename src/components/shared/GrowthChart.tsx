import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import type { SeriesData } from '@/hooks/useMarketCagr'

export const GrowthChart = ({ data }: { data: SeriesData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line dataKey="finalValue" dot={false} isAnimationActive={false} />
    </LineChart>
  </ResponsiveContainer>
)
