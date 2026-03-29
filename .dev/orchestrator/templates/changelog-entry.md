---
id: CL-{{DATE}}-{{SERIAL}}
version: "{{VERSION}}"
date: "{{DATE_ISO}}"
type: feature          # feature | fix | refactor | docs | chore
module: ""             # e.g., core/inbox, shared/procurement
breaking: false
adr: []                # e.g., [ADR-061]
---

# CL-{{DATE}}-{{SERIAL}} — {{VERSION}}

## Summary
<!-- 1-2 ประโยค -->

## Changes

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...

## Files Changed
<!-- รายชื่อไฟล์ที่เปลี่ยน -->
- ...

## Migration
<!-- ถ้ามี DB migration -->
- [ ] None / `prisma migrate dev --name {{name}}`

## Gotchas
<!-- สิ่งที่ต้องระวังหลัง deploy -->
- ...

## Rollback Plan
<!-- ถ้าต้อง revert ทำยังไง -->
- ...
