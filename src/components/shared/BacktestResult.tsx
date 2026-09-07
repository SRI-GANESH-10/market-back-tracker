import { useMemo } from 'react'
import { useAnimatedSeries } from '@/hooks/useAnimatedSeries'
import type { SeriesData } from '@/hooks/useMarketCagr'
import { FieldCard } from '@/components/shared/FieldCard'
import { StatCard } from '@/components/shared/StatCard'
import { GrowthChart } from '@/components/shared/GrowthChart'

type BacktestResultProps = {
  seriesData: SeriesData[] | undefined
  runId: number
}

export const BacktestResult = ({ seriesData, runId }: BacktestResultProps) => {
  const { currentData, visibleData } = useAnimatedSeries(seriesData, runId)

  const stats = [
    { title: 'CAGR', value: currentData?.cagr != null ? `${currentData.cagr}%` : 'N/A' },
    { title: 'Final Value', value: currentData?.finalValue != null ? currentData.finalValue.toFixed(2) : 'N/A' },
  ]

  return (
    <>
      <div className="grid grid-cols-4">
        {stats.map((stat) => (
          <FieldCard key={stat.title}>
            <StatCard title={stat.title} value={stat.value} className="w-full" />
          </FieldCard>
        ))}
      </div>

      {seriesData?.length ? (
        <FieldCard>
          <GrowthChart data={visibleData} />
        </FieldCard>
      ) : null}
    </>
  )
}
