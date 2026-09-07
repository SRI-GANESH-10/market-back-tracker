import { useAnimatedSeries } from '@/hooks/useAnimatedSeries'
import type { ReturnMetric, SeriesData } from '@/lib/backtest'
import { FieldCard } from '@/components/shared/FieldCard'
import { StatCard } from '@/components/shared/StatCard'
import { GrowthChart } from '@/components/shared/GrowthChart'
import { inr, pct } from '@/lib/utils'

type BacktestResultProps = {
  seriesData: SeriesData[]
  returnMetric: ReturnMetric | undefined
  runId: number
}

export const BacktestResult = ({ seriesData, returnMetric, runId }: BacktestResultProps) => {
  const { currentData, visibleData } = useAnimatedSeries(seriesData, runId)

  // CAGR/XIRR describe the whole run, so they only exist on the final row. Hold
  // them back until the animation gets there rather than spoiling the result.
  const settled = seriesData.length > 0 && visibleData.length >= seriesData.length

  const stats = [
    { title: 'Invested', value: currentData ? inr(currentData.invested) : '—' },
    { title: 'Current Value', value: currentData ? inr(currentData.value) : '—' },
    {
      title: 'Return',
      value: currentData ? pct(currentData.returnPct) : '—',
      description: 'absolute',
    },
    {
      title: returnMetric?.label ?? 'CAGR',
      value: settled ? (returnMetric?.value == null ? 'N/A' : pct(returnMetric.value)) : '—',
      description: settled ? 'annualised' : 'on completion',
    },
  ]

  return (
    <>
      <div className="grid grid-cols-4">
        {stats.map((stat) => (
          <FieldCard key={stat.title}>
            <StatCard
              title={stat.title}
              value={stat.value}
              description={stat.description}
              className="w-full"
            />
          </FieldCard>
        ))}
      </div>

      {seriesData.length ? (
        <FieldCard>
          <GrowthChart data={visibleData} />
        </FieldCard>
      ) : null}
    </>
  )
}
