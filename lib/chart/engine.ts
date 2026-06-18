// Web port of the iOS chart engine (Simon/Charting/ChartEngine.swift).
// Pure and deterministic: same inputs → same ChartSelection. Mirrors the Swift
// `selectFrame` so the web app draws charts with identical semantics
// (windowing, clipping, reference baseline, extremes, state machine).

export type ChartFrame = "1D" | "1W" | "1M" | "6M" | "1Y" | "5Y" | "MAX"
export type ChartState = "empty" | "pending" | "partial" | "ready" | "stale"
export type ChartColorMode = "neutral" | "directional"
export type ChartFetchStatus = "ok" | "pending" | "stale"

/** A single time-series sample. `t` is epoch milliseconds, `v` is price/value. */
export interface ChartPoint {
  t: number
  v: number
}

export interface ChartWindow {
  start: number
  end: number
}

export interface ChartExtremes {
  highT: number
  highV: number
  lowT: number
  lowV: number
}

export interface ChartSelection {
  frame: ChartFrame
  window: ChartWindow
  points: ChartPoint[]
  reference: number | null
  extremes: ChartExtremes | null
  state: ChartState
  firstDataT: number | null
  lastDataT: number | null
  /** Most recent clipped value at/above the reference (drives directional color). */
  isUp: boolean | null
}

const DAY = 86_400_000

const lookbackMs: Record<ChartFrame, number | null> = {
  "1D": null,
  "1W": 7 * DAY,
  "1M": 30 * DAY,
  "6M": 180 * DAY,
  "1Y": 365 * DAY,
  "5Y": 1825 * DAY,
  MAX: null,
}

export interface SelectFrameOptions {
  points: ChartPoint[]
  frame: ChartFrame
  now: number
  inception?: number | null
  reference?: number | null
  sessionWindow?: ChartWindow | null
  domain?: ChartWindow | null
  status?: ChartFetchStatus
}

/** Resolve a full-resolution series into a renderable selection for `frame`. */
export function selectFrame(opts: SelectFrameOptions): ChartSelection {
  const { points, frame, now } = opts
  const status: ChartFetchStatus = opts.status ?? "ok"

  const sorted = [...points].sort((a, b) => a.t - b.t)
  const firstData = sorted.length ? sorted[0].t : null
  const lastData = sorted.length ? sorted[sorted.length - 1].t : null

  // An explicit domain supersedes the frame-derived window (PRD §6.7).
  const window =
    opts.domain ?? windowFor(frame, now, opts.inception ?? null, opts.sessionWindow ?? null, firstData)

  // Clip to [max(window.start, firstData), window.end]; the leading gap is ghosted, never stretched.
  const clipStart = Math.max(window.start, firstData ?? window.start)
  const clipped = sorted.filter((p) => p.t >= clipStart && p.t <= window.end)

  const reference = opts.reference ?? (clipped.length ? clipped[0].v : null)
  const extremes = extremesOf(clipped)
  const state = stateFor(status, firstData, window)

  const last = clipped.length ? clipped[clipped.length - 1].v : null
  const isUp = reference != null && last != null ? last >= reference : null

  return {
    frame,
    window,
    points: clipped,
    reference,
    extremes,
    state,
    firstDataT: firstData,
    lastDataT: lastData,
    isUp,
  }
}

function windowFor(
  frame: ChartFrame,
  now: number,
  inception: number | null,
  sessionWindow: ChartWindow | null,
  firstData: number | null
): ChartWindow {
  if (frame === "1D") return sessionWindow ?? { start: now - DAY, end: now }
  if (frame === "MAX") {
    const start = inception ?? firstData ?? now
    return { start: Math.min(start, now), end: now }
  }
  const len = lookbackMs[frame] ?? DAY
  return { start: now - len, end: now }
}

function extremesOf(pts: ChartPoint[]): ChartExtremes | null {
  if (!pts.length) return null
  let hi = pts[0]
  let lo = pts[0]
  for (const p of pts) {
    if (p.v > hi.v) hi = p
    if (p.v < lo.v) lo = p
  }
  return { highT: hi.t, highV: hi.v, lowT: lo.t, lowV: lo.v }
}

function stateFor(status: ChartFetchStatus, firstData: number | null, window: ChartWindow): ChartState {
  if (status === "pending") return "pending"
  if (status === "stale") return "stale"
  if (firstData == null) return "empty"
  // READY when the series began at/before the window start (resolution-independent).
  const tol = Math.max((window.end - window.start) * 0.02, 60_000)
  return firstData <= window.start + tol ? "ready" : "partial"
}
