"use client"

import { useMemo, useRef, useState } from "react"
import { selectFrame } from "@/lib/chart/engine"
import type { ChartPoint, ChartFrame } from "@/lib/chart/engine"
import { cn } from "@/lib/utils"

const FRAMES: ChartFrame[] = ["1M", "6M", "1Y", "5Y", "MAX"]

/**
 * Engine-backed interactive stock chart with timeframe tabs. A single daily
 * series is sliced per frame by the shared `selectFrame` (same windowing /
 * reference / extremes / direction-color semantics as the iOS app), with hover
 * scrub and the Vercel palette. Colors by performance over the selected window
 * (dotted baseline = window-start).
 */
export default function EngineChart({
  points,
  livePrice = null,
}: {
  points: ChartPoint[]
  livePrice?: number | null
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [frame, setFrame] = useState<ChartFrame>("1Y")

  const W = 800
  const H = 168

  // Extend the series to the live price "as of right now" so the line reaches
  // the current quote, not just the last daily close.
  const series = useMemo<ChartPoint[]>(() => {
    if (livePrice == null || points.length === 0) return points
    const last = points[points.length - 1]
    if (livePrice === last.v) return points
    return [...points, { t: Date.now(), v: livePrice }]
  }, [points, livePrice])

  const sel = useMemo(
    () =>
      selectFrame({
        points: series,
        frame,
        now: Date.now(),
        reference: null,
        inception: series.length ? series[0].t : null,
      }),
    [series, frame]
  )

  const pts = sel.points

  const geometry = useMemo(() => {
    if (pts.length < 2) return null
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
    const x = (t: number) => ((t - sel.window.start) / spanT) * W
    const y = (v: number) => H - ((v - minV) / spanV) * H
    const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ")
    const area = `${line} L${x(pts[pts.length - 1].t).toFixed(1)} ${H} L${x(pts[0].t).toFixed(1)} ${H} Z`
    return { x, y, line, area }
  }, [pts, sel.reference, sel.window.start, sel.window.end])

  const color = sel.isUp ? "#2ed3a0" : "#ff4d4d"

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg || !geometry) return
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(geometry.x(pts[i].t) - px)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    setHover(best)
  }

  const hv = hover != null && hover < pts.length ? pts[hover] : null
  const fmtDate = (t: number) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return (
    <div>
      {/* Timeframe tabs */}
      <div className="mb-3 inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {FRAMES.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFrame(f)
              setHover(null)
            }}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              f === frame ? "bg-white text-black" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative w-full">
        {hv && geometry && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs"
            style={{ left: `${(geometry.x(hv.t) / W) * 100}%` }}
          >
            <span className="font-mono text-foreground">${hv.v.toFixed(2)}</span>
            <span className="ml-2 text-muted-foreground">{fmtDate(hv.t)}</span>
          </div>
        )}

        {geometry ? (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height={H}
            preserveAspectRatio="none"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
            className="mt-7 touch-none"
            role="img"
            aria-label="Price chart"
          >
            <defs>
              <linearGradient id="engine-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {sel.reference != null && (
              <line
                x1="0"
                y1={geometry.y(sel.reference)}
                x2={W}
                y2={geometry.y(sel.reference)}
                stroke="#fff"
                strokeOpacity="0.2"
                strokeWidth="1"
                strokeDasharray="2 4"
                vectorEffect="non-scaling-stroke"
              />
            )}

            <path d={geometry.area} fill="url(#engine-fill)" />
            <path
              d={geometry.line}
              fill="none"
              stroke={color}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {hv && (
              <>
                <line
                  x1={geometry.x(hv.t)}
                  y1="0"
                  x2={geometry.x(hv.t)}
                  y2={H}
                  stroke="#fff"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={geometry.x(hv.t)} cy={geometry.y(hv.v)} r="4" fill={color} />
              </>
            )}
          </svg>
        ) : (
          <div className="mt-7 flex h-[168px] items-center justify-center text-sm text-muted-foreground">
            No data for this range
          </div>
        )}
      </div>
    </div>
  )
}
