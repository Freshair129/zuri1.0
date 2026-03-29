import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * @param {string|undefined} category - Filter by category slug
 */
export async function findMany(category) {
  return prisma.product.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function findById(id) {
  return prisma.product.findUnique({
    where: { id },
  })
}

export async function findActive() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
}
