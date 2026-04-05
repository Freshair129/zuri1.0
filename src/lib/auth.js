import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { can } from '@/lib/permissionMatrix'
import { NextResponse } from 'next/server'

/**
 * Get the current server session (for Server Components + API routes)
 */
export async function getSession() {
  return getServerSession(authOptions)
}

/**
 * Require authenticated session — throws if not logged in
 * @returns {Promise<Session>}
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * Require authenticated session with RBAC check
 * @param {string} domain - permission domain (e.g. 'customers', 'inbox')
 * @param {string} action - 'R' | 'A' | 'F'
 * @returns {Promise<Session>}
 */
export async function requireRole(domain, action = 'R') {
  const session = await requireAuth()
  const roles = session.user?.roles ?? []

  if (!can(roles, domain, action)) {
    const err = new Error('Forbidden')
    err.status = 403
    throw err
  }

  return session
}

/**
 * Higher-order function — wraps an API route handler with auth + optional RBAC
 *
 * Usage:
 *   export const GET = withAuth(async (req, { session }) => {
 *     return NextResponse.json({ ok: true })
 *   }, { domain: 'customers', action: 'R' })
 *
 * @param {Function} handler - async (req, context) => Response
 * @param {{ domain?: string, action?: string }} options
 */
export function withAuth(handler, { domain, action = 'R' } = {}) {
  return async function (req, context = {}) {
    try {
      let session

      if (domain) {
        session = await requireRole(domain, action)
      } else {
        session = await requireAuth()
      }

      return handler(req, { ...context, session })
    } catch (err) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (err.message === 'Forbidden' || err.status === 403) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      console.error('[withAuth]', err)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
}

/**
 * Normalize legacy roles (from ZURI v1) → new 6-persona roles (ADR-068)
 * Safe to call with already-normalized roles.
 * @param {string} role
 * @returns {string}
 */
export function normalizeRole(role) {
  const map = {
    MGR: 'MANAGER', ADM: 'MANAGER', HR: 'MANAGER',
    SLS: 'SALES',   AGT: 'SALES',   MKT: 'SALES',
    TEC: 'KITCHEN', PUR: 'KITCHEN', PD: 'KITCHEN',
    ACC: 'FINANCE',
    STF: 'STAFF',
  }
  return map[role?.toUpperCase()] ?? role?.toUpperCase() ?? 'STAFF'
}
