import { getPrisma } from '@/lib/db'
import { updateStock } from '@/lib/repositories/ingredientRepo'

const prisma = getPrisma()

/**
 * Find schedules within a date range (inclusive).
 * @param {Date|string} from
 * @param {Date|string} to
 */
export async function findByDateRange(from, to) {
  return prisma.schedule.findMany({
    where: {
      scheduledAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    orderBy: { scheduledAt: 'asc' },
  })
}

export async function findById(id) {
  return prisma.schedule.findUnique({
    where: { id },
    include: { items: true },
  })
}

/**
 * Mark a schedule as complete and deduct ingredient stock for each item.
 * Runs inside a transaction to ensure atomicity.
 * @param {string} id - Schedule ID
 */
export async function complete(id) {
  return prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!schedule) throw new Error(`Schedule ${id} not found`)
    if (schedule.status === 'completed') throw new Error(`Schedule ${id} already completed`)

    // Deduct ingredient stock for each schedule item
    for (const item of schedule.items) {
      await updateStock(item.ingredientId, -item.quantity)
    }

    return tx.schedule.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })
  })
}
