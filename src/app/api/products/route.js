import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

// GET /api/products - List products
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract filters (category, search, page, limit, isActive)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const category = searchParams.get('category')

    // TODO: Import productRepo and call getProducts({ tenantId, page, limit, category })
    const products = [] // TODO: replace with real data

    return NextResponse.json({ data: products, page, limit })
  } catch (error) {
    console.error('[Products]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products - Create a new product
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // TODO: Validate required fields (name, sku, price, unit)
    const { name, sku, price, unit, category, description, imageUrl } = body

    if (!name || price == null) {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 })
    }

    // TODO: Import productRepo and call createProduct({ tenantId, ...fields })
    const product = {} // TODO: replace with real data

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error('[Products]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
