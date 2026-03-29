import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

// GET /api/tasks/[id] - Get single task detail
export async function GET(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // TODO: Import taskRepo and call getTaskById({ tenantId, id })
    const task = null // TODO: replace with real data
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ data: task })
  } catch (error) {
    console.error('[Tasks/Detail]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/tasks/[id] - Update task fields
export async function PATCH(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    // TODO: Whitelist updatable fields
    const { title, description, assigneeId, dueDate, priority, status } = body

    // TODO: Import taskRepo and call updateTask({ tenantId, id, ...fields })
    const task = null // TODO: replace with real data
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ data: task })
  } catch (error) {
    console.error('[Tasks/Detail]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete (or archive) a task
export async function DELETE(request, { params }) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // TODO: Import taskRepo and call deleteTask({ tenantId, id })
    // TODO: Consider soft-delete (set isArchived = true) instead of hard delete

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Tasks/Detail]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
