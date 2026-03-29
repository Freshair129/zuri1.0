import { NextResponse } from 'next/server'
import { verifyQStashSignature } from '@/lib/qstash'
import { getDailyBriefByDate } from '@/lib/repositories/dailyBriefRepo'

// POST /api/workers/daily-brief/notify - QStash worker: send daily brief via LINE notification
export async function POST(request) {
  // Verify QStash signature — reject all other callers
  const isValid = await verifyQStashSignature(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid QStash signature' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { tenantId, date } = body

    if (!tenantId || !date) {
      return NextResponse.json({ error: 'tenantId and date are required' }, { status: 400 })
    }

    // TODO: Fetch the processed daily brief for this date
    const brief = await getDailyBriefByDate({ tenantId, date })
    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }

    // TODO: Load tenant LINE Notify token or LINE Bot credentials from systemConfig
    // TODO: Format brief into LINE Flex Message or plain text
    // TODO: Send to designated LINE group/user via LINE Messaging API
    //   POST https://api.line.me/v2/bot/message/push
    //   or LINE Notify: POST https://notify-api.line.me/api/notify

    return NextResponse.json({ success: true, tenantId, date })
  } catch (error) {
    console.error('[Workers/DailyBrief/Notify]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
