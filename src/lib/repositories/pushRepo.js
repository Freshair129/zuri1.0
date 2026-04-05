import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * Save or update a web push subscription
 */
export async function upsertSubscription(tenantId, userId, subscription) {
  const { endpoint, keys } = subscription
  const { p256dh, auth } = keys

  return prisma.webPushSubscription.upsert({
    where: { endpoint },
    create: {
      tenantId,
      userId,
      endpoint,
      p256dh,
      auth,
      isActive: true,
    },
    update: {
      tenantId,
      userId,
      p256dh,
      auth,
      isActive: true,
      updatedAt: new Date(),
    },
  })
}

/**
 * Get active subscriptions for a specific user
 */
export async function getSubscriptions(tenantId, userId) {
  return prisma.webPushSubscription.findMany({
    where: {
      tenantId,
      userId,
      isActive: true,
    },
  })
}

/**
 * Deactivate a subscription (e.g. on 410 Gone error from push service)
 */
export async function deactivateSubscription(endpoint) {
  return prisma.webPushSubscription.update({
    where: { endpoint },
    data: { isActive: false },
  })
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(endpoint) {
  return prisma.webPushSubscription.delete({
    where: { endpoint },
  })
}
