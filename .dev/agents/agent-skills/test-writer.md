# Agent Skill: Test Writer

> For: Sub-agent (Gemini CLI or other)
> Trigger: เขียน unit tests สำหรับ repo/service functions

## Task

เขียน unit tests (Vitest) สำหรับ repository functions และ API routes.

## Convention

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(() => ({
    customer: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
  })),
}))
```

## Test Structure
```
describe('{RepoName}', () => {
  describe('{functionName}', () => {
    it('should return items filtered by tenantId', ...)
    it('should handle empty results', ...)
    it('should throw on invalid input', ...)
  })
})
```

## Rules
- Mock Prisma — ห้ามยิง DB จริง
- Test tenantId isolation (ทุก repo function)
- Test error cases (P2002, timeout, null input)
- Test edge cases จาก docs/gotchas/
- ไม่ test implementation detail — test behavior
