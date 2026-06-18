import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Home, TrendingUp, Trophy, BookOpen, ChevronRight,
  ExternalLink, Users, BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import EngineChart from './EngineChart'
import BuyPanel from './BuyPanel'
import DonutChart from './DonutChart'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TickerDetails {
  ticker: string
  name: string
  description?: string
  market_cap?: number
  total_employees?: number
  homepage_url?: string
  primary_exchange?: string
  currency_name?: string
}

interface DayAgg {
  o: number; h: number; l: number; c: number; v: number; t: number; vw?: number
}

interface PageProps {
  params: Promise<{ symbol: string }>
}

// ─── Polygon data fetchers ────────────────────────────────────────────────────

const API = process.env.POLYGON_API_KEY

async function getTickerDetails(symbol: string): Promise<TickerDetails | null> {
  try {
    const r = await fetch(`https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${API}`, {
      next: { revalidate: 3600 },
    })
    const json = await r.json()
    return json.results ?? null
  } catch { return null }
}

async function getPrevClose(symbol: string): Promise<DayAgg | null> {
  try {
    const r = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${API}`,
      { next: { revalidate: 300 } }
    )
    const json = await r.json()
    return json.results?.[0] ?? null
  } catch { return null }
}

async function getCandles(symbol: string): Promise<DayAgg[]> {
  try {
    const to = new Date().toISOString().slice(0, 10)
    const from = new Date(Date.now() - 35 * 86400000).toISOString().slice(0, 10)
    const r = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=30&apiKey=${API}`,
      { next: { revalidate: 3600 } }
    )
    const json = await r.json()
    return json.results ?? []
  } catch { return [] }
}

