import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { renderBriefingEmail } from './template'

// ─── Config ────────────────────────────────────────────────────────────────

const POLYGON_KEY = process.env.POLYGON_API_KEY ?? ''
const CLAUDE_KEY = process.env.CLAUDE_API_KEY ?? ''
const STARTING_BALANCE = 1_000_000

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ─── Auth ───────────────────────────────────────────────────────────────────

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // dev: skip auth if not set
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// ─── Route handlers ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runWeeklyBriefing()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[weekly-briefing]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── Main orchestration ───────────────────────────────────────────────────────

async function runWeeklyBriefing() {
  const db = supabaseAdmin()

  // 1. Pull all users + portfolio data from Supabase
  const users = await fetchUsersWithPortfolios(db)
  console.log(`[weekly-briefing] ${users.length} users with positions`)

  // 2. Batch-fetch live prices for every symbol across all portfolios
  const allSymbols = [...new Set(users.flatMap(u => u.positions.map(p => p.symbol)))]
  const prices = allSymbols.length > 0 ? await fetchPrices(allSymbols) : {}

  // 3. Hydrate positions with live prices
  for (const user of users) {
    for (const pos of user.positions) {
      pos.currentPrice = prices[pos.symbol] ?? pos.averageCost
    }
    user.totalValue = user.cashBalance + user.positions.reduce(
      (sum, p) => sum + p.quantity * p.currentPrice, 0
    )
  }

  // 4. Generate shared AI market content (one call, reused for every email)
  const market = await generateMarketContent()

  // 5. Send emails
  const resend = new Resend(process.env.RESEND_API_KEY)
  const stats = { sent: 0, failed: 0, skipped: 0 }

  for (const user of users) {
    if (!user.email) { stats.skipped++; continue }

    const html = renderBriefingEmail(user, market)
    try {
      await resend.emails.send({
        from: 'Invest <weekly@stocksimulator.io>',
        to: user.email,
        subject: `Your weekly brief — ${weekRange()}`,
        html,
      })
      stats.sent++
      // Resend free tier: ~2 req/s — small delay between sends
      await sleep(400)
    } catch (err) {
      console.error(`[weekly-briefing] failed for ${user.userId}:`, err)
      stats.failed++
    }
  }

  return stats
}

// ─── Data types ───────────────────────────────────────────────────────────────

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

export interface MarketContent {
  weeklyStory: string
  biggestMover: { symbol: string; name: string; changePct: number } | null
  lesson: string
  weekRange: string
}

// ─── Supabase fetching ────────────────────────────────────────────────────────

async function fetchUsersWithPortfolios(db: ReturnType<typeof supabaseAdmin>): Promise<UserData[]> {
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

// ─── Market data ──────────────────────────────────────────────────────────────

async function fetchPrices(symbols: string[]): Promise<Record<string, number>> {
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

async function fetchWeeklyMovers(): Promise<Array<{ symbol: string; name: string; changePct: number }>> {
  const watchList = ['AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','NFLX','AMD','JPM','SPY','QQQ']
  try {
    const tickers = watchList.join(',')
    const res = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers}&apiKey=${POLYGON_KEY}`
    )
    const json = await res.json()
    return (json.tickers ?? []).map((t: Record<string, unknown>) => {
      const day = t.day as Record<string, number> | undefined
      const prev = t.prevDay as Record<string, number> | undefined
      const close = day?.c ?? 0
      const open = prev?.c ?? close
      const changePct = open > 0 ? ((close - open) / open) * 100 : 0
      return { symbol: t.ticker as string, name: t.ticker as string, changePct }
    })
  } catch {
    return []
  }
}

async function fetchNewsHeadlines(): Promise<string[]> {
  const queries = ['stock market week', 'S&P 500 weekly', 'Wall Street economy']
  const headlines: string[] = []
  for (const q of queries) {
    try {
      const encoded = encodeURIComponent(q)
      const res = await fetch(
        `https://news.google.com/rss/search?q=${encoded}+stock&hl=en-US&gl=US&ceid=US:en`
      )
      const xml = await res.text()
      const matches = xml.match(/<title>([^<]+)<\/title>/g) ?? []
      headlines.push(
        ...matches
          .slice(1, 6)
          .map(m => m.replace(/<\/?title>/g, '').trim())
          .filter(h => h.length > 10 && !h.toLowerCase().includes('google news'))
      )
    } catch {/* skip */}
  }
  return [...new Set(headlines)].slice(0, 12)
}

// ─── AI content generation ────────────────────────────────────────────────────

async function generateMarketContent(): Promise<MarketContent> {
  const [movers, headlines] = await Promise.all([
    fetchWeeklyMovers(),
    fetchNewsHeadlines(),
  ])

  const sorted = [...movers].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
  const biggest = sorted[0] ?? null

  const moversText = sorted
    .slice(0, 8)
    .map(m => `${m.symbol}: ${m.changePct >= 0 ? '+' : ''}${m.changePct.toFixed(2)}%`)
    .join(', ')

  const headlinesText = headlines.map(h => `• ${h}`).join('\n')

  const prompt = `You are writing the market section of a weekly email for Invest, a stock simulator app.

This week's biggest movers: ${moversText || '(data unavailable)'}

Recent headlines:
${headlinesText || '(no headlines)'}

Write two things:

1. STORY: A 2-3 sentence plain-English explanation of the most interesting market development this week. Ground it in the headlines. No invented reasons. Use "this week" not specific dates.

2. LESSON: One short investing insight (2 sentences max) that connects to current market conditions. Educational, not a tip. Plain English, no jargon.

Return ONLY valid JSON:
{"story":"2-3 sentences about what happened.","lesson":"One investing insight."}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      weeklyStory: parsed.story ?? 'Markets had an eventful week.',
      biggestMover: biggest,
      lesson: parsed.lesson ?? 'Diversification remains one of the most reliable risk management tools.',
      weekRange: weekRange(),
    }
  } catch {
    return {
      weeklyStory: 'Markets moved on a mix of earnings reports and macro data this week.',
      biggestMover: biggest,
      lesson: 'Staying invested through volatility has historically rewarded long-term investors.',
      weekRange: weekRange(),
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weekRange(): string {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(friday)}`
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
