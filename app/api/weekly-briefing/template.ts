import type { UserData, MarketContent, Position } from './route'

const GREEN = '#22c55e'
const BG = '#f8f9fa'
const CARD = '#ffffff'
const TEXT = '#111827'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const APP_URL = 'https://stocksimulator.io'

export function renderBriefingEmail(user: UserData, market: MarketContent): string {
  const totalReturn = user.totalValue - 1_000_000
  const totalReturnPct = (totalReturn / 1_000_000) * 100
  const isUp = totalReturn >= 0

  const winner = bestPosition(user.positions)
  const loser = worstPosition(user.positions)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your weekly brief — ${market.weekRange}</title>
  <style>
    @media only screen and (max-width:600px){
      .wrapper{width:100%!important;padding:0 8px!important;}
      .card{border-radius:12px!important;}
      .hide-mobile{display:none!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">
        <table class="wrapper" width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

          ${header(market.weekRange)}
          ${spacer(16)}
          ${portfolioSection(user, totalReturn, totalReturnPct, isUp, winner, loser)}
          ${spacer(12)}
          ${marketSection(market)}
          ${spacer(12)}
          ${learnSection(market.lesson)}
          ${spacer(20)}
          ${ctaButton('/leaderboard')}
          ${spacer(24)}
          ${footer(user.email)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Sections ────────────────────────────────────────────────────────────────

function header(range: string): string {
  return `<tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="padding:20px 24px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <span style="display:inline-block;width:10px;height:10px;background:${GREEN};border-radius:50%;margin-right:6px;vertical-align:middle;"></span>
                <span style="font-size:18px;font-weight:700;color:${TEXT};vertical-align:middle;">Invest</span>
              </td>
              <td align="right">
                <span style="font-size:12px;color:${MUTED};">Week of ${range}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>`
}

function portfolioSection(
  user: UserData,
  totalReturn: number,
  totalReturnPct: number,
  isUp: boolean,
  winner: Position | null,
  loser: Position | null
): string {
  const valueStr = formatCurrency(user.totalValue)
  const returnStr = `${isUp ? '+' : ''}${formatCurrency(totalReturn)} (${isUp ? '+' : ''}${totalReturnPct.toFixed(2)}%)`
  const returnColor = isUp ? GREEN : '#ef4444'

  return card(`
    ${sectionLabel('YOUR PORTFOLIO')}
    <tr><td style="padding:0 24px 20px;">

      <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:${TEXT};letter-spacing:-0.5px;">${valueStr}</p>
      <p style="margin:0 0 16px;font-size:14px;color:${returnColor};font-weight:600;">
        ${isUp ? '▲' : '▼'} ${returnStr} all time
      </p>

      ${winner ? `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;">
        <tr>
          <td style="padding:12px 14px;background:#f0fdf4;border-radius:10px;border-left:3px solid ${GREEN};">
            <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:${GREEN};text-transform:uppercase;letter-spacing:0.5px;">🏆 Best this week</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:${TEXT};">${winner.name} (${winner.symbol})</p>
            <p style="margin:0;font-size:13px;color:${GREEN};">
              ${positionReturn(winner) >= 0 ? '+' : ''}${positionReturn(winner).toFixed(2)}% since purchase · ${formatCurrency(positionPnl(winner))}
            </p>
          </td>
        </tr>
      </table>` : ''}

      ${loser && loser.symbol !== winner?.symbol ? `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding:12px 14px;background:#fafafa;border-radius:10px;border-left:3px solid #e5e7eb;">
            <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.5px;">📖 Lesson from the week</p>
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${TEXT};">${loser.name} (${loser.symbol})</p>
            <p style="margin:0;font-size:13px;color:${MUTED};">
              ${positionReturn(loser).toFixed(2)}% · Every loss is data. Ask: was this the thesis changing, or just noise?
            </p>
          </td>
        </tr>
      </table>` : ''}

    </td></tr>
  `)
}

function marketSection(market: MarketContent): string {
  const mover = market.biggestMover
  return card(`
    ${sectionLabel('THIS WEEK IN MARKETS')}
    <tr><td style="padding:0 24px 20px;">
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#374151;">${market.weeklyStory}</p>
      ${mover ? `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding:10px 14px;background:#f9fafb;border-radius:8px;">
            <span style="font-size:12px;color:${MUTED};">📊 Biggest mover</span>
            <span style="font-size:14px;font-weight:600;color:${TEXT};margin-left:8px;">${mover.symbol}</span>
            <span style="font-size:13px;font-weight:600;color:${mover.changePct >= 0 ? GREEN : '#ef4444'};margin-left:6px;">
              ${mover.changePct >= 0 ? '+' : ''}${mover.changePct.toFixed(2)}%
            </span>
          </td>
        </tr>
      </table>` : ''}
    </td></tr>
  `)
}

function learnSection(lesson: string): string {
  return card(`
    ${sectionLabel('THIS WEEK\'S LESSON')}
    <tr><td style="padding:0 24px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding:14px 16px;background:#f0fdf4;border-radius:10px;">
            <p style="margin:0;font-size:14px;line-height:1.6;color:#166534;">${lesson}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  `)
}

function ctaButton(path = '/'): string {
  return `<tr><td align="center" style="padding:0 16px;">
    <a href="${APP_URL}${path}" style="display:inline-block;padding:14px 36px;background:${GREEN};color:#000;font-size:15px;font-weight:700;border-radius:100px;text-decoration:none;letter-spacing:0.1px;">
      Open Invest →
    </a>
  </td></tr>`
}

function footer(email: string): string {
  return `<tr><td align="center" style="padding:24px 16px 8px;">
    <p style="margin:0 0 4px;font-size:11px;color:${MUTED};">
      You're getting this because you have an Invest account (${email}).
    </p>
    <p style="margin:0;font-size:11px;color:${MUTED};">
      Invest is a stock simulator — no real money is ever involved.
      <a href="${APP_URL}/support" style="color:${MUTED};">Unsubscribe</a>
    </p>
  </td></tr>`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function card(innerRows: string): string {
  return `<tr><td>
    <table class="card" width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:${CARD};border-radius:16px;border:1px solid ${BORDER};overflow:hidden;">
      ${innerRows}
    </table>
  </td></tr>`
}

function sectionLabel(label: string): string {
  return `<tr><td style="padding:16px 24px 10px;">
    <p style="margin:0;font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.8px;">${label}</p>
  </td></tr>`
}

function spacer(h: number): string {
  return `<tr><td height="${h}" style="font-size:0;line-height:0;">&nbsp;</td></tr>`
}

function formatCurrency(v: number): string {
  const abs = Math.abs(v)
  const prefix = v < 0 ? '-€' : '€'
  if (abs >= 1_000_000) return `${prefix}${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${prefix}${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  return `${prefix}${abs.toFixed(2)}`
}

function positionReturn(p: Position): number {
  if (p.averageCost === 0) return 0
  return ((p.currentPrice - p.averageCost) / p.averageCost) * 100
}

function positionPnl(p: Position): number {
  return (p.currentPrice - p.averageCost) * p.quantity
}

function bestPosition(positions: Position[]): Position | null {
  if (positions.length === 0) return null
  return positions.reduce((best, p) =>
    positionReturn(p) > positionReturn(best) ? p : best
  )
}

function worstPosition(positions: Position[]): Position | null {
  if (positions.length === 0) return null
  return positions.reduce((worst, p) =>
    positionReturn(p) < positionReturn(worst) ? p : worst
  )
}
