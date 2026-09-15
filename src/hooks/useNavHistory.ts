import { useEffect, useState } from 'react'
import type { MarketRow } from '@/lib/backtest'
import { fetchNavHistory } from '@/lib/mfapi'

type Loaded = { code: string; rows: MarketRow[]; error: string | null }

export const useNavHistory = (code: string | null) => {
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!code) return

    let ignore = false
    fetchNavHistory(code)
      .then((rows) => { if (!ignore) setLoaded({ code, rows, error: null }) })
      .catch((e: Error) => { if (!ignore) setLoaded({ code, rows: [], error: e.message }) })

    return () => { ignore = true }
  }, [code])

  const fresh = loaded?.code === code
  return {
    rows: fresh ? loaded!.rows : [],
    error: fresh ? loaded!.error : null,
  }
}
