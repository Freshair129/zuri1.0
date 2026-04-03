import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getCustomers, createCustomer } from '@/lib/repositories/customerRepo'

export const dynamic = 'force-dynamic'

// GET /api/customers - List customers
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract filters (search, tag, page, limit)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const search = searchParams.get('search')

    // TODO: Call customerRepo.getCustomers({ tenantId, page, limit, search })
    const customers = await getCustomers({ tenantId, page, limit, search })

    return NextResponse.json({ data: customers, page, limit })
  } catch (error) {
    console.error('[Customers]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/customers - Create a new customer
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // TODO: Validate required fields (name, phone/email/lineId)
    const { name, phone, email, lineId, tags, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // TODO: Call customerRepo.createCustomer({ tenantId, ...fields })
    const customer = await createCustomer({ tenantId, name, phone, email, lineId, tags, notes })

    return NextResponse.json({ data: customer }, { status: 201 })
  } catch (error) {
    console.error('[Customers]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
