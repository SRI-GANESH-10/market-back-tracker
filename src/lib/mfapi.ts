import type { MarketRow } from '@/lib/backtest'


const BASE = 'https://api.mfapi.in/mf'

const CACHE_KEY = 'mbt.funds.v3'

export type Fund = { code: string; name: string }

type RawScheme = { schemeCode: number; schemeName: string }
type RawNav = { date: string; nav: string }

const readCache = (): Fund[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? (parsed as Fund[]) : null
  } catch {
    return null
  }
}

const writeCache = (funds: Fund[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(funds))
  } catch {
  }
}

export const fetchFunds = async (): Promise<Fund[]> => {
  const cached = readCache()
  if (cached) return cached

  const res = await fetch(BASE)
  if (!res.ok) throw new Error(`Could not load the fund list (${res.status})`)

  const raw: RawScheme[] = await res.json()
  const funds = raw
    .filter((s) => !/regular|idcw|idwc|dividend/.test(s.schemeName?.toLowerCase() ?? ''))
    .map((s) => ({ code: String(s.schemeCode), name: s.schemeName }))

  if (!funds.length) throw new Error('The fund list came back empty')
  writeCache(funds)
  return funds
}

const toIso = (ddmmyyyy: string): string | null => {
  const [d, m, y] = (ddmmyyyy ?? '').split('-')
  if (!d || !m || !y || y.length !== 4) return null
  return `${y}-${m}-${d}`
}

export const fetchNavHistory = async (code: string): Promise<MarketRow[]> => {
  const res = await fetch(`${BASE}/${code}`)
  if (!res.ok) throw new Error(`Could not load NAV history (${res.status})`)

  const body: { data?: RawNav[] } = await res.json()
  const rows = (body.data ?? [])
    .map((r) => ({ date: toIso(r.date), close: Number(r.nav) }))
    .filter((r): r is MarketRow => !!r.date && Number.isFinite(r.close) && r.close > 0)
    .reverse()

  if (!rows.length) throw new Error('That scheme has no usable NAV history')
  return rows
}
