import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function create(data) {
  return prisma.order.create({ data })
}

export async function findById(id) {
  return prisma.order.findUnique({
    where: { id },
    include: { customer: true, transactions: true },
  })
}

export async function findByCustomerId(tenantId, customerId, { limit = 20 } = {}) {
  return prisma.order.findMany({
    where: { customerId, tenantId },
    take: limit,
    orderBy: { date: 'desc' },
  })
}

export async function getOrdersByCustomer({ tenantId, customerId, limit = 20 }) {
  return prisma.order.findMany({
    where: { customerId, tenantId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { transactions: true }
  })
}
