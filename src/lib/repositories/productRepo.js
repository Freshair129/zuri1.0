/**
 * productRepo — Product catalog data access (FEAT06-POS)
 *
 * Products are scoped per tenant. Redis cached for POS performance.
 */

import { getPrisma } from '@/lib/db'
import { getOrSet, redis } from '@/lib/redis'
import { generateProductId } from '@/lib/idGenerator'

const prisma = getPrisma()

async function bustCache(tenantId) {
  try {
    const keys = await redis.keys(`products:${tenantId}:*`)
    if (keys.length > 0) await redis.del(...keys)
  } catch (err) {
    console.error('[productRepo] bustCache error', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST — for POS product grid + back-office catalog
// ─────────────────────────────────────────────────────────────────────────────
export async function listProducts(tenantId, {
  category,
  search,
  isPosVisible,
  isActive = true,
  page = 1,
  limit = 50,
} = {}) {
  const cacheKey = `products:${tenantId}:${JSON.stringify({ category, search, isPosVisible, isActive, page, limit })}`

  return getOrSet(cacheKey, async () => {
    const where = { tenantId }
    if (isActive !== undefined) where.isActive = isActive
    if (isPosVisible !== undefined) where.isPosVisible = isPosVisible
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku:  { contains: search, mode: 'insensitive' } },
      ]
    }

    const offset = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      prisma.product.count({ where }),
    ])

    return { products, total, page, limit, pages: Math.ceil(total / limit) }
  }, 120) // cache 2 minutes — product catalog changes infrequently
}

// Distinct categories for a tenant
export async function listCategories(tenantId) {
  const cacheKey = `products:${tenantId}:categories`
  return getOrSet(cacheKey, async () => {
    const rows = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })
    return rows.map(r => r.category)
  }, 120)
}

export async function getProductById(tenantId, id) {
  return prisma.product.findFirst({ where: { id, tenantId } })
}

export async function createProduct(tenantId, data) {
  const productId = await generateProductId()
  const product = await prisma.product.create({
    data: { ...data, tenantId, productId },
  })
  await bustCache(tenantId)
  return product
}

export async function updateProduct(tenantId, id, data) {
  const updated = await prisma.product.update({
    where: { id, tenantId },
    data,
  })
  await bustCache(tenantId)
  return updated
}

// POS price: posPrice if set, otherwise basePrice
export function getPosPrice(product) {
  return product.posPrice ?? product.basePrice
}

// Backward compat
export const findMany    = (category) => listProducts(undefined, { category })
export const findById    = (id)       => getProductById(undefined, id)
export const findActive  = ()         => listProducts(undefined, { isActive: true })
