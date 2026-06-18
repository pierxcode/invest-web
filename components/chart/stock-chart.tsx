import { selectFrame } from "@/lib/chart/engine"
import type { ChartPoint, ChartFrame, ChartColorMode } from "@/lib/chart/engine"

/**
 * Engine-backed stock chart (line + area + dotted reference + extreme labels),
 * rendered as static SVG so it works in server components. Hover scrub is added
 * as a client enhancement on the stock page.
 */
export function StockChart({
  points,
  frame,
  now = Date.now(),
  reference = null,
  width = 760,
  height = 300,
  colorMode = "directional",
}: {
  points: ChartPoint[]
  frame: ChartFrame
  now?: number
  reference?: number | null
  width?: number
  height?: number
  colorMode?: ChartColorMode
}) {
  const sel = selectFrame({
    points,
    frame,
    now,
    reference,
    domain: points.length ? { start: points[0].t, end: points[points.length - 1].t } : null,
  })

  const pts = sel.points
  if (pts.length < 2) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No data</div>
  }

  const vs = pts.map((p) => p.v)
  let minV = Math.min(...vs)
  let maxV = Math.max(...vs)
  if (sel.reference != null) {
    minV = Math.min(minV, sel.reference)
    maxV = Math.max(maxV, sel.reference)
  }
  const pad = Math.max((maxV - minV) * 0.06, 1e-9)
  minV -= pad
  maxV += pad
  const spanV = Math.max(maxV - minV, 1e-9)
  const spanT = Math.max(sel.window.end - sel.window.start, 1)

  const x = (t: number) => ((t - sel.window.start) / spanT) * width
  const y = (v: number) => height - ((v - minV) / spanV) * height

  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(2)} ${y(p.v).toFixed(2)}`).join(" ")
  const area = `${line} L${x(pts[pts.length - 1].t).toFixed(2)} ${height} L${x(pts[0].t).toFixed(2)} ${height} Z`

  const color = colorMode === "neutral" ? "#ededed" : sel.isUp ? "#2ed3a0" : "#ff4d4d"
  const ex = sel.extremes
  const gradientId = `fill-${color.replace("#", "")}`

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible" role="img" aria-label="Price chart">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {sel.reference != null && (
        <line x1="0" y1={y(sel.reference)} x2={width} y2={y(sel.reference)} stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="2 4" />
      )}

      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {ex && (
        <>
          <text x={x(ex.highT)} y={y(ex.highV) - 6} fill="#a1a1a1" fontSize="11" textAnchor="middle">
            {ex.highV.toFixed(2)}
          </text>
          <text x={x(ex.lowT)} y={y(ex.lowV) + 14} fill="#a1a1a1" fontSize="11" textAnchor="middle">
            {ex.lowV.toFixed(2)}
          </text>
        </>
      )}
    </svg>
  )
}
