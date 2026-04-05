/**
 * orderRepo — POS order data access layer (FEAT06-POS)
 *
 * All functions receive tenantId for multi-tenant isolation (ADR-056).
 * Calculates subtotal, VAT, service charge, and total atomically.
 */

import { getPrisma } from '@/lib/db'
import { getOrSet, redis } from '@/lib/redis'
import { generateOrderId, generateTransactionId } from '@/lib/idGenerator'

const prisma = getPrisma()

// ─── Totals calculation ───────────────────────────────────────────────────────
/**
 * Calculate order totals from items + discounts + config
 * @param {Array} items       [{unitPrice, qty, discount?}]
 * @param {number} discountAmount  bill-level discount (฿)
 * @param {number} vatRate    percentage (e.g. 7)
 * @param {boolean} vatIncluded   true = price already includes VAT
 * @param {number} serviceChargeRate  percentage (e.g. 10)
 */
export function calculateTotals(items, {
  discountAmount = 0,
  vatRate = 7,
  vatIncluded = true,
  serviceChargeRate = 0,
} = {}) {
  const subtotalBeforeDiscount = items.reduce((sum, item) => {
    const itemTotal = (item.unitPrice * item.qty) - (item.discount ?? 0)
    return sum + itemTotal
  }, 0)

  const subtotal = Math.max(0, subtotalBeforeDiscount - discountAmount)

  let vatAmount = 0
  let serviceCharge = 0

  if (serviceChargeRate > 0) {
    serviceCharge = Math.round(subtotal * serviceChargeRate) / 100
  }

  const baseForVat = subtotal + serviceCharge

  if (vatIncluded) {
    // VAT-inclusive: extract VAT from price
    vatAmount = Math.round((baseForVat * vatRate / (100 + vatRate)) * 100) / 100
  } else {
    vatAmount = Math.round(baseForVat * vatRate) / 100
  }

  const total = vatIncluded
    ? baseForVat
    : baseForVat + vatAmount

  return {
    subtotalAmount: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    serviceCharge:  Math.round(serviceCharge * 100) / 100,
    vatAmount:      Math.round(vatAmount * 100) / 100,
    totalAmount:    Math.round(total * 100) / 100,
  }
}

// ─── Cache helpers ─────────────────────────────────────────────────────────────
async function bustOrderCache(tenantId) {
  try {
    const keys = await redis.keys(`orders:${tenantId}:*`)
    if (keys.length > 0) await redis.del(...keys)
  } catch (err) {
    console.error('[orderRepo] bustOrderCache', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ORDER
// ─────────────────────────────────────────────────────────────────────────────
export async function createOrder(tenantId, {
  customerId,
  tableId,
  orderType = 'TAKEAWAY',
  items = [],        // [{ productId?, name, unitPrice, qty, discount?, note? }]
  discountAmount = 0,
  notes,
  closedById,
  vatRate = 7,
  vatIncluded = true,
  serviceChargeRate = 0,
}) {
  const orderId = await generateOrderId()

  const totals = calculateTotals(items, { discountAmount, vatRate, vatIncluded, serviceChargeRate })

  const orderItems = items.map(item => ({
    tenantId,
    productId:  item.productId ?? null,
    name:       item.name,
    qty:        item.qty,
    unitPrice:  item.unitPrice,
    discount:   item.discount ?? 0,
    totalPrice: Math.round(((item.unitPrice * item.qty) - (item.discount ?? 0)) * 100) / 100,
    note:       item.note ?? null,
  }))

  const order = await prisma.order.create({
    data: {
      orderId,
      tenantId,
      customerId: customerId ?? null,
      tableId:    tableId   ?? null,
      orderType,
      notes,
      closedById: closedById ?? null,
      ...totals,
      items: { create: orderItems },
    },
    include: { items: true, customer: true },
  })

  await bustOrderCache(tenantId)
  return order
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST ORDERS
// ─────────────────────────────────────────────────────────────────────────────
export async function listOrders(tenantId, {
  status,
  orderType,
  customerId,
  from,
  to,
  page = 1,
  limit = 20,
} = {}) {
  const cacheKey = `orders:${tenantId}:${JSON.stringify({ status, orderType, customerId, from, to, page, limit })}`

  return getOrSet(cacheKey, async () => {
    const where = { tenantId }
    if (status)     where.status    = status
    if (orderType)  where.orderType = orderType
    if (customerId) where.customerId = customerId
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to)   where.date.lte = new Date(to)
    }

    const offset = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, facebookName: true, phonePrimary: true } },
          items: true,
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return { orders, total, page, limit, pages: Math.ceil(total / limit) }
  }, 30) // 30s cache — orders change frequently
}

