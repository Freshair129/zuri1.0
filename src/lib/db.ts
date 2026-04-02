import { PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'node:async_hooks'

const SYSTEM_TABLES = ['Tenant', 'MarketPrice', 'AuditLog']

const basePrisma = new PrismaClient()

/**
 * Multi-tenant Context Store
 * Used to propagate tenant-id across asynchronous calls (e.g., from middleware to repo)
 */
export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>()

/**
 * Multi-tenant Foundation: Prisma Client Extension (MT-P4)
 * This extension automatically scopes all queries by tenantId.
 */
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // 1. Bypass for system-level tables or if explicitly skipping
        if (SYSTEM_TABLES.includes(model)) {
          return query(args)
        }

        // 2. Resolve tenantId from context (AsyncLocalStorage)
        const context = tenantContext.getStore()
        const tenantId = context?.tenantId

        // 3. AUTO-FILTER (Read/Update/Delete)
        if (['findMany', 'findFirst', 'findUnique', 'update', 'delete', 'updateMany', 'deleteMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
          if (tenantId) {
            (args as any).where = { ...((args as any).where || {}), tenantId }
          }
        }

        // 4. AUTO-INJECT (Create)
        if (operation === 'create' || operation === 'createMany') {
          if (tenantId) {
            if (operation === 'create') {
              (args as any).data = { ...((args as any).data || {}), tenantId }
            } else if (operation === 'createMany') {
              if (Array.isArray((args as any).data)) {
                (args as any).data = (args as any).data.map((item: any) => ({ ...item, tenantId }))
              }
            }
          }
        }

        return query(args)
      },
    },
  },
})

// Setup global for Prisma in development
const globalForPrisma = globalThis as unknown as { prisma: typeof prisma }
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export function getPrisma() {
  return prisma
}
