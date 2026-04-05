import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { withAuth } from '@/lib/auth'
import { findByTenant } from '@/lib/repositories/auditRepo'

export const dynamic = 'force-dynamic'

// GET /api/audit - Get audit logs for the tenant
export const GET = withAuth(async (request) => {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const skip = (page - 1) * limit

    const logs = await findByTenant(tenantId, { action, limit, skip })

    return NextResponse.json({ data: logs, page, limit })
  } catch (error) {
    console.error('[Audit_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, { domain: 'audit', action: 'R' }) // Requires audit read access
