import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function findMany(tenantId, { channel, status, limit = 50, offset = 0 } = {}) {
  const where = { tenantId }
  if (channel) where.channel = channel
  if (status) where.status = status

  return prisma.conversation.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { updatedAt: 'desc' },
    include: {
      customer: { 
        select: { 
          id: true, 
          facebookName: true, 
          phonePrimary: true, 
          lifecycleStage: true,
          intentScore: true,
          churnScore: true,
          insight: true
        } 
      },
      messages: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function findByConversationId(conversationId) {
  return prisma.conversation.findUnique({
    where: { conversationId },
    include: { 
      customer: {
        include: { insight: true }
      } 
    },
  })
}

export async function upsertConversation(tenantId, conversationId, data) {
  return prisma.conversation.upsert({
    where: { conversationId },
    create: { ...data, tenantId, conversationId },
    update: data,
  })
}

/**
 * Get the latest N messages for a customer across all their conversations
 */
export async function getCustomerMessages(tenantId, customerId, limit = 30) {
  return prisma.message.findMany({
    where: {
      conversation: {
        tenantId,
        customerId,
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}
