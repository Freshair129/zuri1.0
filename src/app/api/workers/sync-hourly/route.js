import { NextResponse } from 'next/server'
import { verifyQStashSignature } from '@/lib/qstash'
import { getPrisma } from '@/lib/db'
import { getRedis } from '@/lib/redis'
import { clearMarketingCache } from '@/lib/repositories/marketingRepo'

const META_API_VERSION = 'v21.0'
const META_API_BASE    = `https://graph.facebook.com/${META_API_VERSION}`

const prisma = getPrisma()

// ─────────────────────────────────────────────────────────────────────────────
// Meta Graph API helpers
// ─────────────────────────────────────────────────────────────────────────────

async function metaGet(path, params = {}) {
  const token = process.env.META_SYSTEM_USER_TOKEN
  if (!token) throw new Error('META_SYSTEM_USER_TOKEN not set')

  const qs = new URLSearchParams({ access_token: token, ...params })
  const url = `${META_API_BASE}/${path}?${qs}`
  const res = await fetch(url)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Meta API ${res.status}: ${err?.error?.message ?? res.statusText}`)
  }
  return res.json()
}

/**
 * Paginate a Meta /edge endpoint, collecting all pages.
 * Returns flat array of items.
 */
async function metaGetAll(path, params = {}) {
  const items = []
  let cursor = null

  do {
    const p = { ...params, limit: 500 }
    if (cursor) p.after = cursor

    const data = await metaGet(path, p)
    if (data.data) items.push(...data.data)

    cursor = data.paging?.cursors?.after ?? null
    const nextUrl = data.paging?.next
    if (!nextUrl) break
  } while (cursor)

  return items
}

// ─────────────────────────────────────────────────────────────────────────────
// Upsert helpers (raw SQL for speed — these tables aren't in Prisma schema)
// ─────────────────────────────────────────────────────────────────────────────

async function upsertCampaign(accountId, c) {
  await prisma.$executeRaw`
    INSERT INTO campaigns (id, campaign_id, name, objective, status, ad_account_id, created_at, updated_at)
    VALUES (gen_random_uuid()::text, ${c.id}, ${c.name}, ${c.objective ?? null}, ${c.status}, ${accountId}, NOW(), NOW())
    ON CONFLICT (campaign_id) DO UPDATE
      SET name       = EXCLUDED.name,
          objective  = EXCLUDED.objective,
          status     = EXCLUDED.status,
          updated_at = NOW()
  `
}

async function upsertAdSet(s) {
  const targeting = s.targeting ? JSON.stringify(s.targeting) : '{}'
  await prisma.$executeRaw`
    INSERT INTO ad_sets (id, ad_set_id, name, status, campaign_id, daily_budget, targeting, created_at, updated_at)
    VALUES (gen_random_uuid()::text, ${s.id}, ${s.name}, ${s.status}, ${s.campaign_id}, ${s.daily_budget ?? 0}, ${targeting}::jsonb, NOW(), NOW())
    ON CONFLICT (ad_set_id) DO UPDATE
      SET name         = EXCLUDED.name,
          status       = EXCLUDED.status,
          daily_budget = EXCLUDED.daily_budget,
          targeting    = EXCLUDED.targeting,
          updated_at   = NOW()
  `
}

async function upsertAd(a) {
  await prisma.$executeRaw`
    INSERT INTO ads (id, ad_id, name, status, ad_set_id, creative_id, created_at, updated_at)
    VALUES (gen_random_uuid()::text, ${a.id}, ${a.name}, ${a.status}, ${a.adset_id}, ${a.creative?.id ?? null}, NOW(), NOW())
    ON CONFLICT (ad_id) DO UPDATE
      SET name       = EXCLUDED.name,
          status     = EXCLUDED.status,
          updated_at = NOW()
  `
}

async function upsertDailyMetric(adId, date, m) {
  const d = date instanceof Date ? date : new Date(date)
  await prisma.$executeRaw`
    INSERT INTO ad_daily_metrics
      (id, ad_id, date, spend, impressions, clicks, leads, purchases, revenue, roas, reach, cpm, cpc, frequency, cost_per_lead, cost_per_purchase, created_at)
    VALUES (
      gen_random_uuid()::text,
      ${adId}, ${d}::date,
      ${parseFloat(m.spend) || 0},
      ${parseInt(m.impressions) || 0},
      ${parseInt(m.inline_link_clicks ?? m.clicks) || 0},
      ${parseInt(m.leads) || 0},
      ${parseInt(m.purchases) || 0},
      ${parseFloat(m.purchase_roas?.[0]?.value ?? m.revenue) || 0},
      ${parseFloat(m.purchase_roas?.[0]?.value ? (parseFloat(m.spend) > 0 ? parseFloat(m.purchase_roas[0].value) : 0) : m.roas) || 0},
      ${parseInt(m.reach) || 0},
      ${parseFloat(m.cpm) || 0},
      ${parseFloat(m.cpc) || 0},
      ${parseFloat(m.frequency) || 0},
      ${parseFloat(m.cost_per_lead) || 0},
      ${parseFloat(m.cost_per_purchase ?? m.cost_per_result) || 0},
      NOW()
    )
    ON CONFLICT (ad_id, date) DO UPDATE
      SET spend                = EXCLUDED.spend,
          impressions          = EXCLUDED.impressions,
          clicks               = EXCLUDED.clicks,
          leads                = EXCLUDED.leads,
          purchases            = EXCLUDED.purchases,
          revenue              = EXCLUDED.revenue,
          roas                 = EXCLUDED.roas,
          reach                = EXCLUDED.reach,
          cpm                  = EXCLUDED.cpm,
          cpc                  = EXCLUDED.cpc,
          frequency            = EXCLUDED.frequency,
          cost_per_lead        = EXCLUDED.cost_per_lead,
          cost_per_purchase    = EXCLUDED.cost_per_purchase
  `
}

async function upsertLiveStatus(adId, isRunning) {
  await prisma.$executeRaw`
    INSERT INTO ad_live_status (id, ad_id, is_running_now, last_impression_time, updated_at)
    VALUES (gen_random_uuid()::text, ${adId}, ${isRunning}, NOW(), NOW())
    ON CONFLICT (ad_id) DO UPDATE
      SET is_running_now        = EXCLUDED.is_running_now,
          last_impression_time  = EXCLUDED.last_impression_time,
          updated_at            = NOW()
  `
}

// ─────────────────────────────────────────────────────────────────────────────
// Main sync logic
// ─────────────────────────────────────────────────────────────────────────────

async function syncTenant(tenantId, accountId) {
  const redis = getRedis()
  const inflightKey = `sync:_inflight:${tenantId}`

  // Inflight guard (Gotcha #2) — TTL 10 min
  const alreadyRunning = await redis.set(inflightKey, '1', { nx: true, ex: 600 })
  if (!alreadyRunning) {
    console.log(`[sync-hourly] tenant ${tenantId} already syncing, skipping`)
    return { skipped: true }
  }

  try {
    // ── 1. Campaigns ──────────────────────────────────────────────
    const campaigns = await metaGetAll(`act_${accountId}/campaigns`, {
      fields: 'id,name,status,objective',
    })
    for (const c of campaigns) {
      await upsertCampaign(accountId, c)
    }
    console.log(`[sync-hourly] ${campaigns.length} campaigns upserted`)

    // ── 2. AdSets ─────────────────────────────────────────────────
    const adSets = await metaGetAll(`act_${accountId}/adsets`, {
      fields: 'id,name,status,campaign_id,daily_budget,targeting',
    })
    for (const s of adSets) {
      await upsertAdSet(s)
    }
    console.log(`[sync-hourly] ${adSets.length} adsets upserted`)

    // ── 3. Ads ────────────────────────────────────────────────────
    const ads = await metaGetAll(`act_${accountId}/ads`, {
      fields: 'id,name,status,adset_id,creative{id}',
    })
    for (const a of ads) {
      await upsertAd(a)
      await upsertLiveStatus(a.id, a.status === 'ACTIVE')
    }
    console.log(`[sync-hourly] ${ads.length} ads upserted`)

    // ── 4. Daily insights (last 7d — overlapping window for attribution updates)
    const insightsData = await metaGetAll(`act_${accountId}/insights`, {
      fields: [
        'ad_id', 'date_start', 'spend', 'impressions', 'reach', 'frequency',
        'inline_link_clicks', 'cpm', 'cpc', 'leads', 'purchase_roas', 'cost_per_lead',
      ].join(','),
      date_preset: 'last_7d',
      level: 'ad',
      time_increment: 1,
    })
    for (const m of insightsData) {
      await upsertDailyMetric(m.ad_id, m.date_start, m)
    }
    console.log(`[sync-hourly] ${insightsData.length} daily metric rows upserted`)

    // ── 5. Clear Redis cache ──────────────────────────────────────
    await clearMarketingCache(tenantId)
    console.log(`[sync-hourly] tenant ${tenantId} cache cleared`)

    return {
      campaigns: campaigns.length,
      adSets:    adSets.length,
      ads:       ads.length,
      metrics:   insightsData.length,
    }
  } finally {
    await redis.del(inflightKey)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req) {
  // NFR3: Verify QStash signature
  const { isValid } = await verifyQStashSignature(req)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    // Load all ad accounts to sync
    const accounts = await prisma.$queryRaw`
      SELECT account_id, tenant_id::text AS "tenantId"
      FROM ad_accounts
      WHERE account_id IS NOT NULL
    `

    if (!accounts.length) {
      console.log('[sync-hourly] No ad accounts found')
      return NextResponse.json({ ok: true, synced: 0 })
    }

    const results = []
    for (const acc of accounts) {
      try {
        const r = await syncTenant(acc.tenantId, acc.account_id)
        results.push({ accountId: acc.account_id, ...r })
      } catch (err) {
        console.error(`[sync-hourly] account ${acc.account_id} failed:`, err.message)
        results.push({ accountId: acc.account_id, error: err.message })
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (error) {
    console.error('[sync-hourly]', error)
    throw error // NFR5: throw so QStash retries
  }
}
