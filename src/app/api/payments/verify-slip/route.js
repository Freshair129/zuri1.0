import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { verifyThaiSlip } from '@/lib/ai/slipVerifier'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/verify-slip
 * Body: { base64Image, mimeType }
 * 
 * Verifies a Thai bank transfer slip using Gemini Vision.
 */
export const POST = withAuth(
  async (request, { session }) => {
    try {
      const { base64Image, mimeType } = await request.json()

      if (!base64Image) {
        return NextResponse.json({ error: 'base64Image is required' }, { status: 400 })
      }

      const result = await verifyThaiSlip(base64Image, mimeType || 'image/jpeg')

      if (!result) {
        return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
      }

      return NextResponse.json({ data: result })
    } catch (error) {
      console.error('[Payments/VerifySlip.POST]', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  },
  { domain: 'orders', action: 'W' }
)
