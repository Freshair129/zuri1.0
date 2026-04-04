# FEAT-{{NAME}} — {{subtitle}}

**Status:** DRAFT
**Version:** 1.0.0
**Date:** {{DATE}}
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview
<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->

## 2. Terminology
<!-- คำศัพท์เฉพาะและนิยาม -->

## 3. Feature Breakdown
<!-- รายการ sub-features / user stories -->
- As a **[role]**, I want to **[action]**, so that **[benefit]**.

## 4. Data Flow
<!-- วาด flow: ข้อมูลไหลจากไหนไปไหน -->
```
[User Action] → [API Route] → [Repository] → [DB]
                     ↓
              [Pusher Event] → [UI Update]
```

## 5. Roles & Permissions
<!-- ใครทำอะไรได้ — อ้างอิง permissionMatrix.js -->
| Role | Access |
|------|--------|
| DEV/TEC | Full |
| MGR | Full |
| SLS | Read + Create |
| STF | Read |

## 6. NFR
<!-- Non-functional requirements ที่เกี่ยวข้อง -->
- Response time: ...
- Cache strategy: ...
- Retry policy: ...

## 7. Known Gotchas
<!-- สิ่งที่ต้องระวัง — อ้างอิง docs/gotchas/ -->
- ...

## 8. Implementation Phases
<!-- แบ่งงานเป็น phases ก่อน/หลัง -->
- [ ] Phase 1: ...
- [ ] Phase 2: ...
- [ ] Phase 3: ...

## 9. Related
<!-- ADRs, specs อื่น, external docs -->
- ADR: ...
- Spec: ...
- Docs: ...