// Longer daily history (~5y) for the interactive chart's timeframe tabs.
async function getHistory(symbol: string): Promise<DayAgg[]> {
  try {
    const to = new Date().toISOString().slice(0, 10)
    const from = new Date(Date.now() - 5 * 365 * 86400000).toISOString().slice(0, 10)
    const r = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=2000&apiKey=${API}`,
      { next: { revalidate: 3600 } }
    )
    const json = await r.json()
    return json.results ?? []
  } catch { return [] }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number | undefined, dec = 2): string {
  if (n == null) return '—'
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function fmtBig(n: number | undefined): string {
  if (!n) return '—'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M'
  return '$' + n.toLocaleString()
}

function fmtVol(n: number | undefined): string {
  if (!n) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toFixed(0)
}

// ─── SEO metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol: raw } = await params
  const symbol = raw.toUpperCase()
  const details = await getTickerDetails(symbol)
  if (!details) return { title: 'Stock Not Found' }
  return {
    title: `${details.name} (${symbol}) Stock Price — Practice Trading | Invest`,
    description: `Trade ${details.name} (${symbol}) risk-free with €1,000,000 virtual cash. Live price, chart, and stats. The best stock simulator on iOS.`,
    openGraph: {
      title: `${symbol} · ${details.name} | Invest Simulator`,
      description: `Practice trading ${symbol} with €1M virtual money. Real prices, zero risk.`,
      type: 'website',
      url: `https://stocksimulator.io/stocks/${symbol}`,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StockPage({ params }: PageProps) {
  const { symbol: raw } = await params
  const symbol = raw.toUpperCase()

  const [details, prevClose, candles, history] = await Promise.all([
    getTickerDetails(symbol),
    getPrevClose(symbol),
    getCandles(symbol),
    getHistory(symbol),
  ])

  if (!details) notFound()

  const prices = candles.map((c) => c.c)
  const price = prevClose?.c
  const prevPrice = candles.length >= 2 ? candles[candles.length - 2]?.c : undefined
  const dayChangePct = prevPrice && price ? ((price - prevPrice) / prevPrice) * 100 : undefined
  const dayChange = prevPrice && price ? price - prevPrice : undefined
  const isUp = (dayChangePct ?? 0) >= 0

  // Slim candle data for client components
  const slimCandles = candles.map((c) => ({ c: c.c, t: c.t }))

  const stats = [
    { label: 'Market Cap', value: fmtBig(details.market_cap) },
    { label: 'Volume', value: fmtVol(prevClose?.v) },
    { label: 'Day High', value: fmt(prevClose?.h) },
    { label: 'Day Low', value: fmt(prevClose?.l) },
    { label: 'Open', value: fmt(prevClose?.o) },
    { label: 'VWAP', value: fmt(prevClose?.vw) },
  ]

  const faqs = [
    {
      q: `What is ${details.name} (${symbol}) stock?`,
      a: `${details.name} (${symbol}) is a publicly traded company${details.primary_exchange ? ` listed on the ${details.primary_exchange}` : ''}. ${details.description ? details.description.slice(0, 300) + '...' : 'It is one of the most actively traded securities in the market.'}`,
    },
    {
      q: `How can I practice trading ${symbol} without risk?`,
      a: `Download Invest — a free iOS stock simulator. You get €1,000,000 in virtual cash to trade ${symbol} at real market prices with no financial risk whatsoever. It's the safest way to learn.`,
    },
    {
      q: `What is a stock market simulator?`,
      a: `A stock simulator lets you buy and sell real stocks using virtual money. You experience real market dynamics, real prices, and real news — but without putting actual money at risk. It's ideal for beginners and experienced investors testing new strategies.`,
    },
    {
      q: `Is ${symbol} a good stock for beginner investors to practice with?`,
      a: `Yes — ${symbol} is one of the most popular stocks on Invest. It has high liquidity, strong analyst coverage, and extensive news coverage, making it a great learning tool for understanding how major stocks behave.`,
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Stocks', item: 'https://stocksimulator.io/stocks' },
          { '@type': 'ListItem', position: 2, name: `${details.name} (${symbol})`, item: `https://stocksimulator.io/stocks/${symbol}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Invest — Stock Market Simulator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'iOS',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: `Practice trading ${symbol} and thousands of other stocks with €1M virtual cash.`,
      },
    ],
  }

  const navItems = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/stocks', label: 'Markets', Icon: TrendingUp, active: true },
    { href: '/leaderboard/global', label: 'Leaderboard', Icon: Trophy },
    { href: '/learn', label: 'Learn', Icon: BookOpen },
  ]

  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']
    .filter((s) => s !== symbol)
    .slice(0, 6)

  // ── Layout ───────────────────────────────────────────────────────────────────

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Outer background */}
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

        {/* ── Centered container (Twitter-style: sidebar + content + panel) ── */}
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', minHeight: '100vh' }}>

          {/* ═══ LEFT SIDEBAR ═══════════════════════════════════════════════ */}
          <aside
            style={{
              width: 220, flexShrink: 0,
              position: 'sticky', top: 0, height: '100vh',
              overflowY: 'auto', background: '#000', zIndex: 10,
              borderRight: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column',
            }}
            className="hidden lg:flex"
          >
            {/* Logo */}
            <div style={{ padding: '20px 16px 12px' }}>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#000', fontWeight: 800, fontSize: 14 }}>I</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>Invest</span>
              </a>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
              {navItems.map((item) => (
                <a key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  fontSize: 14, fontWeight: 500,
                  color: item.active ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: item.active ? 'rgba(255,255,255,0.07)' : 'transparent',
                  textDecoration: 'none', marginBottom: 2, transition: 'all 0.15s',
                }}>
                  <item.Icon size={16} strokeWidth={1.75} />
                  {item.label}
                </a>
              ))}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 4px' }} />

              {/* Current stock */}
              <div style={{ padding: '0 4px 6px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 8px' }}>
                  Viewing
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#a1a1aa', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
                    {symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.3 }}>{symbol}</p>
                    <p style={{ fontSize: 11, color: '#52525b', margin: 0, lineHeight: 1.3 }}>
                      {isUp ? '▲' : '▼'}{' '}
                      <span style={{ color: isUp ? '#34d399' : '#f87171' }}>
                        {dayChangePct != null ? `${isUp ? '+' : ''}${dayChangePct.toFixed(2)}%` : '—'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Popular stocks */}
              <div style={{ padding: '10px 4px 0' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 8px' }}>
                  Popular
                </p>
                {popularStocks.map((s) => (
                  <a key={s} href={`/stocks/${s}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 12px', borderRadius: 8, textDecoration: 'none',
                    color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                  }}>
                    <span>{s}</span>
                    <ChevronRight size={12} strokeWidth={2} />
                  </a>
                ))}
              </div>
            </nav>

            {/* Download CTA */}
            <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <a
                href="https://apps.apple.com/us/app/invest-stock-simulator/id6761500263"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '11px 0', borderRadius: 12, background: '#fff', color: '#000', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.15s' }}
              >
                <svg width="12" height="15" viewBox="0 0 814 1000" fill="currentColor">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 435.8 43.5 160.7 157 76c39.4-29.4 94-50.6 152.3-50.6 59.9 0 107.2 37.7 141 37.7 32.7 0 88.5-42.5 155-42.5zm-73.6-142.4c30.4-35.7 52.4-85.6 52.4-135.5 0-6.8-.7-13.6-2-19.4-49.5 1.9-108.1 32.9-143.4 73.2-27.6 30.6-53.8 80.1-53.8 130.5 0 7.5 1.3 14.9 1.9 17.2 3.2.6 8.4 1.3 13.6 1.3 43.9 0 97.7-29.2 131.3-67.3z" />
                </svg>
                Download Free
              </a>
              <p style={{ fontSize: 11, color: '#3f3f46', textAlign: 'center', margin: '6px 0 0' }}>
                iOS · No real money
              </p>
            </div>
          </aside>

          {/* ═══ MOBILE TOPBAR ════════════════════════════════════════════════ */}
          <div
            className="lg:hidden"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#000', fontWeight: 800, fontSize: 11 }}>I</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>Invest</span>
            </a>
            <a href="https://apps.apple.com/us/app/invest-stock-simulator/id6761500263" style={{ background: '#fff', color: '#000', fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 100, textDecoration: 'none' }}>
              Download
            </a>
          </div>

          {/* ═══ MAIN CONTENT ═════════════════════════════════════════════════ */}
          <main style={{ flex: 1, minWidth: 0 }} className="lg:pt-0 pt-14">
            <div style={{ maxWidth: 720, padding: '28px 24px 64px' }}>

              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#52525b', marginBottom: 24 }}>
                <a href="/" style={{ color: '#52525b', textDecoration: 'none' }}>Home</a>
                <ChevronRight size={12} strokeWidth={2} />
                <a href="/stocks" style={{ color: '#52525b', textDecoration: 'none' }}>Stocks</a>
                <ChevronRight size={12} strokeWidth={2} />
                <span style={{ color: '#a1a1aa' }}>{symbol}</span>
              </div>

              {/* ── STOCK HEADER CARD ─────────────────────────────────────── */}
              <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ padding: '24px 24px 0' }}>
                  {/* Identity + price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'ui-monospace, monospace', background: 'rgba(255,255,255,0.07)', padding: '3px 8px', borderRadius: 6, color: '#d4d4d8', letterSpacing: '0.04em' }}>
                          {symbol}
                        </span>
                        {details.primary_exchange && (
                          <span style={{ fontSize: 11, color: '#3f3f46', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4 }}>
                            {details.primary_exchange}
                          </span>
                        )}
                      </div>
                      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 4px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                        {details.name}
                      </h1>
                      {details.market_cap && (
                        <p style={{ fontSize: 12, color: '#52525b', margin: 0 }}>
                          Market cap <span style={{ color: '#71717a' }}>{fmtBig(details.market_cap)}</span>
                        </p>
                      )}
                    </div>
                    {price != null && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                          {fmt(price)}
                        </p>
                        {dayChangePct != null && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 5 }}>
                            {isUp
                              ? <ArrowUpRight size={14} style={{ color: '#34d399' }} />
                              : <ArrowDownRight size={14} style={{ color: '#f87171' }} />
                            }
                            <span style={{ fontSize: 13, fontWeight: 600, color: isUp ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                              {isUp ? '+' : ''}{dayChange?.toFixed(2)} ({isUp ? '+' : ''}{dayChangePct.toFixed(2)}%)
                            </span>
                          </div>
                        )}
                        <p style={{ fontSize: 10, color: '#3f3f46', marginTop: 4 }}>PREV. CLOSE</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive chart — full bleed */}
                {history.length > 1 && (
                  <EngineChart points={history.map((c) => ({ t: c.t, v: c.c }))} />
                )}

                {/* Period tabs */}
                <div style={{ display: 'flex', gap: 2, padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {['1W', '1M', '3M', '6M', '1Y', 'Max'].map((p, i) => (
                    <button key={p} style={{
                      padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                      border: 'none', cursor: 'pointer',
                      background: i === 1 ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: i === 1 ? '#fff' : '#52525b', transition: 'all 0.15s',
                    }}>
                      {p}
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: '#3f3f46', alignSelf: 'center', paddingRight: 4 }}>30-day</span>
                </div>
              </div>

              {/* ── STATS GRID ────────────────────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {stats.map((s) => (
                  <div key={s.label} style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', padding: '13px 16px' }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px' }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── SIMULATOR CTA + DONUT (2-col square grid) ─────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {/* CTA card */}
                <div style={{
                  borderRadius: 20, border: '1px solid rgba(52,211,153,0.18)',
                  background: 'rgba(52,211,153,0.03)',
                  padding: '24px 20px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20,
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Free Simulator
                      </span>
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                      Trade {symbol} with €1M virtual cash
                    </p>
                    <p style={{ fontSize: 12, color: '#52525b', margin: 0, lineHeight: 1.5 }}>
                      Real prices · Zero risk · Compete globally
                    </p>
                  </div>
                  <a
                    href="https://apps.apple.com/us/app/invest-stock-simulator/id6761500263"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', color: '#000', fontSize: 13, fontWeight: 700, padding: '11px 18px', borderRadius: 12, textDecoration: 'none', alignSelf: 'flex-start' }}
                  >
                    Try Free
                    <ArrowUpRight size={13} strokeWidth={2.5} />
                  </a>
                </div>

                {/* Donut chart */}
                <DonutChart candles={slimCandles} symbol={symbol} />
              </div>

              {/* ── ABOUT ─────────────────────────────────────────────────── */}
              {details.description && (
                <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', padding: '22px 24px', marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
                    About {details.name}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: '#a1a1aa', margin: 0 }}>
                    {details.description}
                  </p>
                  {(details.total_employees || details.homepage_url) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {details.total_employees && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Users size={13} style={{ color: '#52525b' }} />
                          <div>
                            <p style={{ fontSize: 10, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 1px' }}>Employees</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{details.total_employees.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {details.homepage_url && (
                        <a href={details.homepage_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#71717a', textDecoration: 'none' }}>
                          <ExternalLink size={12} />
                          {details.homepage_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── HOW TO TRADE ──────────────────────────────────────────── */}
              <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', padding: '22px 24px', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>
                  How to Practice Trading {symbol}
                </p>
                <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { step: 'Download Invest', detail: 'Free on the App Store. No subscription, no credit card.' },
                    { step: 'Create an account', detail: 'Takes under 60 seconds. Just an email.' },
                    { step: 'Get €1M virtual cash', detail: 'Your starting balance, instantly. No deposit needed.' },
                    { step: `Search for ${symbol}`, detail: 'Set a quantity and tap Buy at real market price.' },
                    { step: 'Track and compete', detail: 'Watch your portfolio grow and climb the global leaderboard.' },
                  ].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', color: '#71717a', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        {i + 1}
                      </span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{item.step}</p>
                        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* ── LEADERBOARD ───────────────────────────────────────────── */}
              <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', padding: '22px 24px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    Top {symbol} Traders on Invest
                  </p>
                  <a href="/leaderboard/global" style={{ fontSize: 12, color: '#52525b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                    Full leaderboard <ChevronRight size={12} />
                  </a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { rank: 1, name: 'BullishApe123', pct: '+147.3%', value: '€2,473,000', medal: '🥇' },
                    { rank: 2, name: 'DiamondHands_EU', pct: '+134.8%', value: '€2,348,000', medal: '🥈' },
                    { rank: 3, name: 'TeslaOrBust', pct: '+112.6%', value: '€2,126,000', medal: '🥉' },
                    { rank: 4, name: 'MarketWizard99', pct: '+98.4%', value: '€1,984,000', medal: null },
                    { rank: 5, name: 'StockSavant', pct: '+87.1%', value: '€1,871,000', medal: null },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <span style={{ width: 22, fontSize: 14, flexShrink: 0 }}>
                        {row.medal ?? <span style={{ fontSize: 11, color: '#3f3f46', fontVariantNumeric: 'tabular-nums' }}>#{row.rank}</span>}
                      </span>
                      <BarChart3 size={14} style={{ color: '#3f3f46', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#e4e4e7' }}>{row.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>{row.pct}</span>
                      <span style={{ fontSize: 12, color: '#52525b', fontVariantNumeric: 'tabular-nums' }} className="hidden sm:block">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── FAQ ───────────────────────────────────────────────────── */}
              <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', padding: '22px 24px', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
                  Frequently Asked Questions
                </p>
                <div>
                  {faqs.map((faq, i) => (
                    <div key={i}>
                      {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '14px 0' }} />}
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 6px', lineHeight: 1.4 }}>{faq.q}</h3>
                      <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RELATED STOCKS ────────────────────────────────────────── */}
              <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', padding: '22px 24px', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
                  More Stocks to Practice
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {popularStocks.map((s) => (
                    <a key={s} href={`/stocks/${s}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', textDecoration: 'none', transition: 'all 0.15s' }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#a1a1aa', flexShrink: 0 }}>
                        {s.slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#e4e4e7' }}>{s}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#000', fontWeight: 800, fontSize: 8 }}>I</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#3f3f46' }}>Invest — Stock Market Simulator</span>
                </div>
                <p style={{ fontSize: 11, color: '#27272a', margin: 0 }}>Not financial advice.</p>
              </div>

            </div>
          </main>

          {/* ═══ RIGHT BUY PANEL (xl+) ════════════════════════════════════════ */}
          {price != null && (
            <div
              className="hidden xl:flex"
              style={{ width: 300, flexShrink: 0, padding: '28px 20px 28px 8px', alignItems: 'flex-start' }}
            >
              <div style={{ width: '100%' }}>
                <BuyPanel
                  symbol={symbol}
                  price={price}
                  isUp={isUp}
                  dayChangePct={dayChangePct}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
