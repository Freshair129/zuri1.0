import { getOrSet } from '@/lib/redis'
import { getPrisma } from '@/lib/db'

const V_SCHOOL_TENANT_ID = '10000000-0000-0000-0000-000000000001'
const V_SCHOOL_SLUG = 'vschool'

/**
 * Get tenantId from request headers (set by middleware)
 */
export function getTenantId(req) {
  return req.headers.get('x-tenant-id') || V_SCHOOL_TENANT_ID
}

/**
 * Get tenant slug from request headers
 */
export function getTenantSlug(req) {
  return req.headers.get('x-tenant-slug') || V_SCHOOL_SLUG
}

/**
 * Resolve tenant by slug (cached in Redis for 5 min)
 */
export async function resolveTenantBySlug(slug) {
  return getOrSet(`tenant:${slug}`, async () => {
    const prisma = getPrisma()
    return prisma.tenant.findUnique({
      where: { tenantSlug: slug },
    })
  }, 300)
}
