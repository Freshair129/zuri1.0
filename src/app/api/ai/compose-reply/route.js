import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { withAuth } from '@/lib/auth'
import { getConversationById, getMessages } from '@/lib/repositories/conversationRepo'
import { generateFollowUpDraft } from '@/lib/ai/gemini'

export const dynamic = 'force-dynamic'

// POST /api/ai/compose-reply - Use Gemini to draft a reply for a conversation
export const POST = withAuth(async (request) => {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, tone, contextExtra } = body
    // tone: 'professional' | 'friendly' | 'empathetic' | default

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
    }

    // 1. Fetch conversation and customer info
    const conversation = await getConversationById({ tenantId, id: conversationId })
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // 2. Fetch last 10 messages for context
    const messages = await getMessages(conversationId, 10)
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : ''

    // 3. Use Gemini to generate draft
    const customerName = conversation.customer?.facebookName || conversation.customer?.name || 'Customer'
    const insights = conversation.customer?.insight || {}

    // Add extra context if provided (e.g. "ask about the course price")
    const enhancedInsights = {
      ...insights,
      tone: tone || 'friendly',
      additionalContext: contextExtra || ''
    }

    const draft = await generateFollowUpDraft(customerName, lastMessage, enhancedInsights)

    return NextResponse.json({ data: { draft, conversationId } })
  } catch (error) {
    console.error('[AI/ComposeReply]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, { domain: 'inbox', action: 'R' }) // Requires read access to inbox to draft replies
