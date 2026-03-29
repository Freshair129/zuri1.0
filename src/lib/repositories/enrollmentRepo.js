import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function findMany(tenantId, { limit = 50, skip = 0 } = {}) {
  return prisma.enrollment.findMany({
    where: { tenantId },
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}

export async function findByCustomerId(customerId) {
  return prisma.enrollment.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function create(data) {
  return prisma.enrollment.create({ data })
}
