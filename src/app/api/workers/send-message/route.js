import { NextResponse } from 'next/server'
import { verifyQStashSignature } from '@/lib/qstash'
import { getTenantTokens } from '@/lib/repositories/tenantRepo'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/workers/send-message
 * QStash worker — sends an outbound message via FB Messenger or LINE
 *
 * Payload: { tenantId, channel, participantId, message }
 *
 * Tokens are read per-tenant from DB (tenant.fbPageToken / tenant.lineChannelToken)
 * Falls back to env vars for single-tenant dev.
 */
export async function POST(req) {
  const { isValid, body } = await verifyQStashSignature(req)
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tenantId, channel, participantId, message } = JSON.parse(body)

  // Load tenant tokens from DB — falls back to env vars if not set per-tenant
  const { fbPageToken: fbToken, lineChannelToken: lineToken } = await getTenantTokens(tenantId)

  try {
    if (channel === 'facebook') {
      await sendFacebookMessage(fbToken, participantId, message)
    } else if (channel === 'line') {
      await sendLineMessage(lineToken, participantId, message)
    } else {
      console.error('[workers/send-message] Unknown channel:', channel)
    }
  } catch (err) {
    // throw → QStash retries (NFR3: >= 5 retries)
    console.error('[workers/send-message]', err)
    throw err
  }

  return NextResponse.json({ ok: true })
}

async function sendFacebookMessage(token, psid, text) {
  if (!token) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN not configured')
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient:      { id: psid },
        message:        { text },
        messaging_type: 'RESPONSE',
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`FB send failed: ${err}`)
  }
}

async function sendLineMessage(token, lineUserId, text) {
  if (!token) throw new Error('LINE_CHANNEL_ACCESS_TOKEN not configured')
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      to:       lineUserId,
      messages: [{ type: 'text', text }],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LINE send failed: ${err}`)
  }
}
