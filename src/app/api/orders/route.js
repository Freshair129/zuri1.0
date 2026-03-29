import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getOrders, createOrder } from '@/lib/repositories/orderRepo'

// GET /api/orders - List orders
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract filters (status, customerId, dateFrom, dateTo, page, limit)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    // TODO: Call orderRepo.getOrders({ tenantId, page, limit, status, customerId })
    const orders = await getOrders({ tenantId, page, limit, status, customerId })

    return NextResponse.json({ data: orders, page, limit })
  } catch (error) {
    console.error('[Orders]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders - Create a new order
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // TODO: Validate required fields (customerId, items[])
    const { customerId, items, note, discountCode, shippingAddress } = body

    if (!customerId || !items?.length) {
      return NextResponse.json({ error: 'customerId and items are required' }, { status: 400 })
    }

    // TODO: Calculate totals, apply discounts, check stock
    // TODO: Call orderRepo.createOrder({ tenantId, customerId, items, ... })
    const order = await createOrder({ tenantId, customerId, items, note, discountCode, shippingAddress })

    // TODO: Optionally enqueue invoice generation via QStash

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error('[Orders]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
