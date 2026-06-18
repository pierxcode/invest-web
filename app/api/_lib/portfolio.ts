import { createClient } from '@supabase/supabase-js'

// ─── Server-side portfolio value (single source of truth) ────────────────────
//
// The canonical server-side computation of portfolio value. It mirrors the iOS
// `PortfolioValue` selector so both platforms agree: value = cash + Σ(qty ×
// mark), where the mark is the live price, falling back to average cost.
//
// Both the weekly briefing and the scheduled portfolio refresh build on this so
// the value formula lives in exactly one place per platform.

const POLYGON_KEY = process.env.POLYGON_API_KEY ?? ''

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export interface Position {
  symbol: string
  name: string
  quantity: number
  averageCost: number
  currentPrice: number
}

export interface UserData {
  userId: string
  email: string
  username: string
  cashBalance: number
  totalValue: number
  positions: Position[]
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// ─── Value math (mirrors iOS PortfolioValue) ─────────────────────────────────

/** One position's market value: quantity × (live price, falling back to avg cost). */
export function positionMarketValue(
  quantity: number,
  livePrice: number | undefined,
  averageCost: number
): number {
  return quantity * (livePrice ?? averageCost)
}

/** The portfolio total: cash + Σ positions (using each position's currentPrice). */
export function portfolioTotalValue(cashBalance: number, positions: Position[]): number {
  return cashBalance + positions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0)
}

/** Hydrate each position's currentPrice from a price map and recompute totalValue. */
export function hydratePortfolios(users: UserData[], prices: Record<string, number>): void {
  for (const user of users) {
    for (const pos of user.positions) {
      const px = prices[pos.symbol]
      // Treat a missing or non-positive price as "no quote" → fall back to cost.
      pos.currentPrice = px && px > 0 ? px : pos.averageCost
    }
    user.totalValue = portfolioTotalValue(user.cashBalance, user.positions)
  }
}

// ─── Supabase fetching ───────────────────────────────────────────────────────

export async function fetchUsersWithPortfolios(
  db: ReturnType<typeof supabaseAdmin>
): Promise<UserData[]> {
  // Get all auth users
  const { data: authData, error: authErr } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (authErr || !authData) return []
  const emailMap = new Map(authData.users.map(u => [u.id, u.email ?? '']))

  // Get all portfolios
  const { data: portfolios } = await db
    .from('portfolios')
    .select('id, user_id, cash_balance')
  if (!portfolios) return []

  // Get all positions
  const portfolioIds = portfolios.map(p => p.id)
  const { data: positions } = await db
    .from('positions')
    .select('portfolio_id, symbol, name, quantity, average_cost')
    .in('portfolio_id', portfolioIds)

  // Get all usernames from profiles
  const { data: profiles } = await db
    .from('profiles')
    .select('id, username')
  const usernameMap = new Map((profiles ?? []).map(p => [p.id, p.username as string]))

  // Join everything
  const positionsByPortfolio = new Map<string, Position[]>()
  for (const pos of (positions ?? [])) {
    const list = positionsByPortfolio.get(pos.portfolio_id) ?? []
    list.push({
      symbol: pos.symbol,
      name: pos.name ?? pos.symbol,
      quantity: pos.quantity,
      averageCost: pos.average_cost,
      currentPrice: pos.average_cost, // hydrated later
    })
    positionsByPortfolio.set(pos.portfolio_id, list)
  }

  return portfolios
    .filter(p => (positionsByPortfolio.get(p.id) ?? []).length > 0)
    .map(p => ({
      userId: p.user_id,
      email: emailMap.get(p.user_id) ?? '',
      username: usernameMap.get(p.user_id) ?? 'Investor',
      cashBalance: p.cash_balance,
      totalValue: p.cash_balance, // hydrated after price fetch
      positions: positionsByPortfolio.get(p.id) ?? [],
    }))
}

// ─── Market data ───────────────────────────────────────────────────────────────

export async function fetchPrices(symbols: string[]): Promise<Record<string, number>> {
  const chunks = chunkArray(symbols, 100)
  const prices: Record<string, number> = {}
  for (const chunk of chunks) {
    const tickers = chunk.join(',')
    try {
      const res = await fetch(
        `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers}&apiKey=${POLYGON_KEY}`
      )
      const json = await res.json()
      for (const t of json.tickers ?? []) {
        prices[t.ticker] = t.day?.c ?? t.prevDay?.c ?? 0
      }
    } catch {/* silent — averageCost is the fallback */}
  }
  return prices
}
