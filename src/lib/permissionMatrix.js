/**
 * RBAC Permission Matrix (ADR-045)
 * 12 roles: DEV, TEC, MGR, MKT, HR, PUR, PD, ADM, ACC, SLS, AGT, STF
 * + OWNER (executive read-only)
 *
 * Permission levels: F=Full, A=Approve, R=Read, N=None
 */

const F = 'F'  // Full
const A = 'A'  // Approve
const R = 'R'  // Read
const N = 'N'  // None

export const permissionMatrix = {
  DEV: { dashboard: F, customers: F, inbox: F, marketing: F, kitchen: F, orders: F, employees: F, system: F },
  TEC: { dashboard: F, customers: F, inbox: F, marketing: F, kitchen: F, orders: F, employees: F, system: F },
  MGR: { dashboard: F, customers: F, inbox: F, marketing: F, kitchen: F, orders: F, employees: F, system: N },
  MKT: { dashboard: R, customers: R, inbox: R, marketing: F, kitchen: N, orders: N, employees: N, system: N },
  HR:  { dashboard: R, customers: N, inbox: N, marketing: N, kitchen: N, orders: N, employees: F, system: N },
  PUR: { dashboard: R, customers: N, inbox: N, marketing: N, kitchen: A, orders: N, employees: N, system: N },
  PD:  { dashboard: R, customers: N, inbox: N, marketing: N, kitchen: F, orders: N, employees: N, system: N },
  ADM: { dashboard: F, customers: F, inbox: F, marketing: N, kitchen: F, orders: F, employees: R, system: N },
  ACC: { dashboard: R, customers: R, inbox: N, marketing: N, kitchen: N, orders: R, employees: N, system: N },
  SLS: { dashboard: R, customers: F, inbox: F, marketing: N, kitchen: N, orders: F, employees: N, system: N },
  AGT: { dashboard: R, customers: R, inbox: R, marketing: N, kitchen: N, orders: F, employees: N, system: N },
  STF: { dashboard: R, customers: R, inbox: R, marketing: N, kitchen: R, orders: R, employees: N, system: N },
  OWNER: { dashboard: R, customers: R, inbox: R, marketing: R, kitchen: R, orders: R, employees: R, system: R },
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
