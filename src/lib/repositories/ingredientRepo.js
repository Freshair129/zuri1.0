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
 * Deducts specified quantity from an ingredient's lots using First-Expire, First-Out (FEFO) logic.
 * 
 * @param {string} tenantId
 * @param {string} id - Ingredient ID
 * @param {number} totalNeeded - Total quantity to deduct
 * @returns {Promise<Object>} { deducted, lotsAffected[] }
 */
export async function deductFEFO(tenantId, id, totalNeeded) {
  if (totalNeeded <= 0) return { deducted: 0, lotsAffected: [] }

  return prisma.$transaction(async (tx) => {
    // 1. Get ingredient to check current stock
    const ingredient = await tx.ingredient.findFirst({
      where: { id, tenantId },
      include: {
        lots: {
          where: { remainingQty: { gt: 0 } },
          orderBy: { expiresAt: 'asc' },
        },
      },
    })

    if (!ingredient) throw new Error(`Ingredient not found: ${id}`)
    
    // We can allow "over-deduction" as per requirements or throw
    // Here we will deduct as much as possible up to what's available in lots
    let remainingToDeduct = totalNeeded
    const lotsAffected = []

    for (const lot of ingredient.lots) {
      if (remainingToDeduct === 0) break

      const deductFromThisLot = Math.min(lot.remainingQty, remainingToDeduct)

      await tx.ingredientLot.update({
        where: { id: lot.id },
        data: {
          remainingQty: { decrement: deductFromThisLot },
          status: lot.remainingQty === deductFromThisLot ? 'EXHAUSTED' : 'ACTIVE',
        },
      })

      lotsAffected.push({
        lotId: lot.id,
        qtyDeducted: deductFromThisLot,
      })

      remainingToDeduct -= deductFromThisLot
    }

    // 2. Update the main ingredient currentStock denormalized count
    const actuallyDeducted = totalNeeded - remainingToDeduct
    await tx.ingredient.update({
      where: { id: ingredient.id },
      data: {
        currentStock: { decrement: actuallyDeducted },
      },
    })

    return { deducted: actuallyDeducted, lotsAffected }
  })
}

/**
 * Find ingredient lots expiring within the next `days` days.
 */
export async function findExpiringLots(tenantId, days = 7) {
  // ... rest of the file
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
