import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * List conversations for inbox (with last message preview)
 */
export async function findMany(tenantId, { channel, status, limit = 50, offset = 0 } = {}) {
  const where = { tenantId }
  if (channel) where.channel = channel
  if (status)  where.status  = status

  return prisma.conversation.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { updatedAt: 'desc' },
    include: {
      customer: {
        select: {
          id: true,
          customerId: true,
          facebookName: true,
          phonePrimary: true,
          lifecycleStage: true,
          intentScore: true,
          churnScore: true,
          intelligence: true,
        },
      },
      messages: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  })
}

/**
 * Legacy — used by DSB worker
 */
export async function getConversations({ tenantId, date, limit = 50, offset = 0 } = {}) {
  const where = { tenantId }

  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    where.createdAt = { gte: start, lte: end }
  }

  return prisma.conversation.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { updatedAt: 'desc' },
    include: {
      customer: true,
      messages: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  })
}

/**
 * Find by external platform conversationId (PSID thread / LINE userId)
 */
export async function findByConversationId(conversationId) {
  return prisma.conversation.findUnique({
    where: { conversationId },
    include: {
      customer: { include: { insight: true } },
    },
  })
}

/**
 * Find by internal UUID (tenantId-scoped for security)
 */
export async function getConversationById({ tenantId, id }) {
  return prisma.conversation.findFirst({
    where: { id, tenantId },
    include: {
      customer: { include: { insight: true } },
    },
  })
}

/**
 * Upsert conversation — called by webhook inbound handlers
 */
export async function upsertConversation(tenantId, conversationId, data) {
  return prisma.conversation.upsert({
    where: { conversationId },
    create: { ...data, tenantId, conversationId },
    update: { ...data, updatedAt: new Date() },
  })
}

/**
 * Get messages for a conversation (ordered oldest → newest)
 * @param {string} conversationId  — internal UUID (Conversation.id)
 * @param {number} limit
 */
export async function getMessages(conversationId, limit = 50) {
  return prisma.message.findMany({
    where: { conversationId },
    take: limit,
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Append a single message to a conversation
 * @param {string} conversationId  — internal UUID (Conversation.id)
 */
export async function appendMessage({ conversationId, message, direction = 'outbound', responderId = null, externalMessageId = null }) {
  const messageId = externalMessageId ?? `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  return prisma.message.create({
    data: {
      messageId,
      conversationId,
      sender: direction === 'outbound' ? 'staff' : 'customer',
      content: message ?? null,
      responderId,
    },
  })
}

/**
 * Get the latest N messages for a customer across all their conversations
 */
export async function getCustomerMessages(tenantId, customerId, limit = 30) {
  return prisma.message.findMany({
    where: {
      conversation: { tenantId, customerId },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Upsert customer by facebookId — called by Facebook webhook
 */
export async function upsertFacebookCustomer(tenantId, { psid, name }) {
  const { generateCustomerId } = await import('@/lib/idGenerator')
  return prisma.customer.upsert({
    where: { facebookId: psid },
    create: {
      customerId:   await generateCustomerId('FB'),
      tenantId,
      facebookId:   psid,
      facebookName: name ?? null,
      lifecycleStage: 'LEAD',
    },
    update: {
      facebookName: name ?? undefined,
    },
  })
}

/**
 * Upsert customer by lineId — called by LINE webhook
 * Note: lineId is not @unique in schema → findFirst + create pattern (G-WH-02)
 */
export async function upsertLineCustomer(tenantId, { lineUserId, displayName }) {
  const { generateCustomerId } = await import('@/lib/idGenerator')
  const existing = await prisma.customer.findFirst({
    where: { tenantId, lineId: lineUserId },
  })
  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: { facebookName: displayName ?? undefined },
    })
  }
  return prisma.customer.create({
    data: {
      customerId:     await generateCustomerId('LINE'),
      tenantId,
      lineId:         lineUserId,
      facebookName:   displayName ?? null,
      lifecycleStage: 'LEAD',
    },
  })
}
