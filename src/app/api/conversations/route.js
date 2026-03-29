import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { getConversations } from '@/lib/repositories/conversationRepo'

// GET /api/conversations - List conversations filtered by tenantId
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract query params (page, limit, status, assigneeId, channel)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status') // open | closed | pending

    // TODO: Call conversationRepo.getConversations({ tenantId, page, limit, status })
    const conversations = await getConversations({ tenantId, page, limit, status })

    return NextResponse.json({ data: conversations, page, limit })
  } catch (error) {
    console.error('[Conversations]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
