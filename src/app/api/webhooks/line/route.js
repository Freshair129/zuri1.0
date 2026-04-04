import { NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  upsertLineCustomer,
  upsertConversation,
  appendMessage,
} from '@/lib/repositories/conversationRepo'
import { triggerEvent } from '@/lib/pusher'
import { getRedis } from '@/lib/redis'

/**
 * LINE OA Webhook
 * NFR1: respond 200 immediately — process async (< 200ms)
 * G-WH-02: upsert pattern
 */
export async function POST(req) {
  const rawBody  = await req.text()
  const signature = req.headers.get('x-line-signature')

  // Verify HMAC-SHA256 signature
  const hash = crypto
    .createHmac('SHA256', process.env.LINE_CHANNEL_SECRET ?? '')
    .update(rawBody)
    .digest('base64')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let parsed
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ status: 'ok' })
  }

  // Kick off async — do NOT await (NFR1: < 200ms)
  processWebhook(parsed.events ?? []).catch((err) =>
    console.error('[webhook/line]', err)
  )

  return NextResponse.json({ status: 'ok' })
}

// ─── Async Processing ─────────────────────────────────────────────────────────

async function processWebhook(events) {
  const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? '10000000-0000-0000-0000-000000000001'
  const tenantId = DEFAULT_TENANT_ID

  for (const event of events) {
    // Only handle text messages for now
    if (event.type !== 'message' || event.message?.type !== 'text') continue

    const lineUserId  = event.source?.userId
    const text        = event.message?.text ?? null
    const messageId   = event.message?.id

    if (!lineUserId) continue

    try {
      // 1. Upsert customer (G-WH-02: upsert / findFirst+create for LINE)
      const customer = await upsertLineCustomer(tenantId, {
        lineUserId,
        displayName: null,  // displayName requires separate Profile API call
      })

      // 2. Upsert conversation — thread key is lineUserId
      const conversationId = `line-${lineUserId}`
      const conversation = await upsertConversation(tenantId, conversationId, {
        channel:       'line',
        participantId: lineUserId,
        customerId:    customer.id,
        status:        'open',
      })

      // 3. Append inbound message
      const saved = await appendMessage({
        conversationId:    conversation.id,
        message:           text,
        direction:         'inbound',
        externalMessageId: messageId ?? undefined,
      })

      // 4. Pusher real-time
      await triggerEvent(`tenant-${tenantId}`, 'new-message', {
        conversationId: conversation.id,
        message: {
          id:        saved.id,
          sender:    'customer',
          content:   saved.content,
          createdAt: saved.createdAt,
        },
      })

      // 5. Bust inbox list cache
      await getRedis().incr(`inbox:${tenantId}:version`)
    } catch (err) {
      console.error('[webhook/line] processEvent error', err)
    }
  }
}
