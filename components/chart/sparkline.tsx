import type { ChartPoint } from "@/lib/chart/engine"

/** Tiny inline SVG sparkline. Neutral by default; green/red when `up` is set. */
export function Sparkline({
  points,
  up,
  width = 120,
  height = 36,
  className,
}: {
  points: ChartPoint[]
  up?: boolean
  width?: number
  height?: number
  className?: string
}) {
  if (points.length < 2) {
    return <svg width={width} height={height} className={className} aria-hidden />
  }

  const ts = points.map((p) => p.t)
  const vs = points.map((p) => p.v)
  const minT = Math.min(...ts)
  const maxT = Math.max(...ts)
  const minV = Math.min(...vs)
  const maxV = Math.max(...vs)
  const spanT = Math.max(maxT - minT, 1)
  const spanV = Math.max(maxV - minV, 1e-9)

  const x = (t: number) => ((t - minT) / spanT) * width
  const y = (v: number) => height - ((v - minV) / spanV) * height
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(2)} ${y(p.v).toFixed(2)}`).join(" ")

  const color = up === undefined ? "#ededed" : up ? "#2ed3a0" : "#ff4d4d"

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={className} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
