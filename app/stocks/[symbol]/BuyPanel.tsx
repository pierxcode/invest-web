'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

function fmtPrice(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BuyPanel({
  symbol, price, isUp, dayChangePct,
}: {
  symbol: string; price: number; isUp: boolean; dayChangePct?: number
}) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('1')
  const numShares = Math.max(0, parseFloat(shares) || 0)
  const total = numShares * price
  const accentColor = tab === 'buy' ? '#34d399' : '#f87171'

  return (
    <div style={{
      position: 'sticky', top: 24,
      borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
      background: '#0a0a0a', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Price header */}
      <div>
        <p style={{ fontSize: 11, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px', fontWeight: 600 }}>
          {symbol}
        </p>
        <p style={{ fontSize: 30, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
          {fmtPrice(price)}
        </p>
        {dayChangePct != null && (
          <p style={{ fontSize: 12, fontWeight: 600, color: isUp ? '#34d399' : '#f87171', margin: '4px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {isUp ? '+' : ''}{dayChangePct.toFixed(2)}% today
          </p>
        )}
      </div>

      {/* Buy / Sell tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3 }}>
        {(['buy', 'sell'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, textTransform: 'capitalize',
            background: tab === t ? (t === 'buy' ? '#34d399' : '#f87171') : 'transparent',
            color: tab === t ? '#000' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Shares input */}
      <div>
        <label style={{ fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
          Shares
        </label>
        <input
          type="number" min="0" step="1" value={shares}
          onChange={(e) => setShares(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10, padding: '11px 14px',
            fontSize: 15, fontWeight: 600, color: '#fff', outline: 'none',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
      </div>

      {/* Order summary */}
      <div style={{ borderRadius: 10, background: 'rgba(255,255,255,0.03)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Market price', value: fmtPrice(price) },
          { label: 'Shares', value: numShares.toString() },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#52525b' }}>{label}</span>
            <span style={{ color: '#a1a1aa', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
          </div>
        ))}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: '#fff' }}>Est. total</span>
          <span style={{ color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{fmtPrice(total)}</span>
        </div>
      </div>

      {/* CTA */}
      <a
        href="https://apps.apple.com/us/app/invest-stock-simulator/id6761500263"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '13px 0', borderRadius: 12, background: accentColor,
          color: '#000', fontSize: 14, fontWeight: 800, textDecoration: 'none',
          transition: 'opacity 0.15s',
        }}
      >
        {tab === 'buy' ? 'Buy' : 'Sell'} with €1M virtual cash
        <ArrowUpRight size={14} strokeWidth={2.5} />
      </a>

      <p style={{ fontSize: 11, color: '#3f3f46', textAlign: 'center', margin: 0 }}>
        Free simulator · No real money
      </p>
    </div>
  )
}
