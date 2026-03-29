import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function findMany({ tenantId } = {}) {
  return prisma.ingredient.findMany({
    where: tenantId ? { tenantId } : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function findById(id) {
  return prisma.ingredient.findUnique({
    where: { id },
    include: { lots: true },
  })
}

/**
 * Adjust stock quantity for an ingredient by delta (positive = add, negative = deduct).
 * @param {string} id
 * @param {number} delta
 */
export async function updateStock(id, delta) {
  return prisma.ingredient.update({
    where: { id },
    data: {
      stockQuantity: { increment: delta },
    },
  })
}

/**
 * Find ingredient lots expiring within the next `days` days.
 * @param {number} days
 */
export async function findExpiringLots(days = 7) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)

  return prisma.ingredientLot.findMany({
    where: {
      expiresAt: {
        lte: cutoff,
        gte: new Date(),
      },
      quantity: { gt: 0 },
    },
    include: { ingredient: true },
    orderBy: { expiresAt: 'asc' },
  })
}
