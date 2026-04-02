import { NextResponse } from 'next/server'
import { verifyQStashSignature } from '@/lib/qstash'
import { getConversations } from '@/lib/repositories/conversationRepo'

// POST /api/workers/daily-brief/process - QStash worker: analyze conversations with Gemini
// Produces a daily brief summary and stores it in DB.
export async function POST(request) {
  // Verify QStash signature — reject all other callers
  const { isValid, body: rawBody } = await verifyQStashSignature(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid QStash signature' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { tenantId, date } = body
    // date: YYYY-MM-DD string for the brief being generated

    if (!tenantId || !date) {
      return NextResponse.json({ error: 'tenantId and date are required' }, { status: 400 })
    }

    // TODO: Fetch all conversations for the given date range (date 00:00 – 23:59 UTC+7)
    const conversations = await getConversations({ tenantId, date })

    // TODO: Build Gemini prompt with:
    //   - Conversation summaries
    //   - Key topics / customer sentiment
    //   - Unresolved issues
    //   - Sales outcomes
    // TODO: const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    // TODO: const result = await model.generateContent(prompt)
    // TODO: Parse structured JSON from Gemini response

    // TODO: Import dailyBriefRepo and call upsertDailyBrief({ tenantId, date, brief })

    // TODO: Enqueue notify worker via QStash to send LINE notification
    // await getQStash().publishJSON({ url: `${process.env.APP_URL}/api/workers/daily-brief/notify`, body: { tenantId, date } })

    return NextResponse.json({ success: true, tenantId, date })
  } catch (error) {
    console.error('[Workers/DailyBrief/Process]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
