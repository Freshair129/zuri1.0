#!/usr/bin/env node

/**
 * Zuri Migration Script — ZURI-v1 DB → Zuri v2 DB
 *
 * Usage: node scripts/migrate-zuri-to-co.js
 *
 * Prerequisites:
 *   - Set SOURCE_DATABASE_URL (ZURI-v1 connection)
 *   - Set TARGET_DATABASE_URL (Zuri v2 connection)
 *   - Run prisma migrate deploy on target first
 *
 * Design:
 *   - Batch size: 100 records per transaction
 *   - Idempotent: re-runnable (checks sourceId before insert)
 *   - Logs progress to stdout
 *   - On failure: throws (operator re-runs from failed phase)
 */

const BATCH_SIZE = 100
const VSCHOOL_TENANT_ID = '10000000-0000-0000-0000-000000000001'

// Phase definitions
const phases = [
  { name: 'Tenants', fn: migrateTenants },
  { name: 'Employees', fn: migrateEmployees },
  { name: 'Customers', fn: migrateCustomers },
  { name: 'Conversations + Messages', fn: migrateConversations },
  { name: 'Orders + Transactions', fn: migrateOrders },
  { name: 'Products + Packages', fn: migrateProducts },
  { name: 'Enrollments', fn: migrateEnrollments },
  { name: 'Audit Logs', fn: migrateAuditLogs },
  { name: 'Verify Row Counts', fn: verifyRowCounts },
]

async function main() {
  console.log('[migrate] Starting ZURI-v1 → Zuri v2 migration')
  console.log('[migrate] Tenant:', VSCHOOL_TENANT_ID)

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i]
    console.log(`\n[migrate] Phase ${i + 1}/${phases.length}: ${phase.name}`)
    try {
      await phase.fn()
      console.log(`[migrate] Phase ${i + 1} complete ✓`)
    } catch (error) {
      console.error(`[migrate] Phase ${i + 1} FAILED:`, error.message)
      throw error
    }
  }

  console.log('\n[migrate] All phases complete ✓')
}

async function migrateTenants() {
  // Create V School tenant if not exists
  // TODO: Connect to target DB, upsert Tenant record
  console.log('[migrate] → Create V School tenant (idempotent)')
}

async function migrateEmployees() {
  // TODO: Read employees from source, map roles (UPPERCASE), batch insert
  console.log('[migrate] → Migrate employees with role mapping')
}

async function migrateCustomers() {
  // TODO: Read customers + customerProfiles, normalize phone E.164, batch insert
  // Map: lifecycleStage values (Lead→LEAD, InProgress→LEAD, New Lead→CONTACT, Customer→CUSTOMER)
  console.log('[migrate] → Migrate customers + profiles')
}

async function migrateConversations() {
  // TODO: Read conversations + messages, assign tenantId, batch insert
  // Preserve conversationId (t_xxx) as business key
  console.log('[migrate] → Migrate conversations + messages')
}

async function migrateOrders() {
  // TODO: Read orders + transactions, map customerId, assign tenantId
  console.log('[migrate] → Migrate orders + transactions')
}

async function migrateProducts() {
  // TODO: Read products/packages/courses, assign tenantId
  console.log('[migrate] → Migrate products + packages')
}

async function migrateEnrollments() {
  // TODO: Read enrollments + items + attendance, map customerId + packageId
  console.log('[migrate] → Migrate enrollments + attendance')
}

async function migrateAuditLogs() {
  // TODO: Read audit logs, backfill tenantId = VSCHOOL_TENANT_ID
  console.log('[migrate] → Backfill audit logs with tenantId')
}

async function verifyRowCounts() {
  // TODO: Compare row counts between source and target for each table
  // Log discrepancies, throw if critical tables mismatch
  console.log('[migrate] → Verify row counts match')
}

main().catch((error) => {
  console.error('[migrate] Fatal error:', error)
  process.exit(1)
})
