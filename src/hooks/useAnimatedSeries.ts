import { useEffect, useState } from "react";
import type { SeriesData } from "./useMarketCagr";


export const useAnimatedSeries = (seriesData: SeriesData[] | undefined) => {

    const isPlaying = false;
    const [currIndex, setCurrIndex] = useState(0);
    useEffect(() => {

        if (!seriesData?.length) return
        setCurrIndex(0); // Reset the current index whenever the series data changes
        let id = setInterval(() => {
            setCurrIndex((i) => Math.min(i + 1, seriesData.length))
        }, 100)

        return () => clearInterval(id)
    }, [seriesData])
   
    const visibleData = seriesData?.slice(0, currIndex) ?? []
    const currentData = visibleData.at(-1) ?? null

    return {
        currentData,
        visibleData,
        isPlaying
    }
}