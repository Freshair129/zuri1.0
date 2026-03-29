import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * @param {{ tenantId?: string, assigneeId?: string, status?: string, taskType?: string }} filters
 */
export async function findMany(filters = {}, { limit = 50, skip = 0 } = {}) {
  const where = {}
  if (filters.tenantId) where.tenantId = filters.tenantId
  if (filters.assigneeId) where.assigneeId = filters.assigneeId
  if (filters.status) where.status = filters.status
  if (filters.taskType) where.taskType = filters.taskType

  return prisma.task.findMany({
    where,
    take: limit,
    skip,
    orderBy: { dueDate: 'asc' },
  })
}

export async function findById(id) {
  return prisma.task.findUnique({
    where: { id },
  })
}

export async function create(data) {
  return prisma.task.create({ data })
}

export async function update(id, data) {
  return prisma.task.update({
    where: { id },
    data,
  })
}

export async function deleteById(id) {
  return prisma.task.delete({
    where: { id },
  })
}
