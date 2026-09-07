import { useEffect, useState } from "react"
import type { MarketRow } from "@/lib/backtest"

export const useSelectMarketType = (market: string | null) => {
    const [data, setData] = useState<MarketRow[]>([])

    useEffect(() => {
        setData([])
        if (!market) return

        let ignore = false
        fetch(`/data/${market}.json`)
            .then((res) => {
                if (!res.ok) throw new Error(`No data for "${market}" (${res.status})`)
                return res.json() as Promise<MarketRow[]>
            })
            .then((rows) => { if (!ignore) setData(rows) })

        return () => { ignore = true }
    }, [market])

    return data
}
