import { useAnimatedSeries } from '@/hooks/useAnimatedSeries'
import type { ReturnMetric, SeriesData } from '@/lib/backtest'
import { FieldCard } from '@/components/shared/FieldCard'
import { PortfolioHero } from '@/components/shared/PortfolioHero'
import { GrowthChart } from '@/components/shared/GrowthChart'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Pause, Play, SkipForward } from 'lucide-react'

type BacktestResultProps = {
  seriesData: SeriesData[]
  returnMetric: ReturnMetric | undefined
  speed: number
  onSpeedChange: (speed: number) => void
  /**
   * The input controls. They render between the hero and the chart, and they
   * live here as children rather than in the page because the hero and the
   * chart both read this component's replay state -- and it is keyed on runId,
   * so a new run remounts the whole block.
   */
  children?: React.ReactNode
}

export const BacktestResult = ({
  seriesData,
  returnMetric,
  speed,
  onSpeedChange,
  children,
}: BacktestResultProps) => {
  const { currentData, visibleData, isPlaying, toggle, skipForward } = useAnimatedSeries(seriesData, speed)

  // CAGR/XIRR describe the whole run, so they only exist on the final row. Hold
  // them back until the animation gets there rather than spoiling the result.
  const settled = seriesData.length > 0 && visibleData.length >= seriesData.length

  return (
    <>
      <PortfolioHero current={currentData} returnMetric={returnMetric} settled={settled} />

      {children}

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
