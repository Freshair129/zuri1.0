import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

// GET /api/tasks - List tasks
export async function GET(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // TODO: Extract filters (assigneeId, status, priority, dueDate, page, limit)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status') // todo | in_progress | done
    const assigneeId = searchParams.get('assigneeId')

    // TODO: Import taskRepo and call getTasks({ tenantId, page, limit, status, assigneeId })
    const tasks = [] // TODO: replace with real data

    return NextResponse.json({ data: tasks, page, limit })
  } catch (error) {
    console.error('[Tasks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // TODO: Validate required fields (title)
    const { title, description, assigneeId, dueDate, priority, relatedCustomerId } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // TODO: Import taskRepo and call createTask({ tenantId, title, ... })
    const task = {} // TODO: replace with real data

    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error) {
    console.error('[Tasks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
