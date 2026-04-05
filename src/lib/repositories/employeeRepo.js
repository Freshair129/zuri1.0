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

/**
 * List employees with pagination — alias used by /api/employees GET
 */
export async function getEmployees({ tenantId, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit
  return prisma.employee.findMany({
    where: { tenantId, status: 'ACTIVE' },
    orderBy: { firstName: 'asc' },
    take: limit,
    skip: offset,
  })
}

/**
 * Create a new employee — used by /api/employees POST
 */
export async function createEmployee({ tenantId, name, email, role, phone, lineId }) {
  const bcrypt = await import('bcryptjs')
  const { generateEmployeeId } = await import('@/lib/idGenerator')

  const [firstName, ...rest] = (name ?? '').trim().split(' ')
  const lastName = rest.join(' ') || '-'
  const department = 'GEN'
  const employmentType = 'EMP'

  const employeeId = await generateEmployeeId(department, employmentType)
  const passwordHash = await bcrypt.hash(`${email}_changeme`, 10)

  return prisma.employee.create({
    data: {
      employeeId,
      tenantId,
      firstName,
      lastName,
      email,
      phone: phone ?? null,
      role: role ?? 'STF',
      roles: [role ?? 'STF'],
      passwordHash,
      status: 'ACTIVE',
    },
  })
}

export async function updateEmployee(tenantId, id, data) {
  const employee = await findById(tenantId, id)
  if (!employee) throw new Error('Employee not found or access denied')

  // Handle roles specifically if role is updated, also update the Array
  const updateData = { ...data }
  if (updateData.role && !updateData.roles) {
    updateData.roles = [updateData.role]
  }

  return prisma.employee.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteEmployee(tenantId, id) {
  const employee = await findById(tenantId, id)
  if (!employee) throw new Error('Employee not found or access denied')

  return prisma.employee.update({
    where: { id },
    data: { status: 'INACTIVE' },
  })
}