// ─────────────────────────────────────────────────────────────────────────────
// GET BY ID
// ─────────────────────────────────────────────────────────────────────────────
export async function getOrderById(tenantId, id) {
  return prisma.order.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      table: true,
      items: { orderBy: { kitchenStatus: 'asc' } },
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE ORDER (add/remove items, change discount)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateOrderItems(tenantId, id, {
  items,
  discountAmount,
  notes,
  vatRate = 7,
  vatIncluded = true,
  serviceChargeRate = 0,
}) {
  const existing = await prisma.order.findFirst({
    where: { id, tenantId, status: 'PENDING' },
  })
  if (!existing) throw new Error('Order not found or already closed')

  const effectiveDiscount = discountAmount ?? existing.discountAmount

  const totals = calculateTotals(items, {
    discountAmount: effectiveDiscount,
    vatRate,
    vatIncluded,
    serviceChargeRate,
  })

  const [order] = await prisma.$transaction([
    // Replace all items
    prisma.orderItem.deleteMany({ where: { orderId: id } }),
    prisma.order.update({
      where: { id },
      data: {
        ...totals,
        notes: notes ?? existing.notes,
        items: {
          create: items.map(item => ({
            tenantId,
            productId:  item.productId ?? null,
            name:       item.name,
            qty:        item.qty,
            unitPrice:  item.unitPrice,
            discount:   item.discount ?? 0,
            totalPrice: Math.round(((item.unitPrice * item.qty) - (item.discount ?? 0)) * 100) / 100,
            note:       item.note ?? null,
          })),
        },
      },
      include: { items: true },
    }),
  ])

  await bustOrderCache(tenantId)
  return order
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS PAYMENT — create transaction + update order status (atomic)
// ─────────────────────────────────────────────────────────────────────────────
export async function processPayment(tenantId, id, {
  method,       // CASH | QR | CARD | CREDIT
  amount,       // amount received (for cash change calc)
  cashReceived,
}) {
  const order = await prisma.order.findFirst({
    where: { id, tenantId, status: 'PENDING' },
  })
  if (!order) throw new Error('Order not found or already paid')

  const txId = await generateTransactionId()
  const paidAmount = order.totalAmount

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        transactionId: txId,
        tenantId,
        orderId: id,
        amount: paidAmount,
        type: 'PAYMENT',
        method,
      },
    }),
    prisma.order.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentMethod: method,
        paidAmount,
        cashReceived: cashReceived ?? null,
      },
    }),
    // Free up table if onsite
    ...(order.tableId ? [
      prisma.posTable.update({
        where: { id: order.tableId },
        data: { status: 'CLEANING' },
      }),
    ] : []),
  ])

  await bustOrderCache(tenantId)
  return getOrderById(tenantId, id)
}

// ─────────────────────────────────────────────────────────────────────────────
// VOID ORDER
// ─────────────────────────────────────────────────────────────────────────────
export async function voidOrder(tenantId, id, { voidedBy } = {}) {
  const order = await prisma.order.findFirst({
    where: { id, tenantId, status: 'PENDING' },
  })
  if (!order) throw new Error('Order not found or already closed')

  await prisma.order.update({
    where: { id },
    data: { status: 'VOID', closedById: voidedBy ?? null },
  })

  await bustOrderCache(tenantId)
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY SUMMARY — for POS close-of-day report
// ─────────────────────────────────────────────────────────────────────────────
export async function getDailySummary(tenantId, date = new Date()) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const cacheKey = `orders:${tenantId}:daily:${startOfDay.toISOString().slice(0, 10)}`

  return getOrSet(cacheKey, async () => {
    const [paid, voided, byType] = await Promise.all([
      prisma.order.aggregate({
        where: { tenantId, status: 'PAID', date: { gte: startOfDay, lte: endOfDay } },
        _sum: { totalAmount: true, discountAmount: true, vatAmount: true },
        _count: true,
      }),
      prisma.order.count({
        where: { tenantId, status: 'VOID', date: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.order.groupBy({
        by: ['orderType'],
        where: { tenantId, status: 'PAID', date: { gte: startOfDay, lte: endOfDay } },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ])

    return {
      date: startOfDay.toISOString().slice(0, 10),
      totalRevenue:   paid._sum.totalAmount  ?? 0,
      totalDiscount:  paid._sum.discountAmount ?? 0,
      totalVat:       paid._sum.vatAmount    ?? 0,
      orderCount:     paid._count,
      voidedCount:    voided,
      byType:         byType.reduce((acc, r) => ({ ...acc, [r.orderType]: { total: r._sum.totalAmount, count: r._count } }), {}),
    }
  }, 60)
}

// ─── Backward compat aliases ─────────────────────────────────────────────────
export const getOrders          = (opts) => listOrders(opts?.tenantId, opts)
export const getOrdersByCustomer = ({ tenantId, customerId, limit }) =>
  listOrders(tenantId, { customerId, limit })
export const updateOrderStatus  = (tenantId, id, status) =>
  prisma.order.update({ where: { id, tenantId }, data: { status } })
export const create             = (data) => prisma.order.create({ data })
