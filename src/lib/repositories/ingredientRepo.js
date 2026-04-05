import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function findMany(tenantId, { search } = {}) {
  const where = { tenantId }
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  return prisma.ingredient.findMany({
    where,
    orderBy: { name: 'asc' },
  })
}

export async function findById(tenantId, id) {
  return prisma.ingredient.findFirst({
    where: { id, tenantId },
    include: { lots: true },
  })
}

/**
 * Adjust stock quantity for an ingredient by delta (positive = add, negative = deduct).
 * @param {string} id
 * @param {number} delta
 */
export async function updateStock(tenantId, id, delta) {
  return prisma.ingredient.update({
    where: { id, tenantId },
    data: {
      currentStock: { increment: delta },
    },
  })
}

/**
 * Find ingredient lots expiring within the next `days` days.
 * @param {number} days
 */
export async function findExpiringLots(tenantId, days = 7) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)

  return prisma.ingredientLot.findMany({
    where: {
      tenantId, // Assuming IngredientLot will eventually have tenantId for performance, but Ingredient already does
      expiresAt: {
        lte: cutoff,
        gte: new Date(),
      },
      remainingQty: { gt: 0 },
    },
    include: { ingredient: true },
    orderBy: { expiresAt: 'asc' },
  })
}
