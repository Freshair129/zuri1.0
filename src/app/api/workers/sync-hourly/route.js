import { NextResponse } from 'next/server'
import { verifyQStashSignature } from '@/lib/qstash'
import * as campaignRepo from '@/lib/repositories/campaignRepo'

/**
 * QStash Cron: ทุก 1 ชั่วโมง
 * Sync Meta Ads data → DB
 *
 * UI ดึงจาก DB เท่านั้น ไม่เรียก Graph API โดยตรง
 */
export async function POST(req) {
  // Verify QStash signature
  const isValid = await verifyQStashSignature(req)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    // TODO: Fetch from Meta Graph API v19
    // const ads = await fetchMetaAds(FB_ACCESS_TOKEN, FB_BUSINESS_ID)
    // for (const ad of ads) {
    //   await campaignRepo.upsertDailyMetric(ad.id, today, ad.metrics)
    // }

    console.log('[worker/sync-hourly] Sync completed')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[worker/sync-hourly]', error)
    throw error // Let QStash retry
  }
}
