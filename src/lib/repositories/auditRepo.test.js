import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma } from '@/tests/mocks/prismaMock'

const TENANT = '10000000-0000-0000-0000-000000000001'
const ACTOR = 'user-1'
const TARGET = 'customer-1'

describe('auditRepo', () => {
  let mockPrisma

  beforeEach(async () => {
    mockPrisma = createMockPrisma()
    globalThis.__mockPrisma = mockPrisma
  })

  describe('create', () => {
    it('should create an audit log with correct data', async () => {
      const { create } = await import('./auditRepo.js')
      const action = 'UPDATE_PROFILE'
      const details = { lifeStage: 'PROSPECT' }

      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1', tenantId: TENANT, actor: ACTOR, action, target: TARGET, details })

      await create(TENANT, ACTOR, action, TARGET, details)

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: TENANT,
            actor: ACTOR,
            action,
            target: TARGET,
            details
          })
        })
      )
    })
  })

  describe('findByActor', () => {
    it('should find logs for an actor within a tenant', async () => {
      const { findByActor } = await import('./auditRepo.js')
      mockPrisma.auditLog.findMany.mockResolvedValue([])

      await findByActor(TENANT, ACTOR, { limit: 10 })

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT, actor: ACTOR },
          take: 10,
          orderBy: expect.objectContaining({ createdAt: 'desc' })
        })
      )
    })
  })

  describe('findByTarget', () => {
    it('should find logs for a target within a tenant', async () => {
      const { findByTarget } = await import('./auditRepo.js')
      mockPrisma.auditLog.findMany.mockResolvedValue([])

      await findByTarget(TENANT, TARGET)

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT, target: TARGET },
          orderBy: expect.objectContaining({ createdAt: 'desc' })
        })
      )
    })
  })

  describe('findByTenant', () => {
    it('should find all logs for a tenant', async () => {
      const { findByTenant } = await import('./auditRepo.js')
      mockPrisma.auditLog.findMany.mockResolvedValue([])

      await findByTenant(TENANT, { action: 'LOGIN' })

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT, action: 'LOGIN' },
          orderBy: expect.objectContaining({ createdAt: 'desc' })
        })
      )
    })
  })
})
