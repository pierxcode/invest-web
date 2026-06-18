import Link from "next/link"
import type { Metadata } from "next"
import { getPopular } from "@/lib/market"
import { SiteNav } from "@/components/site-nav"
import { Sparkline } from "@/components/chart/sparkline"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Market — Invest",
  description: "The most popular stocks on Invest, with live prices and charts.",
}

export default async function MarketPage() {
  const stocks = await getPopular()

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <SiteNav />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <header className="mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">The Market</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Popular stocks</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The ten most-watched names on Invest right now — live price, today&apos;s move, and a 40-day trend.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {stocks.map((s, i) => {
            const up = (s.changePercent ?? 0) >= 0
            return (
              <Link key={s.symbol} href={`/stocks/${s.symbol}`} className="block">
                <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:border-zinc-700">
                  <div className="flex items-center gap-4">
                    <span className="w-5 text-right font-mono text-sm text-muted-foreground">{i + 1}</span>
                    <div>
                      <div className="font-semibold text-foreground">{s.symbol}</div>
                      <div className="text-sm text-muted-foreground">{s.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Sparkline points={s.spark} up={up} className="hidden sm:block" />
                    <div className="min-w-[92px] text-right">
                      <div className="font-mono text-sm text-foreground">
                        {s.price != null ? `$${s.price.toFixed(2)}` : "—"}
                      </div>
                      {s.changePercent != null ? (
                        <Badge variant={up ? "success" : "danger"} className="mt-1">
                          {up ? "+" : ""}
                          {s.changePercent.toFixed(2)}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {!process.env.POLYGON_API_KEY && (
          <p className="mt-8 text-sm text-muted-foreground">
            Set <code className="font-mono text-foreground">POLYGON_API_KEY</code> to load live prices and charts.
          </p>
        )}
      </div>
    </main>
  )
}
