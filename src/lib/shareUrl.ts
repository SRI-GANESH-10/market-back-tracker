import { format, isValid, parseISO } from 'date-fns'
import { MARKETS, SIP_FREQUENCIES } from '@/constants/markets'
import type { InvestmentMode } from '@/lib/backtest'

export type BacktestParams = {
  market: string
  amount: number
  date: Date
  mode: InvestmentMode
}

/** What loads when there is nothing in the URL: a run that produces a chart on
 *  the very first click, rather than an empty form. */
const DEFAULTS: BacktestParams = {
  market: 'nifty50',
  amount: 5000,
  date: new Date(2020, 0, 1),
  mode: 'monthly',
}

const MODES: InvestmentMode[] = ['lumpsum', ...SIP_FREQUENCIES.map((f) => f.value)]

/**
 * Reads the backtest out of the query string, falling back to DEFAULTS field by
 * field. Everything is validated: a shared link is untrusted input, and a bad
 * value should degrade to the default rather than render NaN into the chart.
 */
export const readParams = (search: string): BacktestParams => {
  const q = new URLSearchParams(search)

  const market = MARKETS.some((m) => m.value === q.get('market'))
    ? q.get('market')!
    : DEFAULTS.market

  const amount = Number(q.get('amount'))
  const date = parseISO(q.get('from') ?? '')
  const mode = MODES.find((m) => m === q.get('mode'))

  return {
    market,
    amount: Number.isFinite(amount) && amount > 0 ? amount : DEFAULTS.amount,
    date: isValid(date) ? date : DEFAULTS.date,
    mode: mode ?? DEFAULTS.mode,
  }
}

export const toSearch = ({ market, amount, date, mode }: BacktestParams) =>
  '?' +
  new URLSearchParams({
    market,
    amount: String(amount),
    from: format(date, 'yyyy-MM-dd'),
    mode,
  })
