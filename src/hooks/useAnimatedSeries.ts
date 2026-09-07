import { useEffect, useRef, useState } from "react";
import type { SeriesData } from "@/lib/backtest";

/** Gap between graph points at 1x. 2x halves it, 3x thirds it. */
export const PAINT_MS = 240

export const useAnimatedSeries = (seriesData: SeriesData[] | undefined, runId: number, speed = 1) => {
    const [currIndex, setCurrIndex] = useState(0);

    // Read through a ref so changing speed retimes the next tick instead of
    // restarting the replay from row 0.
    const speedRef = useRef(speed)
    useEffect(() => { speedRef.current = speed }, [speed])

    useEffect(() => {
        const len = seriesData?.length ?? 0
        if (!len) return

        setCurrIndex(0);
        let i = 0
        // A self-scheduling timeout, not setInterval: the delay has to be re-read
        // every tick for a mid-replay speed change to take effect.
        let id = setTimeout(function tick() {
            setCurrIndex(++i)
            if (i < len) id = setTimeout(tick, PAINT_MS / speedRef.current)
        }, PAINT_MS / speedRef.current)

        return () => clearTimeout(id)
    }, [seriesData, runId])

    const visibleData = seriesData?.slice(0, currIndex) ?? []
    const currentData = visibleData.at(-1) ?? null

    return {
        currentData,
        visibleData,
    }
}
