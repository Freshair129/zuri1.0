import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getCustomerById, updateCustomer } from '@/lib/repositories/customerRepo'

// GET /api/customers/[id] - Get customer detail
export async function GET(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // TODO: Call customerRepo.getCustomerById({ tenantId, id })
    const customer = await getCustomerById({ tenantId, id })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('[Customers/Detail]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/customers/[id] - Update customer fields
export async function PATCH(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    // TODO: Validate and whitelist updatable fields
    const { name, phone, email, lineId, tags, notes, stage } = body

    // TODO: Call customerRepo.updateCustomer({ tenantId, id, ...fields })
    const customer = await updateCustomer({ tenantId, id, name, phone, email, lineId, tags, notes, stage })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('[Customers/Detail]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
