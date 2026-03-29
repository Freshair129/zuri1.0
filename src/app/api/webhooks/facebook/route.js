import { NextResponse } from 'next/server'

/**
 * Facebook Messenger Webhook
 * NFR1: ตอบ < 200ms เสมอ — ส่ง 200 ทันที → process async
 */

// GET: Webhook verification (hub.challenge)
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: Receive messages — respond 200 immediately, process async
export async function POST(req) {
  const body = await req.json()

  // Respond 200 immediately (NFR1: < 200ms)
  // Process async via QStash or direct
  try {
    // TODO: Process webhook entries
    // for (const entry of body.entry) {
    //   for (const event of entry.messaging) {
    //     await processMessage(event)
    //   }
    // }
  } catch (error) {
    console.error('[webhook/facebook]', error)
  }

  return NextResponse.json({ status: 'ok' })
}
