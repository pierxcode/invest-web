import { NextResponse } from 'next/server'

// Apple App Site Association — tells iOS that stocksimulator.io links open the Invest app.
// The appID format is: <TeamID>.<BundleID>
// TeamID: Apple Developer → Membership → Team ID (10 chars)
// BundleID: com.pierstein.simon

export async function GET() {
  const aasa = {
    applinks: {
      details: [
        {
          appIDs: ['XXXXXXXXXX.com.pierstein.simon'],  // replace XXXXXXXXXX with your Team ID
          components: [
            { '/': '/',            comment: 'home → Portfolio tab' },
            { '/': '/leaderboard', comment: 'leaderboard deep link' },
            { '/': '/stock/*',     comment: 'stock detail deep link' },
            { '/': '/learn',       comment: 'education tab' },
          ],
        },
      ],
    },
  }

  return new NextResponse(JSON.stringify(aasa), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
