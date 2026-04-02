import { NextResponse } from 'next/server'
import { getTenantSlug, resolveTenantBySlug } from '@/lib/tenant'

export async function GET(request) {
  try {
    const slug = getTenantSlug(request)
    const tenant = await resolveTenantBySlug(slug)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Return only public branding/config info
    return NextResponse.json({
      data: {
        id: tenant.id,
        name: tenant.tenantName,
        slug: tenant.tenantSlug,
        plan: tenant.plan,
        config: tenant.config || {},
      }
    })
  } catch (error) {
    console.error('[Tenant/Config]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
