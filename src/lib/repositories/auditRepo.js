import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function create(tenantId, actor, action, target, details = {}) {
  return prisma.auditLog.create({
    data: {
      tenantId,
      actor,
      action,
      target,
      details,
      createdAt: new Date(),
    },
  })
}

export async function findByActor(tenantId, actor, { limit = 50, skip = 0 } = {}) {
  return prisma.auditLog.findMany({
    where: { tenantId, actor },
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}

export async function findByTenant(tenantId, { action, limit = 50, skip = 0 } = {}) {
  const where = { tenantId }
  if (action) where.action = action
  return prisma.auditLog.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}
export async function findByTarget(tenantId, target, { limit = 50, skip = 0 } = {}) {
  return prisma.auditLog.findMany({
    where: { tenantId, target },
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}
