---
title: "{{NAME}}"
status: DRAFT           # DRAFT → REVIEW → APPROVED → IMPLEMENTED
module: core/{{module}}  # core/inbox, core/crm, shared/inventory, industry/culinary/courses
priority: P1             # P0=Critical P1=High P2=Medium P3=Low
author: ""
created: "{{DATE}}"
adr: []                  # e.g., [ADR-061, ADR-062]
---

# {{NAME}}

## 1. Summary
<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->

## 2. User Stories
<!-- ใครทำอะไรเพื่ออะไร -->
- As a **[role]**, I want to **[action]**, so that **[benefit]**.

## 3. Data Flow
<!-- วาด flow: ข้อมูลไหลจากไหนไปไหน -->
```
[User Action] → [API Route] → [Repository] → [DB]
                     ↓
              [Pusher Event] → [UI Update]
```

## 4. API Endpoints
<!-- ทุก endpoint ที่ feature ใช้ -->
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | /api/... | ... | SLS, MGR |
| POST | /api/... | ... | SLS, MGR |

## 5. Database Changes
<!-- Models ที่เพิ่ม/แก้ — ถ้ามี → ต้องมี ADR -->
- [ ] New model: ...
- [ ] Modified field: ...
- [ ] New index: ...

**ADR Required:** Yes / No

## 6. Roles & Permissions
<!-- ใครทำอะไรได้ -->
| Role | Access |
|------|--------|
| DEV/TEC | Full |
| MGR | Full |
| SLS | Read + Create |
| STF | Read |

## 7. UI Components
<!-- Components ที่ต้องสร้าง/แก้ -->
- [ ] `ComponentName.jsx` — description

## 8. Edge Cases & Gotchas
<!-- สิ่งที่ต้องระวัง — อ้างอิง docs/gotchas/ -->
- ...

## 9. Acceptance Criteria
<!-- เงื่อนไขที่ต้องผ่านก่อน mark IMPLEMENTED -->
- [ ] ...
- [ ] ...

## 10. Dependencies
<!-- ต้องทำ feature ไหนก่อน / ใช้ dependency อะไร -->
- Depends on: ...
- External: ...
