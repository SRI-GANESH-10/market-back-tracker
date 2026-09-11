import { useAnimatedSeries } from '@/hooks/useAnimatedSeries'
import type { ReturnMetric, SeriesData } from '@/lib/backtest'
import { FieldCard } from '@/components/shared/FieldCard'
import { PortfolioHero } from '@/components/shared/PortfolioHero'
import { GrowthChart } from '@/components/shared/GrowthChart'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'

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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={toggle}
                aria-label={settled ? 'Replay' : isPlaying ? 'Pause' : 'Play'}
              >
                {settled ? <RotateCcw /> : isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={skipForward}
                disabled={settled}
                aria-label="Skip to end"
              >
                <SkipForward />
              </Button>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-72">
              <Label className="text-muted-foreground">Speed</Label>
              <Slider
                min={1}
                max={4}
                step={0.1}
                value={speed}
                onValueChange={(value) => onSpeedChange(Math.round(Number(value) * 10) / 10)}
              />
              <span className="w-10 shrink-0 text-right font-mono text-sm tabular-nums">
                {speed.toFixed(1)}x
              </span>
            </div>
          </div>
          <GrowthChart data={visibleData} />
        </FieldCard>
      ) : null}
    </>
  )
}
