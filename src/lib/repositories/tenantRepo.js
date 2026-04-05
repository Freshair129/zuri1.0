import { getPrisma } from '@/lib/db'
import { getOrSet, getRedis } from '@/lib/redis'

const prisma = getPrisma()

import { isMockMode, MOCK_TENANT } from '@/lib/mockMode'


// Cache TTL: 5 min — tenant config rarely changes
const TENANT_CACHE_TTL = 300

/**
 * Get tenant by internal UUID (tenantId from session)
 */
export async function getTenantById(id) {
  if (isMockMode) return MOCK_TENANT
  return getOrSet(`tenant:id:${id}`, async () => {
    return prisma.tenant.findUnique({ where: { id } })
  }, TENANT_CACHE_TTL)
}


/**
 * Get tenant by slug (subdomain: vschool, sakura …)
 */
export async function getTenantBySlug(slug) {
  if (isMockMode) return MOCK_TENANT
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
    // Integration flags (boolean only — never expose tokens via public config)
    hasFbPage:    Boolean(tenant.fbPageId  || tenant.fbPageToken),
    hasLineOa:    Boolean(tenant.lineOaId  || tenant.lineChannelToken),
  }
}

/**
 * Get raw integration tokens for worker use ONLY (bypasses cache — always fresh)
 * DO NOT use in API routes that return data to the client
 */
export async function getTenantTokens(tenantId) {
  const tenant = await getPrisma().tenant.findUnique({
    where:  { id: tenantId },
    select: { fbPageToken: true, lineChannelToken: true, fbPageId: true, lineOaId: true },
  })
  if (!tenant) throw new Error(`Tenant not found: ${tenantId}`)
  return {
    fbPageToken:      tenant.fbPageToken      ?? process.env.FACEBOOK_PAGE_ACCESS_TOKEN ?? null,
    lineChannelToken: tenant.lineChannelToken ?? process.env.LINE_CHANNEL_ACCESS_TOKEN  ?? null,
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
export async function updateTenantIntegrations(tenantId, { fbPageId, lineOaId, fbPageToken, lineChannelToken }) {
  const data = {}
  if (fbPageId          !== undefined) data.fbPageId          = fbPageId          || null
  if (lineOaId          !== undefined) data.lineOaId          = lineOaId          || null
  if (fbPageToken       !== undefined) data.fbPageToken       = fbPageToken       || null
  if (lineChannelToken  !== undefined) data.lineChannelToken  = lineChannelToken  || null

  if (Object.keys(data).length === 0) return null

  const existing = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!existing) throw new Error('Tenant not found')

  const updated = await prisma.tenant.update({ where: { id: tenantId }, data })

  // Bust Redis cache (all 3 key patterns)
  await Promise.all([
    getRedis().del(`tenant:id:${tenantId}`),
    getRedis().del(`tenant:slug:${existing.tenantSlug}`),
    getRedis().del(`tenant:${existing.tenantSlug}`),
  ]).catch((err) => console.error('[tenantRepo.updateIntegrations] cache bust failed', err))

  return shapeTenantConfig(updated)
}
