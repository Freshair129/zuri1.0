import { NextResponse } from 'next/server'
import { verifyQStashSignature } from '@/lib/qstash'
import { getPrisma } from '@/lib/db'

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

  // Load tenant tokens from DB (multi-tenant path)
  // TODO: once tenant.fbPageToken / tenant.lineChannelToken columns are added (M5)
  // const tenant = await getPrisma().tenant.findUnique({ where: { id: tenantId } })
  // const fbToken   = tenant?.fbPageToken  ?? process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  // const lineToken = tenant?.lineChannelToken ?? process.env.LINE_CHANNEL_ACCESS_TOKEN
  const fbToken   = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

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
