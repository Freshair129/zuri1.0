import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * Get AI Insight for a customer
 */
export async function getInsightByCustomerId(tenantId, customerId) {
  return prisma.customerInsight.findUnique({
    where: { customerId, tenantId },
  })
}

/**
 * Upsert AI Insight and update customer scores
 */
export async function upsertInsight(tenantId, customerId, data) {
  const { intentScore, churnScore, ...insightData } = data

  return prisma.$transaction(async (tx) => {
    // 1. Update Customer scores if provided
    if (intentScore !== undefined || churnScore !== undefined) {
      await tx.customer.update({
        where: { id: customerId, tenantId },
        data: {
          ...(intentScore !== undefined && { intentScore }),
          ...(churnScore !== undefined && { churnScore }),
        },
      })
    }

    // 2. Upsert Insight
    return tx.customerInsight.upsert({
      where: { customerId, tenantId },
      create: {
        ...insightData,
        customerId,
        tenantId,
        enrichedAt: new Date(),
      },
      update: {
        ...insightData,
        enrichedAt: new Date(),
      },
    })
  })
}

/**
 * Get Aggregate Patterns for a tenant
 */
export async function getTenantPatterns(tenantId) {
  return prisma.tenantCRMPattern.findUnique({
    where: { tenantId },
  })
}

/**
 * Update Aggregate Patterns (Cron target)
 */
export async function updateTenantPatterns(tenantId, patterns) {
  return prisma.tenantCRMPattern.upsert({
    where: { tenantId },
    create: {
      ...patterns,
      tenantId,
      computedAt: new Date(),
    },
    update: {
      ...patterns,
      computedAt: new Date(),
    },
  })
}
