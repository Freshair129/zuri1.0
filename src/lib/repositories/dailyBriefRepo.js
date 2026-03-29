import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function findByDate(briefDate) {
  return prisma.dailyBrief.findUnique({ where: { briefDate } })
}

export async function findMany({ limit = 30 } = {}) {
  return prisma.dailyBrief.findMany({
    take: limit,
    orderBy: { briefDate: 'desc' },
  })
}

export async function upsert(briefDate, data) {
  return prisma.dailyBrief.upsert({
    where: { briefDate },
    create: { ...data, briefDate },
    update: data,
  })
}
