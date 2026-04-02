import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getCustomerById, updateCustomer } from '@/lib/repositories/customerRepo'
import * as auditRepo from '@/lib/repositories/auditRepo'
import { getSession } from '@/lib/auth'

// GET /api/customers/[id] — Get customer detail
export async function GET(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    const { id } = await params

    const customer = await getCustomerById(tenantId, id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('[Customers/Detail]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/customers/[id] — Update customer fields
export async function PATCH(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // 1. Whitelist fields for Customer model
    const customerUpdates = {}
    if (body.facebookName) customerUpdates.facebookName = body.facebookName
    if (body.phonePrimary) customerUpdates.phonePrimary = body.phonePrimary
    if (body.email) customerUpdates.email = body.email
    if (body.status) customerUpdates.status = body.status
    if (body.lifecycleStage) customerUpdates.lifecycleStage = body.lifecycleStage

    // 2. Profile updates (CustomerProfile)
    if (body.profile) {
      customerUpdates.profile = body.profile
    }

    // 3. Update DB
    const customer = await updateCustomer(tenantId, id, customerUpdates)

    // 4. Create Audit Log
    await auditRepo.create(
      tenantId,
      session.user.name || session.user.email,
      'CUSTOMER_UPDATE',
      id,
      { changes: body }
    )

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('[Customers/Patch]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
