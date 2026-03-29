import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

// POST /api/payments/verify-slip - OCR payment slip image and verify amount
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('slip')
    const expectedAmount = formData.get('amount') // optional: expected amount to validate against
    const orderId = formData.get('orderId')

    if (!imageFile) {
      return NextResponse.json({ error: 'slip image is required' }, { status: 400 })
    }

    // TODO: Upload slip image to temporary storage or convert to base64
    // TODO: Call OCR service (e.g. Google Vision API or Gemini Vision) to extract:
    //   - transferAmount
    //   - transferDate
    //   - senderBank / senderAccount
    //   - recipientBank / recipientAccount
    //   - referenceNumber
    // TODO: Validate extracted amount matches expectedAmount (with tolerance)
    // TODO: Check for duplicate slip submission (same referenceNumber)
    // TODO: If valid, update order payment status via orderRepo.markAsPaid(...)

    const result = {
      verified: false, // TODO: set from OCR validation logic
      extractedAmount: null,
      referenceNumber: null,
      // TODO: populate remaining fields
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[Payments/VerifySlip]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
