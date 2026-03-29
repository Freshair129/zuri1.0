import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

// POST /api/inventory/movements - Record a stock movement (in/out/transfer/adjustment)
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      productId,
      warehouseId,
      type,   // 'in' | 'out' | 'transfer' | 'adjustment' | 'production_consumption'
      qty,
      unit,
      referenceId,   // orderId, poId, scheduleId, etc.
      referenceType, // 'order' | 'po' | 'schedule' | 'manual'
      note,
    } = body

    if (!productId || !warehouseId || !type || qty == null) {
      return NextResponse.json({ error: 'productId, warehouseId, type, and qty are required' }, { status: 400 })
    }

    const validTypes = ['in', 'out', 'transfer', 'adjustment', 'production_consumption']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    // TODO: Import inventoryRepo and call createMovement({ tenantId, ...fields })
    // TODO: Update stock_levels table accordingly (atomic transaction)
    // TODO: Check for negative stock and return error if not allowed
    const movement = {} // TODO: replace with real data

    return NextResponse.json({ data: movement }, { status: 201 })
  } catch (error) {
    console.error('[Inventory/Movements]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
