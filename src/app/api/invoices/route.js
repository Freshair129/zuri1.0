import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getOrderById } from '@/lib/repositories/orderRepo'

// POST /api/invoices - Create invoice for an order
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, dueDate, notes } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    // TODO: Fetch order to ensure it belongs to the tenant
    const order = await getOrderById({ tenantId, id: orderId })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // TODO: Generate invoice number (sequential per tenant)
    // TODO: Import invoiceRepo and call createInvoice({ tenantId, orderId, dueDate, notes })
    // TODO: Optionally generate PDF and store in Supabase Storage
    const invoice = {} // TODO: replace with real data

    return NextResponse.json({ data: invoice }, { status: 201 })
  } catch (error) {
    console.error('[Invoices]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
