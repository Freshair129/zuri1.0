# Zuri Orchestrator CLI — Specification

> Version: 1.0.0
> Status: DRAFT
> Language: Node.js (commander + inquirer)
> Install: `cd .dev/orchestrator && npm install`
> Run: `npx zuri <command>` หรือ `node .dev/orchestrator/cli.js <command>`

---

## 1. Purpose

Enforce DOC TO CODE workflow อัตโนมัติ:
- ห้าม implement ก่อนมี spec
- ห้ามเปลี่ยน schema ก่อนมี ADR
- Changelog ต้อง sliding window
- Pre-commit hook block violations

---

## 2. Commands

### 2.1 `zuri new-feature <name>`

สร้าง feature spec จาก template

**Flow:**
```
1. Prompt: เลือก module → core | shared | industry/culinary
2. Prompt: อธิบายสั้นๆ
3. Prompt: priority → P0 | P1 | P2
4. สร้าง docs/product/features/{name}.md (จาก template)
5. สร้าง docs/product/flows/{name}-flow.md (skeleton)
6. Console: "✅ Feature spec created — review + approve before implement"
```

**Output files:**
```
docs/product/features/{name}.md   ← Feature spec
docs/product/flows/{name}-flow.md ← Flow diagram (skeleton)
```

---

### 2.2 `zuri new-adr <title>`

สร้าง ADR จาก template พร้อม auto-number

**Flow:**
```
1. Scan docs/adr/ → หา number สูงสุด
2. Next number = max + 1 (เช่น ADR-060)
3. Prompt: context (ปัญหาคืออะไร?)
4. Prompt: options considered (2-4 options)
5. Prompt: decision (เลือกอะไร?)
6. Prompt: consequences (positive + negative)
7. สร้าง docs/adr/ADR-{NNN}-{slug}.md
8. Console: "✅ ADR-{NNN} created — needs Boss approval"
```

**Auto-number logic:**
```javascript
const files = glob.sync('docs/adr/ADR-*.md')
const numbers = files.map(f => parseInt(f.match(/ADR-(\d+)/)[1]))
const next = Math.max(...numbers, 59) + 1 // start from 060
```

---

### 2.3 `zuri changelog <version> <summary>`

Sliding window changelog ตาม CHANGELOG_SYSTEM.md

**Flow:**
```
1. สร้าง changelog/CL-{YYYYMMDD}-{NNN}.md (full detail)
2. อ่าน CHANGELOG.md
3. เพิ่ม entry ใน Recent section (top)
4. ถ้า Recent > 5 entries → ย้าย oldest ไป Index table
5. อัปเดต LATEST pointer
6. Console: "✅ Changelog updated — v{version}"
```

**Serial numbering:**
```javascript
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
const existing = glob.sync(`changelog/CL-${today}-*.md`)
const serial = String(existing.length + 1).padStart(3, '0')
// CL-20260328-001, CL-20260328-002, ...
```

---

### 2.4 `zuri verify-flow <spec-path>`

ตรวจ feature spec ว่าครบก่อน implement

**Checks:**
```
□ Frontmatter มี: status, module, priority, author
□ มี ## Data Flow section
□ มี ## API Endpoints section
□ มี ## Roles & Permissions section
□ ถ้ามี schema changes → ADR referenced?
□ Referenced models exist ใน prisma/schema.prisma?
□ Status = APPROVED?
```

**Output:**
```
✅ PASS: Ready to implement
  ├── Data flow: ✅
  ├── API endpoints: ✅ (3 endpoints defined)
  ├── Roles: ✅ (SLS, MGR, DEV)
  ├── Schema: ✅ (ADR-061 referenced)
  └── Status: ✅ APPROVED

❌ FAIL: Not ready
  ├── Data flow: ❌ Missing
  ├── API endpoints: ✅
  ├── Roles: ⚠️ No roles defined
  ├── Schema: ❌ Schema changes but no ADR
  └── Status: ❌ DRAFT (needs approval)
```

---

### 2.5 `zuri pre-commit`

Pre-commit check — block ถ้า violate DOC TO CODE

**Checks:**
```
□ schema.prisma changed? → ADR ต้อง exist + APPROVED
□ Component > 500 LOC? → warning
□ API route ใหม่? → feature spec ต้อง exist
□ Direct getPrisma() ใน API route? → ❌ ใช้ repository
□ console.error ไม่มี module name? → ❌ ต้องมี [ModuleName]
```

**Exit codes:**
```
0 = PASS
1 = BLOCK (must fix before commit)
2 = WARNING (can proceed with acknowledgment)
```

---

### 2.6 `zuri sync-check`

Verify docs/ integrity (Obsidian SSOT)

**Checks:**
```
□ ทุก ADR มี valid frontmatter
□ ทุก feature spec มี status field
□ CHANGELOG.md LATEST pointer ตรงกับ changelog/ dir
□ Broken links ใน docs/ (internal [[links]])
□ Orphan docs (ไม่มีไฟล์ไหน link มา)
```

---

## 3. Dependencies

```json
{
  "commander": "^12.0.0",
  "inquirer": "^9.0.0",
  "chalk": "^5.3.0",
  "gray-matter": "^4.0.3",
  "glob": "^10.3.0",
  "yaml": "^2.6.0"
}
```

---

## 4. Integration

### Git Pre-commit Hook

```bash
# .husky/pre-commit (หรือ simple-git-hooks)
node .dev/orchestrator/cli.js pre-commit
```

### NPM Scripts (root package.json)

```json
{
  "scripts": {
    "zuri": "node .dev/orchestrator/cli.js",
    "zuri:new-feature": "node .dev/orchestrator/cli.js new-feature",
    "zuri:new-adr": "node .dev/orchestrator/cli.js new-adr",
    "zuri:changelog": "node .dev/orchestrator/cli.js changelog",
    "zuri:verify": "node .dev/orchestrator/cli.js verify-flow",
    "zuri:check": "node .dev/orchestrator/cli.js pre-commit"
  }
}
```

---

## 5. Error Handling

- ทุก command ต้อง exit gracefully (ไม่ throw ค้าง)
- File not found → clear error message + suggestion
- Invalid input → re-prompt (inquirer)
- Partial creation failure → cleanup created files

---

## 6. Future Commands (Phase 2+)

| Command | Purpose |
|---|---|
| `zuri migrate-check` | Verify migration plan before prisma migrate |
| `zuri module-scaffold <name>` | Generate module boilerplate (repo, api, components) |
| `zuri test-coverage <module>` | Check test coverage per module |
| `zuri dep-graph` | Visualize module dependency graph |
