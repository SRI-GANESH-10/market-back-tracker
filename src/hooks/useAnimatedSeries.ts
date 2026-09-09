import { useEffect, useRef, useState } from "react";
import type { SeriesData } from "@/lib/backtest";

/** Gap between graph points at 1x. 2x halves it, 3x thirds it. */
export const PAINT_MS = 240

export const useAnimatedSeries = (seriesData: SeriesData[] | undefined, speed = 1) => {
    const [currIndex, setCurrIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const currentIndexRed = useRef(0);
    const len = seriesData?.length ?? 0;

    useEffect(() => {
        if (!isPlaying || !len) return
        let id = setTimeout(function tick() {
            setCurrIndex(++currentIndexRed.current)
            if (currentIndexRed.current >= len) return setIsPlaying(false)
            id = setTimeout(tick, PAINT_MS / speed)
        }, PAINT_MS / speed)

        return () => clearTimeout(id)
    }, [isPlaying, len, speed])

    const visibleData = seriesData?.slice(0, currIndex) ?? []
    const currentData = visibleData.at(-1) ?? null

    const toggle = () =>{
        setIsPlaying(prev => !prev);
    }

    return {
        currentData,
        visibleData,
        isPlaying,
        toggle
    }
}
