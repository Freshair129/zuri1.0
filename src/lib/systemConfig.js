import fs from 'fs'
import path from 'path'
import YAML from 'yaml'

let _config = null

/**
 * Load system_config.yaml — Single Source of Truth
 * ห้าม hardcode ค่าที่อยู่ใน config นี้ในไฟล์อื่น
 */
export function getConfig() {
  if (_config) return _config

  const filePath = path.join(process.cwd(), 'system_config.yaml')
  const file = fs.readFileSync(filePath, 'utf8')
  _config = YAML.parse(file)
  return _config
}

// ─── Shortcut Exports ──────────────────────────────────────

export function getRoles() {
  return getConfig().rbac.roles
}

export function getRoleByCode(code) {
  return getRoles().find(r => r.code === code)
}

export function getExecRoles() {
  return getConfig().rbac.exec_roles
}

export function getDashboardMap() {
  return getConfig().rbac.dashboard_map
}

// VAT
export function getVatRate() {
  return getConfig().vat.rate
}

// Orders
export function getOrderStatuses() {
  return getConfig().orders.statuses
}

export function getOrderTypes() {
  return getConfig().orders.types
}

export function getPaymentMethods() {
  return getConfig().payment.methods
}

// Products
export function getCourseCategories() {
  return getConfig().products.course_categories
}

export function getFoodCategories() {
  return getConfig().products.food_categories
}

export function getEquipmentCategories() {
  return getConfig().products.equipment_categories
}

export function getOriginCountries() {
  return getConfig().products.origin_countries
}

// Enrollment
export function getEnrollmentStatuses() {
  return getConfig().enrollment.statuses
}

// Tasks
export function getTaskPriorities() {
  return getConfig().tasks.priorities
}

export function getTaskStatuses() {
  return getConfig().tasks.statuses
}

export function getTaskTypes() {
  return getConfig().tasks.types
}

// Inventory & Procurement
export function getLotStatuses() {
  return getConfig().inventory.lot_statuses
}

export function getPoStatuses() {
  return getConfig().procurement.po_statuses
}

// Employee
export function getEmployeeGrades() {
  return getConfig().employee.grades
}

export function getEmploymentTypes() {
  return getConfig().employee.employment_types
}

export function getDepartmentCodes() {
  return getConfig().employee.department_codes
}

// Loyalty
export function getLoyaltyTiers() {
  return getConfig().loyalty.tiers
}

export function getVpRate() {
  return getConfig().loyalty.vp_rate
}

// Certificates
export function getCertThresholds() {
  return getConfig().certificates.thresholds
}

// Cache
export function getCacheTTL() {
  return getConfig().cache.default_ttl
}

// Theme
export function getThemeColors() {
  return getConfig().theme.colors
}

export function getPieChartPalette() {
  return getConfig().theme.pie_chart_palette
}

// Scheduling
export function getSessionTypes() {
  return getConfig().scheduling.session_types
}

export function getScheduleStatuses() {
  return getConfig().scheduling.statuses
}
