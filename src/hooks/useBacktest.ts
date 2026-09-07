import { useMemo } from 'react'
import { useSelectMarketType } from '@/hooks/useSelectMarketType'
import { runBacktest, type InvestmentMode } from '@/lib/backtest'

export const useBacktest = (
  market: string | null,
  date: Date | undefined,
  amount: number,
  mode: InvestmentMode
) => {
  const rows = useSelectMarketType(market)

  return useMemo(
    () => ({ rows, ...runBacktest({ rows, startDate: date, amount, mode }) }),
    [rows, date, amount, mode]
  )
}
