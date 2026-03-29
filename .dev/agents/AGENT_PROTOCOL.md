# Agent Protocol — Zuri Platform

> Version: 1.0.0
> Status: ACTIVE
> ใช้กับ: Claude Code, Gemini CLI, และ AI agents อื่นๆ ที่ทำงานกับ Zuri codebase

---

## 1. Agent Hierarchy

```
Boss (Human)           — Product Owner, ตัดสินใจสุดท้าย
  └─ Claude            — Lead Architect, ออกแบบ + implement
      └─ Sub-agents    — Gemini CLI, ทำ boilerplate/tests ตามสั่ง
```

**กฎ:**
- Sub-agent ห้ามเปลี่ยน architecture โดยไม่ผ่าน Claude
- Claude ห้าม implement โดยไม่ผ่าน Boss (DOC TO CODE)
- Boss approve = green light to implement

---

## 2. Session Start Protocol (MANDATORY)

ทุกครั้งที่เริ่ม session ใหม่ ต้องอ่าน:

```
1. CLAUDE.md                       → Project rules (auto-loaded)
2. .dev/shared-context/GOAL.md     → Current objectives
3. .dev/shared-context/MEMORY.md   → Agent progress log
4. CHANGELOG.md                    → LATEST pointer → ทำถึงไหนแล้ว
5. docs/gotchas/                   → สิ่งที่ห้ามพลาดซ้ำ
```

**ถ้า context หาย (IDE compaction):**
- หยุดทันที
- อ่าน CLAUDE.md + GOAL.md ใหม่
- ตรวจสอบ: "ยังจำ rules ได้ไหม?" → ถ้าไม่แน่ใจ → อ่าน docs/gotchas/

---

## 3. DOC TO CODE Rules

### ก่อน implement:
```
□ Feature spec exists? (docs/product/features/)
□ Flow documented? (docs/product/flows/)
□ Boss approved? (status: APPROVED ใน frontmatter)
□ ADR required? (schema change / new dependency / architecture decision)
□ ADR approved? (status: ACCEPTED)
```

### ห้ามทำ:
```
✗ Implement ก่อน spec approved
✗ เปลี่ยน schema ก่อนมี ADR
✗ เพิ่ม dependency ก่อนมี ADR
✗ ลบ feature ก่อนมี changelog
✗ "แก้เล็กน้อย" โดยไม่บอก Boss
```

### หลัง implement:
```
□ Changelog entry created
□ GOAL.md updated (task checked off)
□ MEMORY.md updated (progress note)
```

---

## 4. Code Rules (from CLAUDE.md + Incidents)

### Architecture
- **UI ดึงจาก DB เท่านั้น** — ห้ามเรียก Meta Graph API / LINE API จาก UI/API routes
- **Repository pattern** — ห้าม `getPrisma()` ใน API routes ตรงๆ
- **Multi-tenant** — ทุก query ต้องมี `tenantId` ใน WHERE

### Error Handling
```javascript
// ✅ ถูก
console.error('[ModuleName]', error)

// ❌ ผิด — catch silently
try { ... } catch (e) {}

// ❌ ผิด — ไม่มี module name
console.error(error)
```

### Workers
```javascript
// Worker ต้อง throw เพื่อให้ QStash retry
try {
  await doWork()
} catch (error) {
  console.error('[worker/sync-hourly]', error)
  throw error // ← QStash จะ retry
}
```

### Component Size
- Max **500 LOC** per component
- ถ้าเกิน → split เป็น sub-components

### IDs
- ใช้ format ตาม `id_standards.yaml`
- ห้าม invent ID format ใหม่

---

## 5. Checkpoint Protocol

### ทุก 3-4 tasks:
```
1. อ่าน CLAUDE.md ซ้ำ (refresh rules)
2. ตรวจสอบ: code ตรงกับ spec ไหม?
3. ตรวจสอบ: ไม่ violate gotchas?
4. Update MEMORY.md (progress)
```

### ก่อน claim "DONE":
```
1. อ่าน source file จริง (Read tool) — ห้าม assume
2. Verify: imports ถูก? (Lucide ไม่ใช่ FontAwesome)
3. Verify: getPrisma() → await? (G-AI-01)
4. Verify: tenantId ใน query? (G-MT-01)
5. Verify: console.error มี [ModuleName]?
```

---

## 6. Incident Prevention Checklist

ก่อน commit code ที่เกี่ยวกับ:

### Meta API:
```
□ action_type ใช้ .includes() ไม่ใช่ exact match (G-META-01)
□ Promise.allSettled ไม่ใช่ Promise.all (G-META-05)
□ maxDuration = 300 ใส่แล้ว (G-WH-03)
□ bulkUpsert update ทุก field (G-META-06)
```

### Webhook:
```
□ Return 200 ก่อน process (G-WH-01)
□ upsert ไม่ใช่ find+create (G-WH-02)
□ QStash signature verify (G-WH-05)
```

### Database:
```
□ Array mutation ก่อน DB op (G-DB-04)
□ ทุก variable declared (G-DB-05)
□ $transaction สำหรับ identity + stock (G-DB-03)
```

### Attribution:
```
□ Revenue match product (G-MKT-01)
□ conversationId = UUID ไม่ใช่ t_xxx (G-DB-02)
```

---

## 7. Handoff Format

เมื่อจบ session หรือส่งต่อให้ agent อื่น:

```markdown
## Session Handoff — {date}

### Completed
- [x] Task A
- [x] Task B

### In Progress
- [ ] Task C (ทำถึงไหน, blocking issue)

### Next Steps
1. ทำ Task D
2. ทำ Task E

### Gotchas Encountered
- {gotcha description} — fixed by {solution}

### Files Changed
- src/modules/core/inbox/repo.js — added findByChannel()
- docs/adr/ADR-061.md — created (DRAFT)
```

---

## 8. Communication with Boss

### ถามเมื่อ:
- ไม่แน่ใจว่า feature scope ถูกไหม
- มี trade-off ที่ต้องเลือก (A vs B)
- พบ gotcha ใหม่ที่ไม่มีใน docs
- ต้อง deviate จาก approved spec

### ไม่ต้องถาม:
- Bug fix ที่ชัดเจน (มี evidence)
- Code style / formatting
- Dependency version bump (patch)
- Test additions
