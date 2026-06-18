import { NextRequest, NextResponse } from 'next/server'
import {
  supabaseAdmin,
  fetchUsersWithPortfolios,
  fetchPrices,
  hydratePortfolios,
} from '../_lib/portfolio'

// ─── Scheduled portfolio refresh ─────────────────────────────────────────────
//
// Recomputes every user's portfolio value from live prices and writes it to
// `profiles.portfolio_value`, so the leaderboard stays fresh even when the app
// isn't open. Uses the shared server-side value module (same formula as the iOS
// `PortfolioValue` selector). No schema change — it writes an existing column.
//
// Triggered by the Vercel cron (see vercel.json) during market hours; gated by
// CRON_SECRET. Can also be invoked on demand with the same auth header.

export const maxDuration = 60

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // dev: skip auth if not set
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const db = supabaseAdmin()

    const users = await fetchUsersWithPortfolios(db)
    const allSymbols = [...new Set(users.flatMap(u => u.positions.map(p => p.symbol)))]
    const prices = allSymbols.length > 0 ? await fetchPrices(allSymbols) : {}

    // Guard: if we expected prices but got none back (API/key failure), skip the
    // write rather than clobber good values with cost-basis estimates.
    if (allSymbols.length > 0 && Object.keys(prices).length === 0) {
      return NextResponse.json(
        { ok: false, reason: 'no_prices', users: users.length, updated: 0 },
        { status: 502 }
      )
    }

    hydratePortfolios(users, prices)

    let updated = 0
    let failed = 0
    for (const user of users) {
      const { error } = await db
        .from('profiles')
        .update({ portfolio_value: user.totalValue })
        .eq('id', user.userId)
      if (error) {
        failed++
        console.error(`[refresh-portfolios] update failed for ${user.userId}:`, error.message)
      } else {
        updated++
      }
    }

    return NextResponse.json({ ok: true, users: users.length, updated, failed })
  } catch (err) {
    console.error('[refresh-portfolios]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
