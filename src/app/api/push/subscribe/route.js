import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

// POST /api/push/subscribe - Save web push subscription for the current user
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription, userId } = body
    // subscription: PushSubscription object from browser (endpoint, keys: { p256dh, auth })

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Valid push subscription is required' }, { status: 400 })
    }

    // TODO: Upsert the subscription in DB (keyed by endpoint to avoid duplicates)
    // TODO: Associate subscription with tenantId + userId for targeted pushes
    // Schema: push_subscriptions { id, tenantId, userId, endpoint, p256dh, auth, createdAt }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push/Subscribe]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
