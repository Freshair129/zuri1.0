import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getConversationById, appendMessage } from '@/lib/repositories/conversationRepo'

// POST /api/conversations/[id]/reply - Send reply via FB Messenger or LINE
export async function POST(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { message, attachments } = body

    if (!message && !attachments?.length) {
      return NextResponse.json({ error: 'message or attachments required' }, { status: 400 })
    }

    // TODO: Fetch conversation to determine channel (facebook | line)
    const conversation = await getConversationById({ tenantId, id })
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // TODO: Route to correct platform client based on conversation.channel
    // if (conversation.channel === 'facebook') { await fbClient.sendMessage(...) }
    // if (conversation.channel === 'line') { await lineClient.replyMessage(...) }

    // TODO: Append outbound message to DB via conversationRepo.appendMessage(...)
    await appendMessage({ tenantId, conversationId: id, message, direction: 'outbound' })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Conversations/Reply]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
