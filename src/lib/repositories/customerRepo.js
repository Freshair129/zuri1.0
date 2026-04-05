/**
 * customerRepo — CRM customer data access layer (FEAT05-CRM)
 *
 * All functions receive tenantId as first param (multi-tenant isolation, ADR-056).
 * Redis cache: list 60s (key crm:list:{tenantId}:{hash}), detail 60s.
 * Soft delete only — no hard deletes (NFR-CRM-7).
 */

import { getPrisma } from '@/lib/db'
import { getOrSet, redis } from '@/lib/redis'
import { generateCustomerId } from '@/lib/idGenerator'

const prisma = getPrisma()

// ─── Phone Normalization ─────────────────────────────────────────────────────
// Converts Thai mobile numbers to E.164 (+66XXXXXXXXX)
// NFR-CRM gotcha: always normalize before save/match to prevent duplicates
export function normalizePhone(raw) {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('66') && digits.length === 11) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+66${digits.slice(1)}`
  if (digits.length === 9) return `+66${digits}` // already stripped leading 0
  return raw // unrecognized format — return as-is (validator should catch)
}

// ─── Display Name Helper ──────────────────────────────────────────────────────
// Priority: name > facebookName > lineName (from lineId) > fallback
function displayName(c) {
  return c.name ?? c.facebookName ?? 'ลูกค้า'
}

// ─── Redis cache helpers ──────────────────────────────────────────────────────
async function bustListCache(tenantId) {
  try {
    // Bust all list cache keys for this tenant via scan
    const keys = await redis.keys(`crm:list:${tenantId}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (err) {
    console.error('[customerRepo] bustListCache error', err)
  }
}

async function bustDetailCache(tenantId, id) {
  try {
    await redis.del(`crm:detail:${tenantId}:${id}`)
  } catch (err) {
    console.error('[customerRepo] bustDetailCache error', err)
  }
}

// Simple hash of filter object for cache key
function hashFilters(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 24)
}

// ─── Base where clause ────────────────────────────────────────────────────────
function baseWhere(tenantId) {
  return { tenantId, deletedAt: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST — paginated, filtered, cached (NFR-CRM-1: < 500ms)
// ─────────────────────────────────────────────────────────────────────────────
export async function listCustomers(tenantId, {
  page = 1,
  limit = 20,
  search,
  stage,      // single stage string or array
  tags,       // array of tag strings (AND match — must have all)
  channel,    // 'facebook' | 'line' | 'both'
  assigneeId,
  from,       // createdAt >= from (ISO string)
  to,         // createdAt <= to (ISO string)
} = {}) {
  const filters = { page, limit, search, stage, tags, channel, assigneeId, from, to }
  const cacheKey = `crm:list:${tenantId}:${hashFilters(filters)}`

  return getOrSet(cacheKey, async () => {
    const where = {
      ...baseWhere(tenantId),
    }

    if (search) {
      where.OR = [
        { name:         { contains: search, mode: 'insensitive' } },
        { facebookName: { contains: search, mode: 'insensitive' } },
        { phonePrimary: { contains: search } },
        { email:        { contains: search, mode: 'insensitive' } },
      ]
    }

    if (stage) {
      where.lifecycleStage = Array.isArray(stage)
        ? { in: stage }
        : stage
    }

    if (tags && tags.length > 0) {
      // Customer must have ALL requested tags (AND semantics)
      where.tags = { hasEvery: tags }
    }

    if (channel === 'facebook') where.facebookId = { not: null }
    if (channel === 'line')     where.lineId      = { not: null }

    if (assigneeId) where.assigneeId = assigneeId

    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to)   where.createdAt.lte = new Date(to)
    }

    const offset = (page - 1) * limit

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          customerId: true,
          name: true,
          facebookName: true,
          phonePrimary: true,
          email: true,
          lifecycleStage: true,
          tags: true,
          facebookId: true,
          lineId: true,
          assigneeId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.customer.count({ where }),
    ])

    return {
      customers: customers.map(c => ({ ...c, displayName: displayName(c) })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }, 60)
}

// Alias for backward compat
export const getCustomers = (opts) => listCustomers(opts?.tenantId, opts)

// ─────────────────────────────────────────────────────────────────────────────
// GET BY ID — with full relations, cached (NFR-CRM-2: < 800ms)
// ─────────────────────────────────────────────────────────────────────────────
export async function getCustomerById(tenantId, id) {
  const cacheKey = `crm:detail:${tenantId}:${id}`
  return getOrSet(cacheKey, async () => {
    const customer = await prisma.customer.findFirst({
      where: { id, ...baseWhere(tenantId) },
      include: {
        profile: true,
        insight: true,
        enrollments: {
          take: 5,
          orderBy: { enrolledAt: 'desc' },
          include: { product: true },
        },
        _count: {
          select: { orders: true, enrollments: true, conversations: true },
        },
      },
    })
    if (!customer) return null
    return { ...customer, displayName: displayName(customer) }
  }, 60)
}

