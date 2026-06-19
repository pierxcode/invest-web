import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InvestLogo } from "@/components/logo"

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-black/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <InvestLogo size={20} className="text-foreground" />
          <span className="text-sm font-semibold text-foreground">Invest</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/market" className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
            Market
          </Link>
          <Link href="/design" className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
            Design
          </Link>
          <a
            href="https://apps.apple.com/us/app/invest-stock-simulator/id6761500263"
            className="ml-2"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm">Get the app</Button>
          </a>
        </nav>
      </div>
    </header>
  )
}
