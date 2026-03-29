import { useSession } from '@/hooks/useSession'
import { permissionMatrix } from '@/lib/permissions/permissionMatrix'

/**
 * Returns true if the current user has permission to perform `action` on `domain`.
 * Uses permissionMatrix.can(roles, domain, action).
 *
 * @param {string} domain - e.g. 'orders', 'customers'
 * @param {string} action - e.g. 'read', 'write', 'delete'
 * @returns {boolean}
 */
export function usePermission(domain, action) {
  const { roles, isLoading } = useSession()

  if (isLoading) return false

  return permissionMatrix.can(roles, domain, action)
}
