import { getPrisma } from '@/lib/db'

const prisma = getPrisma()

/**
 * Generate sequential ID with format: PREFIX-YYYYMMDD-SERIAL
 * Serial resets daily, zero-padded to `padding` digits
 */
async function generateDailyId(model, field, prefix, padding = 3) {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const pattern = `${prefix}-${dateStr}-`

  const last = await prisma[model].findFirst({
    where: { [field]: { startsWith: pattern } },
    orderBy: { [field]: 'desc' },
    select: { [field]: true },
  })

  let serial = 1
  if (last) {
    const parts = last[field].split('-')
    serial = parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${pattern}${String(serial).padStart(padding, '0')}`
}

/**
 * Generate sequential ID with format: PREFIX-SERIAL (global scope)
 */
async function generateGlobalId(model, field, prefix, padding = 3) {
  const last = await prisma[model].findFirst({
    where: { [field]: { startsWith: `${prefix}-` } },
    orderBy: { [field]: 'desc' },
    select: { [field]: true },
  })

  let serial = 1
  if (last) {
    const parts = last[field].split('-')
    serial = parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${prefix}-${String(serial).padStart(padding, '0')}`
}

// ─── Domain-Specific Generators ────────────────────────────

export async function generateCustomerId(channel) {
  const today = new Date()
  const yymm = today.toISOString().slice(2, 4) + String(today.getMonth() + 1).padStart(2, '0')
  const prefix = `TVS-CUS-${channel}-${yymm}`

  const last = await prisma.customer.findFirst({
    where: { customerId: { startsWith: prefix } },
    orderBy: { customerId: 'desc' },
    select: { customerId: true },
  })

  let serial = 1
  if (last) {
    const parts = last.customerId.split('-')
    serial = parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${prefix}-${String(serial).padStart(4, '0')}`
}

export async function generateEmployeeId(role, employmentType) {
  const { getEmploymentTypes } = await import('@/lib/systemConfig')
  const types = getEmploymentTypes()

  const typeCode = types[employmentType] || 'EMP'
  const roleCode = role || 'STAFF'
  const prefix = `ZRI-${typeCode}-${roleCode}`

  const last = await prisma.employee.findFirst({
    where: { employeeId: { startsWith: prefix } },
    orderBy: { employeeId: 'desc' },
    select: { employeeId: true },
  })

  let serial = 1
  if (last) {
    const parts = last.employeeId.split('-')
    serial = parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${prefix}-${String(serial).padStart(3, '0')}`
}

export async function generateOrderId() {
  return generateDailyId('order', 'orderId', 'ORD')
}

export async function generateTransactionId() {
  return generateDailyId('transaction', 'transactionId', 'PAY')
}

export async function generateEnrollmentId() {
  return generateDailyId('enrollment', 'enrollmentId', 'ENR')
}

export async function generateTaskId() {
  return generateDailyId('task', 'taskId', 'TSK')
}

export async function generateScheduleId() {
  return generateDailyId('courseSchedule', 'scheduleId', 'SCH')
}

export async function generateLotId() {
  return generateDailyId('ingredientLot', 'lotId', 'LOT')
}

export async function generatePurchaseOrderId() {
  return generateDailyId('purchaseOrder', 'poId', 'PO')
}

export async function generateSupplierId() {
  return generateGlobalId('supplier', 'supplierId', 'SUP')
}

export async function generateMovementId() {
  return generateDailyId('stockMovement', 'movementId', 'MOV')
}
