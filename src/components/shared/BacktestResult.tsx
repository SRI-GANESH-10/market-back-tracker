import { useAnimatedSeries } from '@/hooks/useAnimatedSeries'
import type { ReturnMetric, SeriesData } from '@/lib/backtest'
import { FieldCard } from '@/components/shared/FieldCard'
import { StatCard } from '@/components/shared/StatCard'
import { GrowthChart } from '@/components/shared/GrowthChart'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { inr, pct } from '@/lib/utils'
import { Pause, Play, SkipForward } from 'lucide-react'

type BacktestResultProps = {
  seriesData: SeriesData[]
  returnMetric: ReturnMetric | undefined
  speed: number
  onSpeedChange: (speed: number) => void
}

export const BacktestResult = ({
  seriesData,
  returnMetric,
  speed,
  onSpeedChange,
}: BacktestResultProps) => {
  const { currentData, visibleData, isPlaying, toggle, skipForward } = useAnimatedSeries(seriesData, speed)

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex w-full flex-col gap-2 sm:w-64">
              <div className="flex items-baseline justify-between">
                <Label className="ml-1">Speed</Label>
                <span className="font-mono text-sm tabular-nums">
                  {speed.toFixed(1)}x
                </span>
              </div>
              <Slider
                min={1}
                max={4}
                step={0.1}
                value={speed}
                onValueChange={(value) => onSpeedChange(Math.round(Number(value) * 10) / 10)}
              />
              <div className="flex items-center gap-4">
                {isPlaying ? (
                  <Pause onClick={toggle}></Pause>
                ) : (
                  <Play onClick={toggle}></Play>
                )}
                <SkipForward onClick={skipForward}></SkipForward>
              </div>
            </div>
          </div>
          <GrowthChart data={visibleData} />
        </FieldCard>
      ) : null}
    </>
  )
}
