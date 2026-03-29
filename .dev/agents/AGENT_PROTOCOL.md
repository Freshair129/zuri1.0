# Agent Protocol — Zuri Platform

> Version: 1.1.0
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
6. Obsidian (docs/)                → Second brain — spec, ADR, decisions
```

**ถ้า context หาย (IDE compaction):**
- หยุดทันที
- อ่าน CLAUDE.md + GOAL.md ใหม่
- Query Obsidian ผ่าน MCP เพื่อ refresh context
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

## 9. Obsidian — Second Brain for AI Agents

> Obsidian vault = `E:\zuri\docs\` (filesystem-based, MCP-accessible)
> ทุก agent ใช้ Obsidian เป็นแหล่งความจำถาวร — ไม่ใช่แค่ไฟล์ธรรมดา

### 9.1 ทำไม Obsidian คือ Second Brain

```
Agent context window    → ลืมหลังจบ session
Obsidian vault          → จำตลอด ค้นหาได้ เชื่อมโยงได้
```

Obsidian ทำหน้าที่:
- **Long-term memory** — spec, ADR, decisions ที่ approve แล้ว
- **Knowledge graph** — ลิงก์ระหว่าง concepts ([[ADR-056]] → [[CRM]] → [[Loyalty]])
- **SSOT** — ถ้า docs กับ code ขัดกัน → docs ใน Obsidian คือถูก
- **Agent briefing** — ก่อน implement อ่าน spec ใน Obsidian แทนต้องจำเอง

### 9.2 Structure

```
docs/ (Obsidian vault)
├── product/
│   ├── PRD.md                 ← Product requirements
│   ├── ROADMAP.md             ← Milestones
│   └── specs/                 ← FEAT-*.md (approved specs)
├── decisions/
│   ├── adrs/                  ← ADR-0xx.md (architecture decisions)
│   └── log.md                 ← Decision log
├── architecture/              ← System design, ERD
└── gotchas/                   ← Rules จาก incidents
```

### 9.3 วิธีใช้ใน Session

**ค้นหา spec ก่อน implement:**
```
→ Obsidian MCP: search "FEAT-POS" หรือ obsidian_get_file_contents
→ อ่าน spec → verify status = APPROVED → แล้วค่อย implement
```

**ค้นหา ADR ก่อนตัดสินใจ:**
```
→ Obsidian MCP: search "ADR floor plan" หรือ "ADR loyalty"
→ อ่าน context + rationale → ห้าม deviate โดยไม่มี new ADR
```

**เมื่อ Boss approve สิ่งใหม่:**
```
→ เขียน/อัพเดท spec ใน docs/product/specs/
→ เขียน ADR ใน docs/decisions/adrs/ (ถ้าจำเป็น)
→ อัพเดท docs/decisions/log.md
→ Obsidian index อัพเดทอัตโนมัติ (filesystem sync)
```

### 9.4 MCP Tools ที่ใช้

| Tool | ใช้เมื่อ |
|---|---|
| `obsidian_get_file_contents` | อ่าน spec หรือ ADR ที่รู้ path |
| `obsidian_simple_search` | ค้นหา keyword ใน vault |
| `obsidian_complex_search` | ค้นหา pattern ซับซ้อน |
| `obsidian_list_files_in_dir` | ดูว่ามี spec/ADR อะไรบ้าง |
| `obsidian_patch_content` | อัพเดทไฟล์ใน vault (append/prepend) |

### 9.5 กฎการใช้ Obsidian

```
✅ อ่าน spec จาก Obsidian ก่อน implement เสมอ
✅ เขียน ADR ใน Obsidian ทันทีที่ Boss approve
✅ ถ้า context หาย → query Obsidian ก่อนถาม Boss
✗ ห้าม implement จากความจำ โดยไม่ verify กับ Obsidian
✗ ห้ามเขียน spec ไว้ใน session memory อย่างเดียว (ไม่ถาวร)
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
