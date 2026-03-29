import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * UI reads ads data from DB — never from Graph API directly.
 * Data is synced hourly via QStash worker → /api/workers/sync-hourly
 */

export async function findAllAds({ status, limit = 100 } = {}) {
  const where = {}
  if (status) where.status = status

  return prisma.ad.findMany({
    where,
    take: limit,
    orderBy: { updatedAt: 'desc' },
  })
}

export async function findDailyMetrics(adId, { startDate, endDate } = {}) {
  const where = { adId }
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

export async function upsertDailyMetric(adId, date, data) {
  return prisma.adDailyMetric.upsert({
    where: { adId_date: { adId, date } },
    create: { ...data, adId, date },
    update: data,
  })
}
