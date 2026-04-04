import { getPrisma } from '@/lib/db'
import { getOrSet, getRedis } from '@/lib/redis'

const prisma = getPrisma()

// Cache TTL: 5 min — tenant config rarely changes
const TENANT_CACHE_TTL = 300

/**
 * Get tenant by internal UUID (tenantId from session)
 */
export async function getTenantById(id) {
  return getOrSet(`tenant:id:${id}`, async () => {
    return prisma.tenant.findUnique({ where: { id } })
  }, TENANT_CACHE_TTL)
}

/**
 * Get tenant by slug (subdomain: vschool, sakura …)
 */
export async function getTenantBySlug(slug) {
  return getOrSet(`tenant:slug:${slug}`, async () => {
    return prisma.tenant.findUnique({ where: { tenantSlug: slug } })
  }, TENANT_CACHE_TTL)
}

/**
 * Shape a Tenant record into a safe public config object
 * (no internal IDs, just branding + integration flags)
 */
export function shapeTenantConfig(tenant) {
  if (!tenant) return null
  const config = tenant.config ?? {}
  return {
    id:        tenant.id,
    name:      tenant.tenantName,
    slug:      tenant.tenantSlug,
    plan:      tenant.plan,
    isActive:  tenant.isActive,
    // Branding
    brandColor: config.brandColor ?? '#6366f1',
    logoUrl:    config.logoUrl    ?? null,
    // Locale
    vatRate:    config.vatRate    ?? 7,
    currency:   config.currency   ?? 'THB',
    timezone:   config.timezone   ?? 'Asia/Bangkok',
    // Integration flags (boolean only — never expose tokens)
    hasFbPage:    Boolean(tenant.fbPageId),
    hasLineOa:    Boolean(tenant.lineOaId),
  }
}

/**
 * Update per-tenant config JSON (branding, locale)
 * Only whitelisted keys are accepted — never let callers overwrite full JSON
 *
 * Allowed: brandColor, logoUrl, vatRate, currency, timezone
 */
export async function updateTenantConfig(tenantId, updates) {
  const ALLOWED_KEYS = ['brandColor', 'logoUrl', 'vatRate', 'currency', 'timezone']

  // Sanitise — only allow whitelisted keys
  const safe = Object.fromEntries(
    Object.entries(updates).filter(([k]) => ALLOWED_KEYS.includes(k))
  )

  if (Object.keys(safe).length === 0) {
    throw new Error('No valid config keys provided')
  }

  // Merge into existing config (not replace)
  const existing = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!existing) throw new Error('Tenant not found')

  const merged = { ...(existing.config ?? {}), ...safe }

  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data:  { config: merged, updatedAt: new Date() },
  })

  // Bust Redis cache
  await Promise.all([
    getRedis().del(`tenant:id:${tenantId}`),
    getRedis().del(`tenant:slug:${existing.tenantSlug}`),
    getRedis().del(`tenant:${existing.tenantSlug}`),  // legacy key from tenant.js
  ]).catch((err) => console.error('[tenantRepo.updateConfig] cache bust failed', err))

  return shapeTenantConfig(updated)
}

/**
 * Update integration fields (fbPageId, lineOaId)
 * OWNER only — called from Settings > Integrations
 */
export async function updateTenantIntegrations(tenantId, { fbPageId, lineOaId }) {
  const data = {}
  if (fbPageId !== undefined) data.fbPageId   = fbPageId || null
  if (lineOaId !== undefined) data.lineOaId   = lineOaId || null

  if (Object.keys(data).length === 0) return null

  const updated = await prisma.tenant.update({ where: { id: tenantId }, data })

  // Bust Redis cache
  await getRedis().del(`tenant:id:${tenantId}`)
    .catch((err) => console.error('[tenantRepo.updateIntegrations] cache bust failed', err))

  return shapeTenantConfig(updated)
}
