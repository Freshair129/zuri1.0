import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

// POST /api/procurement/po/[id]/approve - Approve or reject a purchase order
export async function POST(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, note } = body // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
    }

    // TODO: Import poRepo and call getPurchaseOrderById({ tenantId, id })
    const po = null // TODO: replace with real data
    if (!po) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    // TODO: Verify PO is in pending_approval status
    // TODO: Verify requesting user has approval permission (check permissionMatrix)
    // TODO: Update PO status to 'approved' or 'rejected' via poRepo.updatePOStatus(...)
    // TODO: Record approver and timestamp
    // TODO: If approved, optionally notify requestor

    return NextResponse.json({ success: true, poId: id, action })
  } catch (error) {
    console.error('[Procurement/PO/Approve]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
