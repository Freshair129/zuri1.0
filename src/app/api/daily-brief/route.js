import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getDailyBriefs } from '@/lib/repositories/dailyBriefRepo'

// GET /api/daily-brief - List daily brief summaries (most recent first)
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract pagination and date range filters
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '10')

    // TODO: Call dailyBriefRepo.getDailyBriefs({ tenantId, page, limit })
    const briefs = await getDailyBriefs({ tenantId, page, limit })

    return NextResponse.json({ data: briefs, page, limit })
  } catch (error) {
    console.error('[DailyBrief]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
