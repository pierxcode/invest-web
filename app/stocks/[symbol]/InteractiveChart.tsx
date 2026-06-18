'use client'

import { useState, useRef, useCallback } from 'react'

interface Candle { c: number; t: number }

function fmtPrice(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function InteractiveChart({ candles, isUp }: { candles: Candle[]; isUp: boolean }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  if (candles.length < 2) return null

  const prices = candles.map((c) => c.c)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const W = 800; const H = 200; const PAD = 6

  const pts: [number, number][] = prices.map((v, i) => [
    PAD + (i / (prices.length - 1)) * (W - PAD * 2),
    H - PAD - ((v - min) / range) * (H - PAD * 2),
  ])

  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1][0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z`
  const color = isUp ? '#34d399' : '#f87171'

  const updateHover = useCallback((clientX: number, rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * W
    const idx = Math.round(((x - PAD) / (W - PAD * 2)) * (prices.length - 1))
    setHoverIdx(Math.max(0, Math.min(prices.length - 1, idx)))
  }, [prices.length])

  const hoverX = hoverIdx != null ? pts[hoverIdx][0] : null
  const hoverY = hoverIdx != null ? pts[hoverIdx][1] : null
  const hoverPrice = hoverIdx != null ? prices[hoverIdx] : null
  const hoverDate = hoverIdx != null
    ? new Date(candles[hoverIdx].t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null
  const hoverChange = hoverIdx != null && hoverIdx > 0
    ? ((prices[hoverIdx] - prices[0]) / prices[0]) * 100
    : null

  return (
    <div style={{ position: 'relative', margin: '0 -1px' }}>
      {/* Tooltip */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(15,15,15,0.9)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
        padding: '6px 12px', zIndex: 10, pointerEvents: 'none',
        opacity: hoverPrice != null ? 1 : 0, transition: 'opacity 0.1s',
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          {hoverPrice != null ? fmtPrice(hoverPrice) : ''}
        </span>
        {hoverChange != null && (
          <span style={{ fontSize: 12, fontWeight: 600, color: hoverChange >= 0 ? '#34d399' : '#f87171' }}>
            {hoverChange >= 0 ? '+' : ''}{hoverChange.toFixed(2)}%
          </span>
        )}
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{hoverDate}</span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: 200, display: 'block', cursor: 'crosshair' }}
        onMouseMove={(e) => { const r = svgRef.current?.getBoundingClientRect(); if (r) updateHover(e.clientX, r) }}
        onMouseLeave={() => setHoverIdx(null)}
        onTouchMove={(e) => { e.preventDefault(); const r = svgRef.current?.getBoundingClientRect(); if (r) updateHover(e.touches[0].clientX, r) }}
        onTouchEnd={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chart-fill)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {hoverX != null && hoverY != null && (
          <>
            <line x1={hoverX} y1={PAD} x2={hoverX} y2={H - PAD}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx={hoverX} cy={hoverY} r="8" fill={color} fillOpacity="0.18" />
            <circle cx={hoverX} cy={hoverY} r="4" fill={color} />
          </>
        )}
      </svg>
    </div>
  )
}
