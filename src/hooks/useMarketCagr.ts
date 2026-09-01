import { useMemo } from 'react'
import { useSelectMarketType } from '@/hooks/useSelectMarketType'
import { calculateCagr } from '@/hooks/useCalculateCagr'

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25

export const useMarketCagr = (market: string | null, date: Date | undefined, amount: number) => {
    const data = useSelectMarketType(market)

    return useMemo(() => {
        const startIdx = date ? data.findIndex((row) => new Date(row.date) >= date) : -1
        const startRow =  startIdx === -1 ? undefined : data[startIdx];
        const endRow = data.at(-1)
        const firstDate = data[0]?.date

        if (!startRow || !endRow || amount <= 0) return { data, startRow, endRow, firstDate, cagr: null }

        const years = (new Date(endRow.date).getTime() - new Date(startRow.date).getTime()) / MS_PER_YEAR
        if (years <= 0) return { data, startRow, endRow, firstDate, cagr: null }

        const seriesData =  data.slice(startIdx)?.map((row)=>{
            return {
                date: row.date,
                close: row.close,
                finalValue: (amount / startRow.close) * row.close,
                cagr: row.date === startRow.date ? 0 : calculateCagr({ initialValue: startRow.close, finalValue: row.close, years: (new Date(row.date).getTime() - new Date(startRow.date).getTime()) / MS_PER_YEAR }),
            }
        });

        return {
            seriesData,
            data,
            startRow,
            endRow,
            firstDate,
            years,
            finalValue: seriesData.at(-1)?.finalValue,
            cagr: seriesData.at(-1)?.cagr,
        }
    }, [data, date, amount])
}
