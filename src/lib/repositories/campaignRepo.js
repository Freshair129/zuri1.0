import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * UI reads ads data from DB — never from Graph API directly.
 * Data is synced hourly via QStash worker → /api/workers/sync-hourly
 */

export async function findAllAds(tenantId, { status, limit = 100 } = {}) {
  const where = { tenantId }
  if (status) where.status = status

  return prisma.ad.findMany({
    where,
    take: limit,
    orderBy: { updatedAt: 'desc' },
  })
}

export async function findDailyMetrics(tenantId, adId, { startDate, endDate } = {}) {
  const where = { tenantId, adId }
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  return prisma.adDailyMetric.findMany({
    where,
    orderBy: { date: 'asc' },
  })
}

export async function upsertDailyMetric(tenantId, adId, date, data) {
  return prisma.adDailyMetric.upsert({
    where: { 
      tenantId_adId_date: { tenantId, adId, date } 
    },
    create: { ...data, tenantId, adId, date },
    update: data,
  })
}

export async function getCampaignById({ tenantId, id }) {
  return prisma.campaign.findFirst({
    where: { id, tenantId }
  })
}

export async function updateCampaignStatus({ tenantId, campaignId, adId, action }) {
  const status = action === 'pause' ? 'PAUSED' : 'ACTIVE'
  
  // Update Campaign
  if (campaignId) {
    await prisma.campaign.update({
      where: { id: campaignId, tenantId },
      data: { status }
    })
  }

  // Update Ad if provided
  if (adId) {
    await prisma.ad.update({
      where: { id: adId, tenantId },
      data: { status }
    })
  }
}
