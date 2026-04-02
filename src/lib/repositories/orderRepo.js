import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function create(data) {
  return prisma.order.create({ data })
}

export async function getOrderById(tenantId, id) {
  return prisma.order.findFirst({
    where: { id, tenantId },
    include: { customer: true, transactions: true },
  })
}

export async function getOrders(tenantId, { status, limit = 50, offset = 0 } = {}) {
  const where = { tenantId }
  if (status) where.status = status

  return prisma.order.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
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

export async function createOrder(tenantId, data) {
  return prisma.order.create({
    data: { ...data, tenantId }
  })
}

export async function updateOrderStatus(tenantId, id, status) {
  return prisma.order.update({
    where: { id, tenantId },
    data: { status }
  })
}
