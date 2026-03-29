import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

// POST /api/procurement/po/[id]/grn - Record goods received note (GRN) for a PO
// This triggers stock-in movements for each received item.
export async function POST(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { receivedItems, warehouseId, receivedAt, note } = body
    // receivedItems: [{ productId, qtyReceived, unitCost }]

    if (!receivedItems?.length || !warehouseId) {
      return NextResponse.json({ error: 'receivedItems and warehouseId are required' }, { status: 400 })
    }

    // TODO: Import poRepo and call getPurchaseOrderById({ tenantId, id })
    const po = null // TODO: replace with real data
    if (!po) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    // TODO: Validate PO is in approved status
    // TODO: For each receivedItem, create a stock movement (type: 'in') via inventoryRepo
    // TODO: Update PO received quantities via poRepo.recordGRN(...)
    // TODO: If all items fully received, update PO status to 'received'
    // TODO: Update average cost if using weighted average costing

    return NextResponse.json({ success: true, poId: id })
  } catch (error) {
    console.error('[Procurement/PO/GRN]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
