import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getEmployees, createEmployee } from '@/lib/repositories/employeeRepo'

// GET /api/employees - List employees for the tenant
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract filters (role, isActive, search, page, limit)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    // TODO: Call employeeRepo.getEmployees({ tenantId, page, limit })
    const employees = await getEmployees({ tenantId, page, limit })

    return NextResponse.json({ data: employees, page, limit })
  } catch (error) {
    console.error('[Employees]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/employees - Create a new employee
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // TODO: Validate required fields (name, email, role)
    const { name, email, role, phone, lineId } = body

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'name, email, and role are required' }, { status: 400 })
    }

    // TODO: Call employeeRepo.createEmployee({ tenantId, name, email, role, ... })
    const employee = await createEmployee({ tenantId, name, email, role, phone, lineId })

    return NextResponse.json({ data: employee }, { status: 201 })
  } catch (error) {
    console.error('[Employees]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
