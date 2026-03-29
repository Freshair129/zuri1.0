import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

export async function findByEmail(email) {
  return prisma.employee.findUnique({ where: { email } })
}

export async function findMany(tenantId, { status = 'ACTIVE' } = {}) {
  return prisma.employee.findMany({
    where: { tenantId, status },
    orderBy: { firstName: 'asc' },
  })
}

export async function findById(tenantId, id) {
  return prisma.employee.findFirst({
    where: { id, tenantId },
  })
}
