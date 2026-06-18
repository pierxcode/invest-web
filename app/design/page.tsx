"use client"

import * as React from "react"
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
  Label,
  Separator,
  Skeleton,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Avatar,
} from "@/components/ui"

function Section({ id, title, kicker, children }: { id: string; title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-14">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">{kicker}</p>
      <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Swatch({ name, hex, className }: { name: string; hex: string; className?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-full rounded-lg border border-border ${className ?? ""}`} style={{ background: hex }} />
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-foreground">{name}</span>
        <span className="font-mono text-xs text-muted-foreground">{hex}</span>
      </div>
    </div>
  )
}

export default function DesignSystemPage() {
  const [notify, setNotify] = React.useState(true)
  const [dense, setDense] = React.useState(false)

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      {/* Nav — Vercel-style */}
      <header className="sticky top-0 z-20 border-b border-border bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <svg width="20" height="18" viewBox="0 0 24 22" fill="none" aria-hidden>
              <path d="M12 0l12 22H0L12 0z" fill="#fff" />
            </svg>
            <span className="text-sm font-semibold">Invest</span>
            <Badge variant="secondary" className="ml-1">Design</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">Docs</Button>
            <Button variant="outline" size="sm">Log In</Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="py-20">
          <Badge variant="outline" className="mb-5">Vercel · Apple · shadcn</Badge>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight text-white">
            The Invest design system.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            One component kit for the web app — pure black, white, and zinc, with functional accent colors.
            Built to carry the same craft as the native iOS app.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg">Get started</Button>
            <Button variant="outline" size="lg">
              View components
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>

          {/* Accent lines, echoing Vercel's framework graphic */}
          <div className="mt-12 overflow-hidden rounded-xl border border-border bg-card p-6">
            <svg viewBox="0 0 600 120" className="w-full" aria-hidden>
              {[
                { y: 20, c: "#0070f3" },
                { y: 45, c: "#ff4d4d" },
                { y: 70, c: "#f5a623" },
                { y: 95, c: "#2ed3a0" },
              ].map((l, i) => (
                <g key={i}>
                  <line x1="0" y1={l.y} x2="240" y2={l.y} stroke={l.c} strokeWidth="2" strokeLinecap="round" />
                  <line x1="240" y1={l.y} x2="360" y2={l.y} stroke={l.c} strokeWidth="2" strokeDasharray="2 6" opacity="0.5" />
                  <line x1="360" y1={l.y} x2="600" y2={l.y} stroke={l.c} strokeWidth="2" strokeLinecap="round" />
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Colors */}
        <Section id="colors" kicker="Foundations" title="Color">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Swatch name="Background" hex="#000000" />
            <Swatch name="Card" hex="#0a0a0a" />
            <Swatch name="Border" hex="#1f1f1f" />
            <Swatch name="Foreground" hex="#ededed" />
            <Swatch name="Muted" hex="#a1a1a1" />
            <Swatch name="Blue (accent)" hex="#0070f3" />
            <Swatch name="Success" hex="#2ed3a0" />
            <Swatch name="Warning" hex="#f5a623" />
            <Swatch name="Danger" hex="#ff4d4d" />
            <Swatch name="Cyan" hex="#50e3c2" />
            <Swatch name="Purple" hex="#7928ca" />
            <Swatch name="Pink" hex="#ff0080" />
          </div>
        </Section>

        {/* Typography */}
        <Section id="type" kicker="Foundations" title="Typography">
          <div className="space-y-4">
            <p className="text-5xl font-semibold tracking-tight text-white">Display 5xl</p>
            <p className="text-3xl font-semibold tracking-tight text-white">Heading 3xl</p>
            <p className="text-xl font-medium text-foreground">Subtitle xl</p>
            <p className="max-w-2xl text-base text-foreground">
              Body — the quick brown fox jumps over the lazy dog. Calm, legible, high-contrast text on a true-black canvas.
            </p>
            <p className="text-sm text-muted-foreground">Muted small — secondary and helper copy.</p>
            <p className="font-mono text-sm text-foreground">Mono — AAPL · 392.41 · +1.24%</p>
          </div>
        </Section>

        {/* Buttons */}
        <Section id="buttons" kicker="Components" title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="add">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Badges */}
        <Section id="badges" kicker="Components" title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">+1.24%</Badge>
            <Badge variant="warning">After-hours</Badge>
            <Badge variant="danger">−0.86%</Badge>
          </div>
        </Section>

        {/* Inputs */}
        <Section id="inputs" kicker="Components" title="Inputs">
          <div className="grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ticker">Search ticker</Label>
              <Input id="ticker" placeholder="AAPL, Apple, Micron…" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="1000" />
            </div>
            <div className="flex gap-2">
              <Input placeholder="you@example.com" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </Section>

        {/* Cards */}
        <Section id="cards" kicker="Components" title="Cards">
          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Apple Inc.</CardTitle>
                <CardDescription>AAPL · NASDAQ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold tracking-tight text-white">$392.41</span>
                  <Badge variant="success">+1.24%</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm">Buy</Button>
                <Button size="sm" variant="outline">Sell</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Total value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <span className="text-3xl font-semibold tracking-tight text-white">$1,024,318.07</span>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Tabs */}
        <Section id="tabs" kicker="Components" title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground">Price, chart, and key stats live here.</p>
            </TabsContent>
            <TabsContent value="financials">
              <p className="text-sm text-muted-foreground">Revenue, EPS, and margins.</p>
            </TabsContent>
            <TabsContent value="news">
              <p className="text-sm text-muted-foreground">Latest headlines for this symbol.</p>
            </TabsContent>
          </Tabs>
        </Section>

        {/* Toggles + Alerts + Avatar */}
        <Section id="misc" kicker="Components" title="Toggles, alerts, avatars">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <Label>Price alerts</Label>
                <Switch checked={notify} onCheckedChange={setNotify} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <Label>Dense layout</Label>
                <Switch checked={dense} onCheckedChange={setDense} />
              </div>
              <div className="flex items-center gap-3">
                <Avatar initials="PS" />
                <Avatar initials="AI" className="bg-accent text-white" />
                <Avatar initials="MU" />
                <Separator orientation="vertical" className="mx-1 h-8" />
                <span className="text-sm text-muted-foreground">Avatars</span>
              </div>
            </div>
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>Markets are closed. Prices shown are at last close.</AlertDescription>
              </Alert>
              <Alert variant="danger">
                <AlertTitle>Order failed</AlertTitle>
                <AlertDescription>Insufficient virtual cash for this trade.</AlertDescription>
              </Alert>
            </div>
          </div>
        </Section>

        <footer className="border-t border-border py-10 text-sm text-muted-foreground">
          Invest design system — {new Date().getFullYear()}. Black · white · zinc, Vercel blue accent.
        </footer>
      </div>
    </main>
  )
}
