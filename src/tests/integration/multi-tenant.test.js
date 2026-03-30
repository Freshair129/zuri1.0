import { describe, it, expect, beforeEach } from 'vitest'
import { createMockPrisma } from '@/tests/mocks/prismaMock'

const TENANT_A = '10000000-0000-0000-0000-000000000001'
const TENANT_B = '20000000-0000-0000-0000-000000000002'

describe('Multi-tenant isolation', () => {
  let mockPrisma

  beforeEach(async () => {
    mockPrisma = createMockPrisma()
    globalThis.__mockPrisma = mockPrisma
  })

  it('inventoryRepo.getStockLevels should filter by tenantId', async () => {
    const { getStockLevels } = await import('@/lib/repositories/inventoryRepo.js')
    mockPrisma.warehouseStock.findMany.mockResolvedValue([])

    await getStockLevels(TENANT_A, {})
    const call = mockPrisma.warehouseStock.findMany.mock.calls[0][0]
    expect(call.where.tenantId).toBe(TENANT_A)
  })

  it('poRepo.findMany should filter by tenantId', async () => {
    const { findMany } = await import('@/lib/repositories/poRepo.js')
    mockPrisma.purchaseOrderV2.findMany.mockResolvedValue([])
    mockPrisma.purchaseOrderV2.count.mockResolvedValue(0)

    await findMany(TENANT_B, {})
    const call = mockPrisma.purchaseOrderV2.findMany.mock.calls[0][0]
    expect(call.where.tenantId).toBe(TENANT_B)
  })

  it('supplierRepo.findMany should filter by tenantId', async () => {
    const { findMany } = await import('@/lib/repositories/supplierRepo.js')
    mockPrisma.supplier.findMany.mockResolvedValue([])

    await findMany(TENANT_A, {})
    const call = mockPrisma.supplier.findMany.mock.calls[0][0]
    expect(call.where.tenantId).toBe(TENANT_A)
  })

  it('auditRepo.findByTenant should scope to tenant', async () => {
    const { findByTenant } = await import('@/lib/repositories/auditRepo.js')
    mockPrisma.auditLog.findMany.mockResolvedValue([])

    await findByTenant(TENANT_A, { action: 'CREATE' })
    const call = mockPrisma.auditLog.findMany.mock.calls[0][0]
    expect(call.where.tenantId).toBe(TENANT_A)
    expect(call.where.action).toBe('CREATE')
  })
})
