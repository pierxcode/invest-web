import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PushPayload {
  userId?: string          // target a specific user
  userIds?: string[]       // or multiple users
  title: string
  body: string
  data?: Record<string, string>
  score?: number           // NotificationScore — enforces prioritizer on the backend
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// ─── APNs JWT ─────────────────────────────────────────────────────────────────

let cachedToken: { value: string; expires: number } | null = null

function apnsJWT(): string {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.value

  const keyId    = process.env.APNS_KEY_ID!
  const teamId   = process.env.APNS_TEAM_ID!
  const key      = process.env.APNS_PRIVATE_KEY!.replace(/\\n/g, '\n')

  const token = jwt.sign({ iss: teamId, iat: Math.floor(Date.now() / 1000) }, key, {
    algorithm: 'ES256',
    keyid: keyId,
  })

  // APNs tokens are valid for 60 minutes; refresh after 55 to be safe
  cachedToken = { value: token, expires: Date.now() + 55 * 60 * 1000 }
  return token
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await req.json() as PushPayload
  if (!payload.title || !payload.body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 })
  }

  const db = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Resolve device tokens
  let query = db.from('device_tokens').select('token, user_id')
  if (payload.userId) {
    query = query.eq('user_id', payload.userId)
  } else if (payload.userIds?.length) {
    query = query.in('user_id', payload.userIds)
  }

  const { data: tokenRows } = await query
  if (!tokenRows?.length) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no tokens found' })
  }

  const bundleId = process.env.APNS_BUNDLE_ID ?? 'com.pier.Simon'
  const apnsHost = process.env.APNS_SANDBOX === 'true'
    ? 'api.sandbox.push.apple.com'
    : 'api.push.apple.com'

  const stats = { sent: 0, failed: 0 }
  const jwtToken = apnsJWT()

  for (const row of tokenRows) {
    try {
      const apnsPayload = {
        aps: {
          alert: { title: payload.title, body: payload.body },
          sound: 'default',
          'mutable-content': 1,
        },
        ...payload.data,
      }

      const res = await fetch(`https://${apnsHost}/3/device/${row.token}`, {
        method: 'POST',
        headers: {
          'authorization': `bearer ${jwtToken}`,
          'apns-topic': bundleId,
          'apns-push-type': 'alert',
          'content-type': 'application/json',
        },
        body: JSON.stringify(apnsPayload),
      })

      if (res.ok || res.status === 200) {
        stats.sent++
      } else {
        const err = await res.text()
        console.error(`[push] APNs ${res.status} for ${row.user_id}: ${err}`)
        // Remove stale tokens
        if (res.status === 410) {
          await db.from('device_tokens').delete().eq('token', row.token)
        }
        stats.failed++
      }
    } catch (err) {
      console.error('[push] network error:', err)
      stats.failed++
    }
  }

  return NextResponse.json({ ok: true, ...stats })
}
