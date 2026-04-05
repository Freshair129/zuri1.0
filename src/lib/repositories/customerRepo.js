import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function findMany(tenantId, { search, limit = 50, offset = 0 } = {}) {
  const where = { tenantId }
  if (search) {
    where.OR = [
      { facebookName: { contains: search, mode: 'insensitive' } },
      { phonePrimary: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  return prisma.customer.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { updatedAt: 'desc' },
  })
}

export async function findById(tenantId, id) {
  return prisma.customer.findFirst({
    where: { id, tenantId },
    include: { 
      profile: true,
      insight: true,
      enrollments: { 
        take: 5, 
        orderBy: { enrolledAt: 'desc' },
        include: { product: true }
      },
      _count: {
        select: { orders: true, enrollments: true }
      }
    },
  })
}

// Alias for findById for consistency with API routes
export const getCustomerById = findById

export async function updateCustomer(tenantId, id, data) {
  const { profile: profileData, ...customerData } = data

  return prisma.customer.update({
    where: { id, tenantId },
    data: {
      ...customerData,
      ...(profileData && {
        profile: {
          upsert: {
            create: { ...profileData, tenantId },
            update: profileData,
          }
        }
      })
    },
    include: { profile: true }
  })
}

/**
 * List customers — alias used by /api/customers GET
 */
export async function getCustomers({ tenantId, page = 1, limit = 20, search } = {}) {
  const offset = (page - 1) * limit
  return findMany(tenantId, { search, limit, offset })
}

/**
 * Create a new customer — used by /api/customers POST
 */
export async function createCustomer({ tenantId, name, phone, email, lineId, tags, notes }) {
  const { generateCustomerId } = await import('@/lib/idGenerator')
  const channel = lineId ? 'LINE' : 'WEB'
  const customerId = await generateCustomerId(channel)

  return prisma.customer.create({
    data: {
      customerId,
      tenantId,
      facebookName: name ?? null,
      phonePrimary: phone ?? null,
      email: email ?? null,
      lineId: lineId ?? null,
      intelligence: notes ? { notes } : undefined,
    },
  })
}

export async function upsertByFacebookId(tenantId, facebookId, data) {
  return prisma.customer.upsert({
    where: { facebookId },
    create: { ...data, tenantId, facebookId },
    update: data,
  })
}
