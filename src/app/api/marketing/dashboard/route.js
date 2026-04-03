import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getCampaignMetrics } from '@/lib/repositories/campaignRepo'

export const dynamic = 'force-dynamic'

// GET /api/marketing/dashboard - Return ads metrics from DB (NOT live Graph API)
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract date range filters
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const campaignId = searchParams.get('campaignId')

    // Read from DB — never call Meta Graph API directly here
    // TODO: Call campaignRepo.getCampaignMetrics({ tenantId, dateFrom, dateTo, campaignId })
    const metrics = await getCampaignMetrics({ tenantId, dateFrom, dateTo, campaignId })

    // TODO: Aggregate spend, impressions, clicks, leads, CPL, ROAS
    const dashboard = {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalLeads: 0,
      cpl: 0,
      roas: 0,
      campaigns: metrics,
      // TODO: populate from real aggregated data
    }

    return NextResponse.json({ data: dashboard })
  } catch (error) {
    console.error('[Marketing/Dashboard]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
