import { useEffect, useState } from "react";
import type { SeriesData } from "@/lib/backtest";

export const useAnimatedSeries = (seriesData: SeriesData[] | undefined, runId: number) => {
    const [currIndex, setCurrIndex] = useState(0);

    useEffect(() => {
        const len = seriesData?.length ?? 0
        if (!len) return

        setCurrIndex(0);
        let i = 0
        const id = setInterval(() => {
            setCurrIndex(++i)
            if (i >= len) clearInterval(id)
        }, 1)

        return () => clearInterval(id)
    }, [seriesData, runId])

    const visibleData = seriesData?.slice(0, currIndex) ?? []
    const currentData = visibleData.at(-1) ?? null

    return {
        currentData,
        visibleData,
    }
}
