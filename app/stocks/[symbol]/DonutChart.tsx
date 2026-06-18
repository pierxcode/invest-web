'use client'

interface Candle { c: number; t: number }

function arc(cx: number, cy: number, r: number, ir: number, startDeg: number, endDeg: number) {
  const rad = (d: number) => ((d - 90) * Math.PI) / 180
  const large = endDeg - startDeg > 180 ? 1 : 0
  const x1o = cx + r * Math.cos(rad(startDeg)), y1o = cy + r * Math.sin(rad(startDeg))
  const x2o = cx + r * Math.cos(rad(endDeg)),   y2o = cy + r * Math.sin(rad(endDeg))
  const x1i = cx + ir * Math.cos(rad(endDeg)),  y1i = cy + ir * Math.sin(rad(endDeg))
  const x2i = cx + ir * Math.cos(rad(startDeg)), y2i = cy + ir * Math.sin(rad(startDeg))
  return `M${x1o} ${y1o} A${r} ${r} 0 ${large} 1 ${x2o} ${y2o} L${x1i} ${y1i} A${ir} ${ir} 0 ${large} 0 ${x2i} ${y2i} Z`
}

export default function DonutChart({ candles, symbol }: { candles: Candle[]; symbol: string }) {
  if (candles.length < 2) return null

  let upDays = 0
  for (let i = 1; i < candles.length; i++) {
    if (candles[i].c >= candles[i - 1].c) upDays++
  }
  const total = candles.length - 1
  const downDays = total - upDays
  const upPct = Math.round((upDays / total) * 100)
  const gap = 4

  const upEnd   = (upDays / total) * 360 - gap / 2
  const downStart = (upDays / total) * 360 + gap / 2

  return (
    <div style={{
      borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)',
      background: '#0a0a0a', padding: '20px 22px',
      display: 'flex', flexDirection: 'column',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
        30-Day Win Rate · {symbol}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
        <svg width={140} height={140} viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
          {/* Track */}
          <circle cx={70} cy={70} r={52} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={18} />
          {/* Green (up days) */}
          <path d={arc(70, 70, 61, 43, gap / 2, upEnd)} fill="#34d399" />
          {/* Red (down days) */}
          <path d={arc(70, 70, 61, 43, downStart, 360 - gap / 2)} fill="#f87171" />
          {/* Center */}
          <text x={70} y={64} textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700" fontFamily="system-ui, -apple-system">
            {upPct}%
          </text>
          <text x={70} y={80} textAnchor="middle" fill="#52525b" fontSize="9" fontWeight="600" fontFamily="system-ui, -apple-system" letterSpacing="1">
            WIN RATE
          </text>
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Up days', value: upDays, color: '#34d399' },
            { label: 'Down days', value: downDays, color: '#f87171' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, color, margin: 0, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {value} <span style={{ fontSize: 12, color: '#52525b', fontWeight: 500 }}>days</span>
              </p>
            </div>
          ))}
          <p style={{ fontSize: 10, color: '#27272a', margin: 0 }}>Last {total} sessions</p>
        </div>
      </div>
    </div>
  )
}
