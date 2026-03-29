import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

const UNKNOWN = 'UNKNOWN'

export async function findByCustomerId(customerId) {
  return prisma.customerProfile.findUnique({
    where: { customerId },
  })
}

/**
 * Upsert a customer profile, applying merge logic:
 * existing non-UNKNOWN values are never overwritten by UNKNOWN or null.
 *
 * @param {string} customerId
 * @param {object} incoming - Partial profile fields to merge in
 */
export async function upsert(customerId, incoming) {
  const existing = await findByCustomerId(customerId)

  if (!existing) {
    return prisma.customerProfile.create({
      data: { customerId, ...incoming },
    })
  }

  // Merge: only update a field if the incoming value is meaningful
  const merged = {}
  for (const [key, value] of Object.entries(incoming)) {
    const existingValue = existing[key]
    const incomingIsUnknown = value === null || value === undefined || value === UNKNOWN
    const existingIsKnown = existingValue !== null && existingValue !== undefined && existingValue !== UNKNOWN

    if (existingIsKnown && incomingIsUnknown) {
      // Keep the existing known value — do not overwrite with UNKNOWN
      continue
    }

    merged[key] = value
  }

  return prisma.customerProfile.update({
    where: { customerId },
    data: merged,
  })
}
