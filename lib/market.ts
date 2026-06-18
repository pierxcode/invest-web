import type { ChartPoint } from "@/lib/chart/engine"

// Server-side market data for the collection page. Uses Polygon (same source as
// the stock page), with Next fetch caching so we don't hammer the API.

const API = process.env.POLYGON_API_KEY

export interface MarketStock {
  symbol: string
  name: string
  price: number | null
  changePercent: number | null
  spark: ChartPoint[]
}

const POPULAR: { symbol: string; name: string }[] = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "PLTR", name: "Palantir" },
]

interface SnapshotTicker {
  ticker: string
  todaysChangePerc?: number
  day?: { c?: number }
  prevDay?: { c?: number }
  lastTrade?: { p?: number }
}

async function fetchSnapshot(symbols: string[]): Promise<Record<string, SnapshotTicker>> {
  if (!API) return {}
  try {
    const r = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${symbols.join(",")}&apiKey=${API}`,
      { next: { revalidate: 60 } }
    )
    if (!r.ok) return {}
    const j = (await r.json()) as { tickers?: SnapshotTicker[] }
    const map: Record<string, SnapshotTicker> = {}
    for (const t of j.tickers ?? []) map[t.ticker] = t
    return map
  } catch {
    return {}
  }
}

async function fetchSpark(symbol: string): Promise<ChartPoint[]> {
  if (!API) return []
  const to = new Date()
  const from = new Date(to.getTime() - 40 * 86_400_000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  try {
    const r = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fmt(from)}/${fmt(to)}?adjusted=true&sort=asc&limit=40&apiKey=${API}`,
      { next: { revalidate: 3600 } }
    )
    if (!r.ok) return []
    const j = (await r.json()) as { results?: { t: number; c: number }[] }
    return (j.results ?? []).map((b) => ({ t: b.t, v: b.c }))
  } catch {
    return []
  }
}

export async function getPopular(): Promise<MarketStock[]> {
  const symbols = POPULAR.map((p) => p.symbol)
  const [snap, sparks] = await Promise.all([fetchSnapshot(symbols), Promise.all(symbols.map(fetchSpark))])

  return POPULAR.map((p, i) => {
    const s = snap[p.symbol]
    const price = s?.lastTrade?.p ?? s?.day?.c ?? s?.prevDay?.c ?? null
    return {
      symbol: p.symbol,
      name: p.name,
      price,
      changePercent: s?.todaysChangePerc ?? null,
      spark: sparks[i] ?? [],
    }
  })
}
