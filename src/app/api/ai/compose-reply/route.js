import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getConversationById } from '@/lib/repositories/conversationRepo'

// POST /api/ai/compose-reply - Use Gemini to draft a reply for a conversation
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, tone, context } = body
    // tone: 'professional' | 'friendly' | 'empathetic' | default

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
    }

    // TODO: Fetch last N messages from conversation for context
    const conversation = await getConversationById({ tenantId, id: conversationId })
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // TODO: Build Gemini prompt with conversation history, customer info, and tone instruction
    // TODO: const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    // TODO: const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    // TODO: const result = await model.generateContent(prompt)
    // TODO: const draft = result.response.text()

    const draft = '' // TODO: replace with Gemini-generated draft

    return NextResponse.json({ data: { draft } })
  } catch (error) {
    console.error('[AI/ComposeReply]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
