import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getCustomerById } from '@/lib/repositories/customerRepo'
import { getOrdersByCustomer } from '@/lib/repositories/orderRepo'

// POST /api/ai/promo-advisor - Gemini-powered promotion intelligence for a customer
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, currentCart, availablePromotions } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
    }

    // TODO: Fetch customer profile and order history for context
    const customer = await getCustomerById({ tenantId, id: customerId })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const orders = await getOrdersByCustomer({ tenantId, customerId })

    // TODO: Build Gemini prompt with:
    //   - Customer purchase history and segments
    //   - Current cart contents
    //   - Available promotions list
    //   - Instruction to recommend best promotions and explain why
    // TODO: const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    // TODO: const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    // TODO: const result = await model.generateContent(prompt)

    const recommendations = [] // TODO: parse Gemini response into structured recommendations

    return NextResponse.json({ data: { recommendations } })
  } catch (error) {
    console.error('[AI/PromoAdvisor]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
