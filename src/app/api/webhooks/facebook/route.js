import { NextResponse } from 'next/server'
import {
  upsertFacebookCustomer,
  upsertConversation,
  appendMessage,
} from '@/lib/repositories/conversationRepo'
import { triggerEvent } from '@/lib/pusher'
import { getRedis } from '@/lib/redis'

/**
 * Facebook Messenger Webhook
 * NFR1: respond 200 immediately — process async (< 200ms)
 * G-WH-01: Return 200 before processing
 * G-WH-02: upsert, never find+create
 * G-META-01: use .includes() on action_type
 */

// GET: Webhook verification (hub.challenge)
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: Receive messages — respond 200 immediately, process async
export async function POST(req) {
  // NFR1: parse body then respond 200 immediately
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ status: 'ok' })
  }

  // Kick off async processing — do NOT await (NFR1: < 200ms)
  processWebhook(body).catch((err) => console.error('[webhook/facebook]', err))

  return NextResponse.json({ status: 'ok' })
}

// ─── Async Processing ─────────────────────────────────────────────────────────

async function processWebhook(body) {
  if (body.object !== 'page') return

  const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? '10000000-0000-0000-0000-000000000001'

  // Resolve tenant by fb_page_id when multi-tenant is live
  // For now: single-tenant default (ADR-056 — to be updated in M5)
  const tenantId = DEFAULT_TENANT_ID

  for (const entry of (body.entry ?? [])) {
    for (const event of (entry.messaging ?? [])) {
      // Skip delivery / read receipts — only process real messages
      if (!event.message || event.message.is_echo) continue

      const psid      = event.sender?.id
      const text      = event.message?.text ?? null
      const mid       = event.message?.mid
      const timestamp = event.timestamp

      if (!psid) continue

      try {
        // 1. Upsert customer (G-WH-02: upsert)
        const customer = await upsertFacebookCustomer(tenantId, { psid, name: null })

        // 2. Upsert conversation — thread key is psid (1 thread per user per page)
        const conversationId = `fb-${psid}`
        const conversation = await upsertConversation(tenantId, conversationId, {
          channel:       'facebook',
          participantId: psid,
          customerId:    customer.id,
          status:        'open',
        })

        // 3. Append inbound message
        const saved = await appendMessage({
          conversationId: conversation.id,
          message:        text,
          direction:      'inbound',
          externalMessageId: mid ?? undefined,
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
        console.error('[webhook/facebook] processEvent error', err)
      }
    }
  }
}
