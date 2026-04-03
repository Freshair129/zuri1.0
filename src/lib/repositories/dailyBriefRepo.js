import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function findByDate(briefDate) {
  return prisma.dailyBrief.findUnique({ where: { briefDate } })
}

export async function getDailyBriefByDate({ tenantId, date }) {
  // TODO: Add tenantId filter once Schema is updated (NFR7)
  const briefDate = new Date(date)
  briefDate.setHours(0, 0, 0, 0)
  
  return prisma.dailyBrief.findUnique({
    where: { briefDate }
  })
}

export async function findMany({ limit = 30 } = {}) {
  return prisma.dailyBrief.findMany({
    take: limit,
    orderBy: { briefDate: 'desc' },
  })
}

/**
 * List daily briefs with pagination — alias used by /api/daily-brief GET
 */
export async function getDailyBriefs({ tenantId, page = 1, limit = 10 } = {}) {
  // tenantId reserved for future multi-tenant briefs (NFR7)
  return findMany({ limit })
}

export async function upsert(briefDate, data) {
  return prisma.dailyBrief.upsert({
    where: { briefDate },
    create: { ...data, briefDate },
    update: data,
  })
}
