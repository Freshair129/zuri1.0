import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import * as inventoryRepo from '@/lib/repositories/inventoryRepo'

export const dynamic = 'force-dynamic'

// GET /api/inventory/stock - Get current stock levels by warehouse
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract filters (warehouseId, productId, lowStockOnly)
    const warehouseId = searchParams.get('warehouseId')
    const productId = searchParams.get('productId')
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true'

    const stock = await inventoryRepo.getStockLevels(tenantId, { warehouseId, productId, lowStockOnly })

    return NextResponse.json({ data: stock })
  } catch (error) {
    console.error('[Inventory/Stock]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