export const findById = getCustomerById  // alias

// ─────────────────────────────────────────────────────────────────────────────
// CREATE — phone normalization + CUST-ID generation + activity log
// ─────────────────────────────────────────────────────────────────────────────
export async function createCustomer(tenantId, {
  name,
  phone,
  email,
  lineId,
  facebookId,
  facebookName,
  tags = [],
  notes,
  assigneeId,
  lifecycleStage = 'NEW',
}) {
  const customerId = await generateCustomerId(lineId ? 'LINE' : facebookId ? 'FB' : 'WEB')
  const phonePrimary = normalizePhone(phone)

  const customer = await prisma.customer.create({
    data: {
      customerId,
      tenantId,
      name:          name ?? null,
      facebookName:  facebookName ?? null,
      facebookId:    facebookId ?? null,
      lineId:        lineId ?? null,
      email:         email ?? null,
      phonePrimary,
      tags,
      assigneeId:    assigneeId ?? null,
      lifecycleStage,
      intelligence:  notes ? { notes } : undefined,
    },
  })

  await bustListCache(tenantId)
  return { ...customer, displayName: displayName(customer) }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE — whitelist fields, phone normalization, cache bust
// ─────────────────────────────────────────────────────────────────────────────
export async function updateCustomer(tenantId, id, data) {
  const { profile: profileData, ...rest } = data

  const customerData = {}
  if (rest.name        !== undefined) customerData.name        = rest.name
  if (rest.facebookName !== undefined) customerData.facebookName = rest.facebookName
  if (rest.email       !== undefined) customerData.email       = rest.email
  if (rest.status      !== undefined) customerData.status      = rest.status
  if (rest.assigneeId  !== undefined) customerData.assigneeId  = rest.assigneeId
  if (rest.phone || rest.phonePrimary) {
    customerData.phonePrimary = normalizePhone(rest.phone ?? rest.phonePrimary)
  }
  // Note: lifecycleStage should go through transitionStage() — not direct update
  // unless caller is internal (webhook upsert, etc.)
  if (rest.lifecycleStage !== undefined) customerData.lifecycleStage = rest.lifecycleStage

  const updated = await prisma.customer.update({
    where: { id, tenantId },
    data: {
      ...customerData,
      ...(profileData && {
        profile: {
          upsert: {
            create: { ...profileData },
            update: profileData,
          },
        },
      }),
    },
    include: { profile: true },
  })

  await Promise.all([bustListCache(tenantId), bustDetailCache(tenantId, id)])
  return { ...updated, displayName: displayName(updated) }
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE
// ─────────────────────────────────────────────────────────────────────────────
export async function softDeleteCustomer(tenantId, id) {
  const deleted = await prisma.customer.update({
    where: { id, tenantId },
    data: { deletedAt: new Date() },
  })
  await Promise.all([bustListCache(tenantId), bustDetailCache(tenantId, id)])
  return deleted
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE TRANSITION — atomic: update stage + write history (NFR5 transaction)
// ─────────────────────────────────────────────────────────────────────────────
export async function transitionStage(tenantId, id, toStage, { changedBy, note } = {}) {
  const current = await prisma.customer.findFirst({
    where: { id, ...baseWhere(tenantId) },
    select: { lifecycleStage: true },
  })
  if (!current) throw new Error('Customer not found')

  const [customer] = await prisma.$transaction([
    prisma.customer.update({
      where: { id, tenantId },
      data: { lifecycleStage: toStage, updatedAt: new Date() },
    }),
    prisma.customerStageHistory.create({
      data: {
        tenantId,
        customerId: id,
        fromStage: current.lifecycleStage,
        toStage,
        changedBy: changedBy ?? null,
        note: note ?? null,
      },
    }),
    prisma.customerActivity.create({
      data: {
        tenantId,
        customerId: id,
        type: 'STAGE_CHANGE',
        payload: { from: current.lifecycleStage, to: toStage, note },
        actorId: changedBy ?? null,
      },
    }),
  ])

  await Promise.all([bustListCache(tenantId), bustDetailCache(tenantId, id)])
  return customer
}

// ─────────────────────────────────────────────────────────────────────────────
// TAGS
// ─────────────────────────────────────────────────────────────────────────────
export async function addTag(tenantId, id, tag) {
  const customer = await prisma.customer.findFirst({
    where: { id, ...baseWhere(tenantId) },
    select: { tags: true },
  })
  if (!customer) throw new Error('Customer not found')

  const newTags = Array.from(new Set([...customer.tags, tag]))
  const updated = await prisma.customer.update({
    where: { id, tenantId },
    data: { tags: newTags },
  })

  await prisma.customerActivity.create({
    data: {
      tenantId,
      customerId: id,
      type: 'TAG_CHANGE',
      payload: { action: 'add', tag },
    },
  })

  await Promise.all([bustListCache(tenantId), bustDetailCache(tenantId, id)])
  return updated.tags
}

export async function removeTag(tenantId, id, tag) {
  const customer = await prisma.customer.findFirst({
    where: { id, ...baseWhere(tenantId) },
    select: { tags: true },
  })
  if (!customer) throw new Error('Customer not found')

  const newTags = customer.tags.filter(t => t !== tag)
  const updated = await prisma.customer.update({
    where: { id, tenantId },
    data: { tags: newTags },
  })

  await prisma.customerActivity.create({
    data: {
      tenantId,
      customerId: id,
      type: 'TAG_CHANGE',
      payload: { action: 'remove', tag },
    },
  })

  await Promise.all([bustListCache(tenantId), bustDetailCache(tenantId, id)])
  return updated.tags
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY TIMELINE (NFR-CRM-2: < 800ms, no cache — real-time data)
// ─────────────────────────────────────────────────────────────────────────────
export async function getTimeline(tenantId, customerId, { type, page = 1, limit = 20 } = {}) {
  const where = { tenantId, customerId }
  if (type) where.type = type

  const offset = (page - 1) * limit

  const [activities, total] = await Promise.all([
    prisma.customerActivity.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customerActivity.count({ where }),
  ])

  return { activities, total, page, limit, pages: Math.ceil(total / limit) }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPSERT BY FACEBOOK ID — used by webhook (conversationRepo)
// ─────────────────────────────────────────────────────────────────────────────
export async function upsertByFacebookId(tenantId, facebookId, data) {
  const result = await prisma.customer.upsert({
    where: { facebookId },
    create: {
      ...data,
      tenantId,
      facebookId,
      customerId: data.customerId ?? await generateCustomerId('FB'),
      lifecycleStage: 'NEW',
    },
    update: data,
  })
  await bustListCache(tenantId)
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// UPSERT BY LINE ID — used by LINE webhook (lineId is NOT @unique, see G-WH-02)
// ─────────────────────────────────────────────────────────────────────────────
export async function upsertByLineId(tenantId, lineId, data) {
  const existing = await prisma.customer.findFirst({
    where: { tenantId, lineId },
  })

  const result = existing
    ? await prisma.customer.update({ where: { id: existing.id }, data })
    : await prisma.customer.create({
        data: {
          ...data,
          tenantId,
          lineId,
          customerId: data.customerId ?? await generateCustomerId('LINE'),
          lifecycleStage: 'NEW',
        },
      })

  await bustListCache(tenantId)
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGE — move relations to primary, soft-delete secondary (NFR-CRM-6)
// ─────────────────────────────────────────────────────────────────────────────
export async function mergeCustomers(tenantId, primaryId, secondaryId) {
  const [primary, secondary] = await Promise.all([
    prisma.customer.findFirst({ where: { id: primaryId,   ...baseWhere(tenantId) } }),
    prisma.customer.findFirst({ where: { id: secondaryId, ...baseWhere(tenantId) } }),
  ])
  if (!primary)   throw new Error('Primary customer not found')
  if (!secondary) throw new Error('Secondary customer not found')

  await prisma.$transaction([
    // Move all relations to primary
    prisma.conversation.updateMany({ where: { customerId: secondaryId }, data: { customerId: primaryId } }),
    prisma.order.updateMany(       { where: { customerId: secondaryId }, data: { customerId: primaryId } }),
    prisma.enrollment.updateMany(  { where: { customerId: secondaryId }, data: { customerId: primaryId } }),
    // Merge tags (union)
    prisma.customer.update({
      where: { id: primaryId },
      data: { tags: Array.from(new Set([...primary.tags, ...secondary.tags])) },
    }),
    // Soft-delete secondary with merge reference
    prisma.customer.update({
      where: { id: secondaryId },
      data: { deletedAt: new Date(), mergedInto: primaryId },
    }),
    // Log activity
    prisma.customerActivity.create({
      data: {
        tenantId,
        customerId: primaryId,
        type: 'NOTE',
        payload: { action: 'merge', mergedFrom: secondaryId },
      },
    }),
  ])

  await Promise.all([
    bustListCache(tenantId),
    bustDetailCache(tenantId, primaryId),
    bustDetailCache(tenantId, secondaryId),
  ])

  return getCustomerById(tenantId, primaryId)
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI STATS — for CRM dashboard cards
// ─────────────────────────────────────────────────────────────────────────────
export async function getKpiStats(tenantId) {
  const cacheKey = `crm:kpi:${tenantId}`
  return getOrSet(cacheKey, async () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [total, newThisMonth, enrolled, paid] = await Promise.all([
      prisma.customer.count({ where: baseWhere(tenantId) }),
      prisma.customer.count({ where: { ...baseWhere(tenantId), createdAt: { gte: startOfMonth } } }),
      prisma.customer.count({ where: { ...baseWhere(tenantId), lifecycleStage: 'ENROLLED' } }),
      prisma.customer.count({ where: { ...baseWhere(tenantId), lifecycleStage: 'PAID' } }),
    ])

    return { total, newThisMonth, enrolled, paid }
  }, 60)
}
