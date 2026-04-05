import { getPrisma } from '@/lib/db'
import { generateTaskId } from '@/lib/idGenerator'
import { getOrSet } from '@/lib/redis'

const prisma = getPrisma()

export async function listTasks(tenantId, filters = {}, { limit = 50, skip = 0 } = {}) {
  const where = { tenantId }

  if (filters.assigneeId) where.assigneeId = filters.assigneeId
  if (filters.status) where.status = filters.status
  if (filters.type) where.type = filters.type
  if (filters.priority) where.priority = filters.priority

  // Search by title or description
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      take: limit,
      skip,
      orderBy: { dueDate: 'asc' }, // usually sorting by due date makes sense for tasks
    }),
    prisma.task.count({ where })
  ])

  return { data: tasks, meta: { total, limit, skip } }
}

export async function getTaskById(tenantId, id) {
  return prisma.task.findFirst({
    where: { id, tenantId },
  })
}

export async function createTask(tenantId, data) {
  const taskId = await generateTaskId()
  
  return prisma.task.create({
    data: {
      ...data,
      taskId,
      tenantId,
    }
  })
}

export async function updateTask(tenantId, id, data) {
  const task = await prisma.task.findFirst({
    where: { id, tenantId }
  })

  if (!task) {
    throw new Error('Task not found or access denied')
  }

  // update completedAt automatically if status changes to COMPLETED
  if (data.status === 'COMPLETED' && task.status !== 'COMPLETED') {
    data.completedAt = new Date()
  } else if (data.status && data.status !== 'COMPLETED') {
    data.completedAt = null
  }

  return prisma.task.update({
    where: { id },
    data,
  })
}

export async function deleteTask(tenantId, id) {
  const task = await prisma.task.findFirst({
    where: { id, tenantId }
  })

  if (!task) {
    throw new Error('Task not found or access denied')
  }

  return prisma.task.delete({
    where: { id }
  })
}
