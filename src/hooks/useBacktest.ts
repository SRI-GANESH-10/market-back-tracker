import { useMemo } from 'react'
import { useNavHistory } from '@/hooks/useNavHistory'
import { runBacktest, type InvestmentMode } from '@/lib/backtest'

export const useBacktest = (
  market: string | null,
  date: Date | undefined,
  amount: number,
  mode: InvestmentMode,
  stepUpPer: number
) => {
  const { rows, error } = useNavHistory(market)

  return useMemo(
    () => ({ rows, error, ...runBacktest({ rows, startDate: date, amount, mode, stepUpPer }) }),
    [rows, error, date, amount, mode, stepUpPer]
  )
}
