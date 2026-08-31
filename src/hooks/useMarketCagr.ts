import { useMemo } from 'react'
import { useSelectMarketType } from '@/hooks/useSelectMarketType'
import { calculateCagr } from '@/hooks/useCalculateCagr'

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25

export const useMarketCagr = (market: string | null, date: Date | undefined, amount: number) => {
    const data = useSelectMarketType(market)

    return useMemo(() => {
        const startRow = date ? data.find((row) => new Date(row.date) >= date) : undefined
        const endRow = data.at(-1)
        const firstDate = data[0]?.date

        if (!startRow || !endRow || amount <= 0) return { data, startRow, endRow, firstDate, cagr: null }

        const years = (new Date(endRow.date).getTime() - new Date(startRow.date).getTime()) / MS_PER_YEAR
        if (years <= 0) return { data, startRow, endRow, firstDate, cagr: null }

        return {
            data,
            startRow,
            endRow,
            firstDate,
            years,
            finalValue: (amount / startRow.close) * endRow.close,
            cagr: calculateCagr({ initialValue: startRow.close, finalValue: endRow.close, years }),
        }
    }, [data, date, amount])
}
