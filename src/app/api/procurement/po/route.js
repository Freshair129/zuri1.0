import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import * as poRepo from '@/lib/repositories/poRepo'

// GET /api/procurement/po - List purchase orders
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract filters (status, supplierId, dateFrom, dateTo, page, limit)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status') // draft | pending_approval | approved | received | cancelled

    const supplierId = searchParams.get('supplierId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const result = await poRepo.findMany(tenantId, { status, supplierId, dateFrom, dateTo, page, limit })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Procurement/PO]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/procurement/po - Create a new purchase order
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // TODO: Validate required fields (supplierId, items[])
    const { supplierId, items, expectedDeliveryDate, warehouseId, note } = body

    if (!supplierId || !items?.length) {
      return NextResponse.json({ error: 'supplierId and items are required' }, { status: 400 })
    }

    const { requestedById } = body

    const po = await poRepo.create(tenantId, { supplierId, requestedById, items, warehouseId, expectedDeliveryDate, notes: note })

    return NextResponse.json({ data: po }, { status: 201 })
  } catch (error) {
    console.error('[Procurement/PO]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
