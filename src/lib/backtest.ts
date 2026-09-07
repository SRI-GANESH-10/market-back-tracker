import xirr from 'xirr'
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

/** A lumpsum has one cashflow, so a plain annualised growth rate is the right
 * number. A SIP's rupees each sat invested for a different length of time, so it
 * needs XIRR. Never the other way round. */
export type ReturnMetric = {
  label: 'CAGR' | 'XIRR'
  /** Annualised rate as a fraction: 0.1234 is 12.34% a year. null if unsolvable. */
  value: number | null
}

/** Actual/365, the day count `xirr` uses internally (DAYS_IN_YEAR in its
 * source). CAGR has to share it, or the same trade reports two different rates
 * in the two modes. */
const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365

const FAR_FUTURE = new Date(8.64e15)

const cagr = (start: number, end: number, years: number) => (end / start) ** (1 / years) - 1

/**
 * Advances the SIP schedule. Always called with the ORIGINAL start date and an
 * instalment count, never with the previous due date -- addMonths(Jan 31, 1)
 * clamps to Feb 28, and stepping on from there would drift the anchor to the
 * 28th forever. addMonths(Jan 31, 2) is Mar 31.
 *
 * lumpsum returns a date that never arrives, so `due` never re-arms after the
 * first buy and the same loop covers all three modes with no branch.
 */
const STEP: Record<InvestmentMode, (start: Date, n: number) => Date> = {
  lumpsum: () => FAR_FUTURE,
  weekly: addWeeks,
  monthly: addMonths,
}

/**
 * xirr throws on degenerate cashflows (all on one day, all one sign) and on
 * non-convergence, rather than returning a plausible wrong number. null here
 * means "no annualised rate exists for these cashflows".
 */
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
}: {
  rows: MarketRow[]
  startDate: Date | undefined
  amount: number
  mode: InvestmentMode
}) => {
  const firstDate = rows[0]?.date

  // parseISO, not new Date: a date-only string parses as UTC midnight while the
  // picker hands over local midnight, which shifts the buy by a day west of UTC.
  const startIdx = startDate ? rows.findIndex((row) => parseISO(row.date) >= startDate) : -1

  if (startIdx === -1 || amount <= 0) {
    return { seriesData: [] as SeriesData[], buyDates: [] as string[], firstDate }
  }

  const step = STEP[mode]
  const seriesData: SeriesData[] = []
  const buyDates: string[] = []

  let units = 0
  let invested = 0
  let instalments = 0
  let due = startDate!

  for (const row of rows.slice(startIdx)) {
    const rowDate = parseISO(row.date)

    if (rowDate >= due) {
      units += amount / row.close
      invested += amount
      buyDates.push(row.date)

      due = step(startDate!, ++instalments)
      // A closure longer than one interval skips the missed instalment rather
      // than buying twice on the reopen day. Fill dates never feed back into the
      // schedule, so 1st / 8th / (15th closed -> 16th) still steps on to the 22nd.
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
            // money out is negative; the closing valuation is a notional inflow
            ...buyDates.map((date) => ({ amount: -amount, when: parseISO(date) })),
            { amount: last.value, when: parseISO(last.date) },
          ]),
        }

  return {
    seriesData,
    buyDates,
    startRow,
    endRow,
    firstDate,
    years,
    returnMetric,
  }
}
