/**
 * RBAC Permission Matrix (ADR-068 — Persona-Based RBAC)
 * 6 roles: OWNER, MANAGER, SALES, KITCHEN, FINANCE, STAFF
 * + DEV (internal only, hidden in UI)
 *
 * Supersedes ADR-045 (12-role department RBAC)
 * Updated: 2026-04-04
 *
 * Permission levels: F=Full CRUD, A=Approve, R=Read, N=None
 *
 * Domain map:
 *   dashboard  — home + analytics + daily brief
 *   customers  — CRM + customer profiles
 *   inbox      — unified inbox (FB + LINE)
 *   marketing  — ads analytics + campaigns
 *   kitchen    — kitchen ops + stock + procurement + recipes
 *   orders     — POS + invoices + payments
 *   employees  — employee management
 *   accounting — FlowAccount integration + billing export
 *   system     — tenant admin + system config (DEV only)
 */

const F = 'F'  // Full CRUD
const A = 'A'  // Approve
const R = 'R'  // Read
const N = 'N'  // None

export const permissionMatrix = {
  //                dashboard  customers  inbox  marketing  kitchen  orders  employees  accounting  system
  DEV:     { dashboard: F, customers: F, inbox: F, marketing: F, kitchen: F, orders: F, employees: F, accounting: F, system: F },
  OWNER:   { dashboard: R, customers: R, inbox: R, marketing: R, kitchen: R, orders: R, employees: R, accounting: R, system: N },
  MANAGER: { dashboard: F, customers: F, inbox: F, marketing: F, kitchen: F, orders: F, employees: F, accounting: R, system: N },
  SALES:   { dashboard: R, customers: F, inbox: F, marketing: F, kitchen: N, orders: F, employees: N, accounting: N, system: N },
  KITCHEN: { dashboard: R, customers: N, inbox: N, marketing: N, kitchen: F, orders: N, employees: N, accounting: N, system: N },
  FINANCE: { dashboard: R, customers: R, inbox: N, marketing: N, kitchen: N, orders: R, employees: N, accounting: F, system: N },
  STAFF:   { dashboard: R, customers: R, inbox: R, marketing: N, kitchen: R, orders: R, employees: N, accounting: N, system: N },
}

export const PERMISSIONS = permissionMatrix // Legacy alias

/**
 * Check if role(s) can perform action on domain
 * @param {string|string[]} roles
 * @param {string} domain
 * @param {string} action - 'F'|'A'|'R'
 * @returns {boolean}
 */
export function can(roles, domain, action = 'R') {
  const roleList = Array.isArray(roles) ? roles : [roles]
  const levels = { N: 0, R: 1, A: 2, F: 3 }

  return roleList.some(role => {
    const perm = permissionMatrix[role]?.[domain]
    return perm && levels[perm] >= levels[action]
  })
}
