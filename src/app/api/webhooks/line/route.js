import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * LINE OA Webhook
 * Verify: X-Line-Signature HMAC-SHA256
 */
export async function POST(req) {
  const body = await req.text()
  const signature = req.headers.get('x-line-signature')

  // Verify signature
  const hash = crypto
    .createHmac('SHA256', process.env.LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { events } = JSON.parse(body)

  try {
    // TODO: Process LINE events
    // for (const event of events) {
    //   await processLineEvent(event)
    // }
  } catch (error) {
    console.error('[webhook/line]', error)
  }

  return NextResponse.json({ status: 'ok' })
}
