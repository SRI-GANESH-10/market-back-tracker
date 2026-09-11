import xirr from 'xirr'
import { instalmentOn } from '@/lib/utils'
import { addMonths, addWeeks, parseISO } from 'date-fns'

export type MarketRow = { date: string; close: number }

export type InvestmentMode = 'lumpsum' | 'weekly' | 'monthly'

export type SeriesData = {
  date: string
  close: number
  units: number
  invested: number
  value: number
  avgPrice: number
  returnPct: number
}

export type Buy = { date: string; amount: number }

export type ReturnMetric = {
  label: 'CAGR' | 'XIRR'
  value: number | null
}

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365

const FAR_FUTURE = new Date(8.64e15)

const cagr = (start: number, end: number, years: number) => (end / start) ** (1 / years) - 1

const STEP: Record<InvestmentMode, (start: Date, n: number) => Date> = {
  lumpsum: () => FAR_FUTURE,
  weekly: addWeeks,
  monthly: addMonths,
}

const safeXirr = (transactions: { amount: number; when: Date }[]) => {
  try {
    return xirr(transactions)
  } catch {
    return null
  }
}

export const runBacktest = ({
  rows,
  startDate,
  amount,
  mode,
  stepUpPer,
}: {
  rows: MarketRow[]
  startDate: Date | undefined
  amount: number
  mode: InvestmentMode
  stepUpPer: number
}) => {
  const firstDate = rows[0]?.date


  const startIdx = startDate ? rows.findIndex((row) => parseISO(row.date) >= startDate) : -1

  if (startIdx === -1 || amount <= 0) {
    return { seriesData: [] as SeriesData[], buys: [] as Buy[], firstDate }
  }

  const step = STEP[mode]
  const seriesData: SeriesData[] = []
  const buys: Buy[] = []

  let units = 0
  let invested = 0
  let instalments = 0
  let due = startDate!

  for (const row of rows.slice(startIdx)) {
    const rowDate = parseISO(row.date)

    if (rowDate >= due) {
      const buy = instalmentOn(amount, stepUpPer, startDate!, rowDate)
      units += buy / row.close
      invested += buy
      buys.push({ date: row.date, amount: buy })

      due = step(startDate!, ++instalments)
      while (due <= rowDate) due = step(startDate!, ++instalments)
    }

    const value = units * row.close
    seriesData.push({
      date: row.date,
      close: row.close,
      units,
      invested,
      value,
      avgPrice: invested / units,
      returnPct: value / invested - 1,
    })
  }

  const startRow = rows[startIdx]
  const endRow = rows.at(-1)!
  const last = seriesData.at(-1)!
  const years = (parseISO(endRow.date).getTime() - parseISO(startRow.date).getTime()) / MS_PER_YEAR

  const returnMetric: ReturnMetric =
    mode === 'lumpsum'
      ? { label: 'CAGR', value: years > 0 ? cagr(last.invested, last.value, years) : null }
      : {
          label: 'XIRR',
          value: safeXirr([
            ...buys.map((b) => ({ amount: -b.amount, when: parseISO(b.date) })),
            { amount: last.value, when: parseISO(last.date) },
          ]),
        }

  return {
    seriesData,
    buys,
    startRow,
    endRow,
    firstDate,
    years,
    returnMetric,
  }
}
