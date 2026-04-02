import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTenantId, getTenantSlug } from './tenant'

describe('tenant utility', () => {
  it('getTenantId should extract tenant ID from headers', () => {
    const req = {
      headers: {
        get: (name) => (name === 'x-tenant-id' ? 'tenant-123' : null)
      }
    }
    expect(getTenantId(req)).toBe('tenant-123')
  })

  it('getTenantId should fallback to V School tenant ID if header is missing', () => {
    const req = { headers: { get: () => null } }
    expect(getTenantId(req)).toBe('10000000-0000-0000-0000-000000000001')
  })

  it('getTenantSlug should extract tenant slug from headers', () => {
    const req = {
      headers: {
        get: (name) => (name === 'x-tenant-slug' ? 'my-slug' : null)
      }
    }
    expect(getTenantSlug(req)).toBe('my-slug')
  })

  it('getTenantSlug should fallback to vschool if header is missing', () => {
    const req = { headers: { get: () => null } }
    expect(getTenantSlug(req)).toBe('vschool')
  })
})
