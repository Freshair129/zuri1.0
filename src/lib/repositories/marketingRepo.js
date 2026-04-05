import { getPrisma } from '@/lib/db'
import { getOrSet, getRedis } from '@/lib/redis'

const prisma = getPrisma()

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Parse a range string into start/end Date objects.
 * Supports: '7d' | '30d' | '90d' | ISO date pair
 */
export function parseDateRange(range = '30d') {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  let start = new Date(now)
  switch (range) {
    case '7d':  start.setDate(now.getDate() - 7);  break
    case '30d': start.setDate(now.getDate() - 30); break
    case '90d': start.setDate(now.getDate() - 90); break
    default:    start.setDate(now.getDate() - 30)
  }
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function calcDerived(r) {
  const spend = parseFloat(r.spend) || 0
  const impressions = parseInt(r.impressions) || 0
  const clicks = parseInt(r.clicks) || 0
  const leads = parseInt(r.leads) || 0
  const revenue = parseFloat(r.revenue) || 0
  return {
    ...r,
    spend,
    impressions,
    clicks,
    leads,
    revenue,
    ctr:  impressions > 0 ? +(clicks / impressions * 100).toFixed(2) : 0,
    cpc:  clicks > 0     ? +(spend / clicks).toFixed(2)              : 0,
    cpl:  leads > 0      ? +(spend / leads).toFixed(2)               : 0,
    roas: spend > 0      ? +(revenue / spend).toFixed(2)             : 0,
    cpm:  impressions > 0 ? +(spend / impressions * 1000).toFixed(2) : 0,
  }
}

function pctChange(curr, prev) {
  if (!prev || prev === 0) return null
  return +((curr - prev) / prev * 100).toFixed(1)
}

// ─────────────────────────────────────────────
// Core query (single period KPI)
// ─────────────────────────────────────────────

async function queryKpi(tenantId, start, end) {
  const rows = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM(m.spend), 0)::float      AS spend,
      COALESCE(SUM(m.impressions), 0)::int  AS impressions,
      COALESCE(SUM(m.clicks), 0)::int       AS clicks,
      COALESCE(SUM(m.leads), 0)::int        AS leads,
      COALESCE(SUM(m.revenue), 0)::float    AS revenue,
      COALESCE(SUM(m.reach), 0)::int        AS reach
    FROM ad_daily_metrics m
    JOIN ads a         ON m.ad_id      = a.ad_id
    JOIN ad_sets s     ON a.ad_set_id  = s.ad_set_id
    JOIN campaigns c   ON s.campaign_id = c.campaign_id
    JOIN ad_accounts ac ON c.ad_account_id = ac.account_id
    WHERE ac.tenant_id::text = ${tenantId}
      AND m.date >= ${start}::date
      AND m.date <= ${end}::date
  `
  return rows[0] ?? {}
}

// ─────────────────────────────────────────────
// getDashboardSummary — KPI cards with period comparison
// ─────────────────────────────────────────────

export async function getDashboardSummary(tenantId, range = '30d') {
  const cacheKey = `marketing:dashboard:${tenantId}:${range}`
  return getOrSet(cacheKey, async () => {
    const { start, end } = parseDateRange(range)
    const periodMs = end.getTime() - start.getTime()
    const prevEnd   = new Date(start.getTime() - 1)
    const prevStart = new Date(prevEnd.getTime() - periodMs)

    const [curr, prev] = await Promise.all([
      queryKpi(tenantId, start, end),
      queryKpi(tenantId, prevStart, prevEnd),
    ])

    const c = calcDerived(curr)
    const p = calcDerived(prev)

    return {
      range,
      current: c,
      previous: p,
      changes: {
        spend:       pctChange(c.spend, p.spend),
        impressions: pctChange(c.impressions, p.impressions),
        clicks:      pctChange(c.clicks, p.clicks),
        leads:       pctChange(c.leads, p.leads),
        revenue:     pctChange(c.revenue, p.revenue),
        roas:        pctChange(c.roas, p.roas),
        ctr:         pctChange(c.ctr, p.ctr),
        cpl:         pctChange(c.cpl, p.cpl),
      },
    }
  }, 300)
}

// ─────────────────────────────────────────────
// getCampaigns — campaign list with aggregated metrics
// ─────────────────────────────────────────────

export async function getCampaigns(tenantId, { range = '30d', status } = {}) {
  const cacheKey = `marketing:campaigns:${tenantId}:${range}:${status ?? 'all'}`
  return getOrSet(cacheKey, async () => {
    const { start, end } = parseDateRange(range)

    const rows = await prisma.$queryRaw`
      SELECT
        c.id,
        c.campaign_id  AS "campaignId",
        c.name,
        c.objective,
        c.status,
        c.start_date   AS "startDate",
        c.end_date     AS "endDate",
        COALESCE(SUM(m.spend),       0)::float  AS spend,
        COALESCE(SUM(m.impressions), 0)::int    AS impressions,
        COALESCE(SUM(m.clicks),      0)::int    AS clicks,
        COALESCE(SUM(m.leads),       0)::int    AS leads,
        COALESCE(SUM(m.revenue),     0)::float  AS revenue,
        COALESCE(SUM(m.reach),       0)::int    AS reach,
        COUNT(DISTINCT s.ad_set_id)::int        AS "adSetCount",
        COUNT(DISTINCT a.ad_id)::int            AS "adCount"
      FROM campaigns c
      JOIN ad_accounts ac ON c.ad_account_id = ac.account_id
      LEFT JOIN ad_sets s ON s.campaign_id = c.campaign_id
      LEFT JOIN ads a     ON a.ad_set_id  = s.ad_set_id
      LEFT JOIN ad_daily_metrics m ON m.ad_id = a.ad_id
        AND m.date >= ${start}::date
        AND m.date <= ${end}::date
      WHERE ac.tenant_id::text = ${tenantId}
      GROUP BY c.id, c.campaign_id, c.name, c.objective, c.status, c.start_date, c.end_date
      ORDER BY spend DESC
    `

    let result = rows.map(calcDerived)
    if (status) result = result.filter(r => r.status === status)
    return result
  }, 300)
}

// ─────────────────────────────────────────────
// Drill-down: AdSets for a Campaign
// ─────────────────────────────────────────────

export async function getAdSetsForCampaign(tenantId, campaignId, range = '30d') {
  const { start, end } = parseDateRange(range)
  const rows = await prisma.$queryRaw`
    SELECT
      s.id,
      s.ad_set_id  AS "adSetId",
      s.name,
      s.status,
      s.daily_budget AS "dailyBudget",
      COALESCE(SUM(m.spend),       0)::float  AS spend,
      COALESCE(SUM(m.impressions), 0)::int    AS impressions,
      COALESCE(SUM(m.clicks),      0)::int    AS clicks,
      COALESCE(SUM(m.leads),       0)::int    AS leads,
      COALESCE(SUM(m.revenue),     0)::float  AS revenue,
      COUNT(DISTINCT a.ad_id)::int            AS "adCount"
    FROM ad_sets s
    JOIN campaigns c   ON s.campaign_id = c.campaign_id
    JOIN ad_accounts ac ON c.ad_account_id = ac.account_id
    LEFT JOIN ads a    ON a.ad_set_id = s.ad_set_id
    LEFT JOIN ad_daily_metrics m ON m.ad_id = a.ad_id
      AND m.date >= ${start}::date
      AND m.date <= ${end}::date
    WHERE ac.tenant_id::text = ${tenantId}
      AND c.campaign_id = ${campaignId}
    GROUP BY s.id, s.ad_set_id, s.name, s.status, s.daily_budget
    ORDER BY spend DESC
  `
  return rows.map(calcDerived)
}

// ─────────────────────────────────────────────
// Drill-down: Ads for an AdSet
// ─────────────────────────────────────────────

export async function getAdsForAdSet(tenantId, adSetId, range = '30d') {
  const { start, end } = parseDateRange(range)
  const rows = await prisma.$queryRaw`
    SELECT
      a.id,
      a.ad_id           AS "adId",
      a.name,
      a.status,
      a.delivery_status AS "deliveryStatus",
      COALESCE(SUM(m.spend),       0)::float  AS spend,
      COALESCE(SUM(m.impressions), 0)::int    AS impressions,
      COALESCE(SUM(m.clicks),      0)::int    AS clicks,
      COALESCE(SUM(m.leads),       0)::int    AS leads,
      COALESCE(SUM(m.revenue),     0)::float  AS revenue
    FROM ads a
    JOIN ad_sets s     ON a.ad_set_id  = s.ad_set_id
    JOIN campaigns c   ON s.campaign_id = c.campaign_id
    JOIN ad_accounts ac ON c.ad_account_id = ac.account_id
    LEFT JOIN ad_daily_metrics m ON m.ad_id = a.ad_id
      AND m.date >= ${start}::date
      AND m.date <= ${end}::date
    WHERE ac.tenant_id::text = ${tenantId}
      AND s.ad_set_id = ${adSetId}
    GROUP BY a.id, a.ad_id, a.name, a.status, a.delivery_status
    ORDER BY spend DESC
  `
  return rows.map(calcDerived)
}

// ─────────────────────────────────────────────
// getTimeSeries — daily spend/revenue/clicks for Recharts
// ─────────────────────────────────────────────

export async function getTimeSeries(tenantId, range = '30d') {
  const cacheKey = `marketing:timeseries:${tenantId}:${range}`
  return getOrSet(cacheKey, async () => {
    const { start, end } = parseDateRange(range)
    const rows = await prisma.$queryRaw`
      SELECT
        m.date::text                          AS date,
        COALESCE(SUM(m.spend),       0)::float  AS spend,
        COALESCE(SUM(m.impressions), 0)::int    AS impressions,
        COALESCE(SUM(m.clicks),      0)::int    AS clicks,
        COALESCE(SUM(m.revenue),     0)::float  AS revenue,
        COALESCE(SUM(m.reach),       0)::int    AS reach
      FROM ad_daily_metrics m
      JOIN ads a         ON m.ad_id      = a.ad_id
      JOIN ad_sets s     ON a.ad_set_id  = s.ad_set_id
      JOIN campaigns c   ON s.campaign_id = c.campaign_id
      JOIN ad_accounts ac ON c.ad_account_id = ac.account_id
      WHERE ac.tenant_id::text = ${tenantId}
        AND m.date >= ${start}::date
        AND m.date <= ${end}::date
      GROUP BY m.date
      ORDER BY m.date ASC
    `
    return rows.map(r => ({
      date:        r.date,
      spend:       parseFloat(r.spend) || 0,
      impressions: parseInt(r.impressions) || 0,
      clicks:      parseInt(r.clicks) || 0,
      revenue:     parseFloat(r.revenue) || 0,
      reach:       parseInt(r.reach) || 0,
      ctr:         (parseInt(r.impressions) || 0) > 0
                     ? +((parseInt(r.clicks) / parseInt(r.impressions)) * 100).toFixed(2)
                     : 0,
    }))
  }, 300)
}

// ─────────────────────────────────────────────
// getPlacementBreakdown — by platform + position
// ─────────────────────────────────────────────

export async function getPlacementBreakdown(tenantId, range = '30d') {
  const cacheKey = `marketing:placement:${tenantId}:${range}`
  return getOrSet(cacheKey, async () => {
    const { start, end } = parseDateRange(range)
    const rows = await prisma.$queryRaw`
      SELECT
        p.platform,
        p.position,
        COALESCE(SUM(p.spend),       0)::float  AS spend,
        COALESCE(SUM(p.impressions), 0)::int    AS impressions,
        COALESCE(SUM(p.clicks),      0)::int    AS clicks,
        COALESCE(SUM(p.revenue),     0)::float  AS revenue,
        COALESCE(SUM(p.reach),       0)::int    AS reach
      FROM ad_daily_placements p
      JOIN ads a         ON p.ad_id      = a.ad_id
      JOIN ad_sets s     ON a.ad_set_id  = s.ad_set_id
      JOIN campaigns c   ON s.campaign_id = c.campaign_id
      JOIN ad_accounts ac ON c.ad_account_id = ac.account_id
      WHERE ac.tenant_id::text = ${tenantId}
        AND p.date >= ${start}::date
        AND p.date <= ${end}::date
      GROUP BY p.platform, p.position
      ORDER BY spend DESC
    `
    return rows.map(r => ({
      platform:    r.platform,
      position:    r.position,
      label:       `${r.platform} – ${r.position}`,
      spend:       parseFloat(r.spend) || 0,
      impressions: parseInt(r.impressions) || 0,
      clicks:      parseInt(r.clicks) || 0,
      revenue:     parseFloat(r.revenue) || 0,
      cpm:  (parseInt(r.impressions) || 0) > 0
              ? +((parseFloat(r.spend) / parseInt(r.impressions)) * 1000).toFixed(2) : 0,
      ctr:  (parseInt(r.impressions) || 0) > 0
              ? +((parseInt(r.clicks) / parseInt(r.impressions)) * 100).toFixed(2) : 0,
    }))
  }, 300)
}

// ─────────────────────────────────────────────
// getHourlyHeatmap — 24×7 grid (dayOfWeek × hour)
// ─────────────────────────────────────────────

export async function getHourlyHeatmap(tenantId, range = '30d') {
  const cacheKey = `marketing:heatmap:${tenantId}:${range}`
  return getOrSet(cacheKey, async () => {
    const { start, end } = parseDateRange(range)
    const rows = await prisma.$queryRaw`
      SELECT
        EXTRACT(DOW FROM h.date)::int         AS dow,
        h.hour,
        COALESCE(SUM(h.spend),       0)::float  AS spend,
        COALESCE(SUM(h.clicks),      0)::int    AS clicks,
        COALESCE(SUM(h.impressions), 0)::int    AS impressions,
        COALESCE(SUM(h.leads),       0)::int    AS leads
      FROM ad_hourly_metrics h
      JOIN ads a         ON h.ad_id      = a.ad_id
      JOIN ad_sets s     ON a.ad_set_id  = s.ad_set_id
      JOIN campaigns c   ON s.campaign_id = c.campaign_id
      JOIN ad_accounts ac ON c.ad_account_id = ac.account_id
      WHERE ac.tenant_id::text = ${tenantId}
        AND h.date >= ${start}::date
        AND h.date <= ${end}::date
      GROUP BY dow, h.hour
      ORDER BY dow, h.hour
    `
    return rows.map(r => ({
      dow:         parseInt(r.dow) || 0,    // 0 = Sun … 6 = Sat
      hour:        parseInt(r.hour) || 0,
      spend:       parseFloat(r.spend) || 0,
      clicks:      parseInt(r.clicks) || 0,
      impressions: parseInt(r.impressions) || 0,
      leads:       parseInt(r.leads) || 0,
    }))
  }, 300)
}

// ─────────────────────────────────────────────
// clearMarketingCache — called after sync-hourly
// ─────────────────────────────────────────────

export async function clearMarketingCache(tenantId) {
  const redis = getRedis()
  const ranges = ['7d', '30d', '90d']
  const prefixes = ['dashboard', 'campaigns', 'timeseries', 'placement', 'heatmap']
  const keys = []
  for (const prefix of prefixes) {
    for (const r of ranges) {
      keys.push(`marketing:${prefix}:${tenantId}:${r}`)
      keys.push(`marketing:${prefix}:${tenantId}:${r}:all`)
    }
  }
  await Promise.all(keys.map(k => redis.del(k)))
}
