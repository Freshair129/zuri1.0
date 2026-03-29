import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * Create an audit log entry.
 *
 * @param {string} actor   - User ID or system identifier performing the action
 * @param {string} action  - Action performed, e.g. 'create', 'update', 'delete'
 * @param {string} target  - Target resource, e.g. 'order:abc123'
 * @param {object} details - Arbitrary payload (stored as JSON)
 */
export async function create(actor, action, target, details = {}) {
  return prisma.auditLog.create({
    data: {
      actor,
      action,
      target,
      details,
      createdAt: new Date(),
    },
  })
}

/**
 * Retrieve audit log entries for a specific actor.
 *
 * @param {string} actor
 * @param {{ limit?: number, skip?: number }} options
 */
export async function findByActor(actor, { limit = 50, skip = 0 } = {}) {
  return prisma.auditLog.findMany({
    where: { actor },
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}
