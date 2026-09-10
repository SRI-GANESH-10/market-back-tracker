import { format, parseISO } from 'date-fns'
import type { ReturnMetric, SeriesData } from '@/lib/backtest'
import { cn, inr, signedInr, signedPct } from '@/lib/utils'

type PortfolioHeroProps = {
  current: SeriesData | null
  returnMetric: ReturnMetric | undefined
  settled: boolean
}

export const PortfolioHero = ({ current, returnMetric, settled }: PortfolioHeroProps) => {
  const gain = current ? current.value - current.invested : 0
  const up = gain >= 0
  const tone = up ? 'text-primary' : 'text-destructive'

  const stats = [
    { label: 'Invested', value: current ? inr(current.invested) : '—' },
    { label: 'Gain', value: current ? signedInr(gain) : '—', tone },
    { label: 'Abs', value: current ? signedPct(current.returnPct) : '—', tone },
    {
      label: returnMetric?.label ?? 'CAGR',
      value: settled
        ? returnMetric?.value == null
          ? 'N/A'
          : signedPct(returnMetric.value)
        : '—',
      tone: settled ? tone : undefined,
    },
  ]

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
      <div>
        <h1 className="text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Every month you invested, replayed in order.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
          Not a summary — a replay. Watch each instalment land, the market move against it, and
          the position recover, month by month.
        </p>
      </div>

      <div className="w-full lg:border-l lg:border-border lg:pl-16">
        <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
          Portfolio{current ? ` · ${format(parseISO(current.date), 'MMM yyyy')}` : ''}
        </p>

        <p className={cn('mt-3 text-5xl font-bold tabular-nums sm:text-6xl', tone)}>
          {current ? inr(current.value) : '—'}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 font-mono text-sm sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {stat.label}
              </dt>
              <dd className={cn('mt-1.5 tabular-nums', stat.tone)}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
