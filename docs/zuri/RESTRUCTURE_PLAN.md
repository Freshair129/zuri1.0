# Zuri Platform — Restructure Plan

> Version: 1.0.0
> Date: 2026-03-28
> Status: **DRAFT — ต้อง approve ก่อน implement**
> Owner: Boss (Product) · Claude (Lead Architect)
> Approach: **DOC TO CODE** — ไม่ลงมือ implement จนกว่า feature/flow นิ่ง

---

## 1. ปัญหาของ Repo เก่า (E:\ZURI)

| ปัญหา | ตัวเลข | ผลกระทบ |
|---|---|---|
| ไฟล์ root รก | 40+ ไฟล์ปน (fix_*.js, git_push*.js, .xlsx, .txt) | หา config จริงไม่เจอ |
| Dev tools ปน production | .agent/, .claude/skills/, scripts/ deploy ขึ้น Vercel | Bundle size + security risk |
| Components ใหญ่เกิน | PremiumPOS 2.4K, EmployeeManagement 2K, Analytics 2K LOC | แก้ bug ยาก, test ไม่ได้ |
| 81 models ใน schema เดียว | 95KB schema.prisma | อ่านไม่ไหว, migrate ช้า |
| Culinary-specific ปน generic | Recipe/Ingredient/CourseMenu ผูกกับ core | เปลี่ยน industry ไม่ได้ |
| Marketing routes ซ้ำ | 33 endpoints, sync 5 แบบ | ซ้ำซ้อน, maintain ยาก |
| Docs กระจาย | ADR 56 ไฟล์ + root MD 15 ไฟล์ | หาอะไรไม่เจอ |

---

## 2. หลักการออกแบบใหม่

### 2.1 Modular Architecture
```
แยก domain เป็น module อิสระ
แต่ละ module มี: pages/ + api/ + components/ + repo + types
เพิ่ม/ลบ module ได้โดยไม่กระทบ core
```

### 2.2 Industry-Agnostic Core
```
Core = CRM + Inbox + POS + Marketing + Tasks + RBAC + Tenant
Industry Module = Culinary (V School) | Beauty | Fitness | ...
สลับ industry ได้ด้วย tenant config — ไม่ต้องแก้ core
```

### 2.3 DOC TO CODE
```
1. เขียน Feature Spec (doc)
2. Review & approve flow
3. เขียน ADR ถ้ามี architectural decision
4. เขียน migration plan
5. ถึงจะ implement
```

### 2.4 Dev Tools แยกจาก Production
```
E:\zuri\                    ← production (deploy ขึ้น Vercel)
E:\zuri\.dev\               ← dev tooling (gitignore จาก deploy, push github ได้)
E:\zuri\docs\               ← SSOT = Obsidian vault
```

---

## 3. โครงสร้างโปรเจคใหม่

```
E:\CO/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Public auth routes
│   │   ├── (dashboard)/              # Protected dashboard
│   │   │   ├── page.jsx              # Home
│   │   │   └── [module]/             # Dynamic module routing
│   │   ├── api/
│   │   │   ├── auth/                 # NextAuth
│   │   │   ├── webhooks/             # FB + LINE inbound
│   │   │   ├── workers/              # QStash cron targets
│   │   │   └── [module]/             # Module-specific API routes
│   │   └── layout.jsx
│   │
│   ├── modules/                      # 🔑 MODULAR ARCHITECTURE
│   │   │
│   │   ├── core/                     # ── Core (ทุก industry ใช้) ──
│   │   │   ├── auth/                 # NextAuth + RBAC + session
│   │   │   ├── tenant/               # Multi-tenant resolution
│   │   │   ├── crm/                  # Customer + Profile + Lifecycle
│   │   │   ├── inbox/                # Unified Inbox (FB + LINE)
│   │   │   ├── pos/                  # POS + Quick Sale
│   │   │   ├── marketing/            # Ads Analytics + Sync
│   │   │   ├── tasks/                # Task Management
│   │   │   ├── employees/            # Employee + Attendance
│   │   │   ├── notifications/        # Push + LINE + In-App
│   │   │   └── ai/                   # Gemini AI (compose, ask, DSB)
│   │   │
│   │   ├── industry/                 # ── Industry Plugins ──
│   │   │   ├── culinary/             # V School (ลูกค้ารายแรก)
│   │   │   │   ├── courses/          # Course + Enrollment + Schedule
│   │   │   │   ├── recipes/          # Recipe + BOM + Menu
│   │   │   │   ├── kitchen/          # Ingredient + Lot (FEFO) + Stock
│   │   │   │   ├── certificates/     # Certificate issuance
│   │   │   │   └── packages/         # Package bundling
│   │   │   │
│   │   │   └── [future]/             # Beauty / Fitness / ...
│   │   │       └── index.js          # Module manifest
│   │   │
│   │   └── shared/                   # ── Shared across modules ──
│   │       ├── inventory/            # Warehouse + Stock Movement
│   │       ├── procurement/          # PO Lifecycle + Supplier
│   │       └── audit/                # Audit Log + Approval
│   │
│   ├── components/
│   │   ├── ui/                       # Base design system
│   │   ├── layouts/                  # Shell, Sidebar, Topbar
│   │   └── shared/                   # DataTable, StatCard, etc.
│   │   # Module-specific components อยู่ใน modules/[name]/components/
│   │
│   ├── lib/
│   │   ├── db.ts                     # Prisma singleton
│   │   ├── redis.js                  # Upstash Redis
│   │   ├── qstash.js                # QStash client
│   │   ├── pusher.js                # Pusher client
│   │   ├── tenant.js                # Tenant resolution
│   │   ├── permissionMatrix.js      # RBAC matrix
│   │   ├── systemConfig.js          # YAML config reader
│   │   ├── idGenerator.js           # ID generation
│   │   └── utils/                    # format, validation
│   │
│   ├── hooks/                        # Global React hooks
│   └── styles/                       # Tailwind globals
│
├── prisma/
│   ├── schema/                       # 🔑 SPLIT SCHEMA
│   │   ├── base.prisma               # generator + datasource
│   │   ├── tenant.prisma             # Tenant model
│   │   ├── core-crm.prisma           # Customer, Employee
│   │   ├── core-inbox.prisma         # Conversation, Message
│   │   ├── core-orders.prisma        # Order, Transaction
│   │   ├── core-marketing.prisma     # Ad, Campaign, AdSet, Metrics
│   │   ├── core-tasks.prisma         # Task
│   │   ├── shared-inventory.prisma   # Warehouse, StockMovement
│   │   ├── shared-procurement.prisma # PO, Supplier, GRN
│   │   ├── shared-audit.prisma       # AuditLog
│   │   ├── industry-culinary.prisma  # Recipe, Ingredient, Course, Enrollment
│   │   └── dsb.prisma                # ConversationAnalysis, DailyBrief
│   ├── schema.prisma                 # Generated merged schema (prisma-merge)
│   ├── migrations/
│   └── seed.ts
│
├── docs/                             # 📖 SSOT = Obsidian Vault
│   ├── _vault/                       # Obsidian config (.obsidian symlink)
│   ├── 00-index.md                   # Vault home / navigation
│   │
│   ├── product/                      # Product docs
│   │   ├── PRD.md
│   │   ├── features/                 # Feature specs (INBOX.md, POS.md, DSB.md...)
│   │   └── flows/                    # User flow diagrams
│   │
│   ├── architecture/                 # Technical docs
│   │   ├── SPEC.md                   # Tech spec
│   │   ├── database/                 # ERD, schema docs
│   │   ├── data-flows/               # Data flow diagrams
│   │   └── modules/                  # Module architecture docs
│   │
│   ├── adr/                          # Architecture Decision Records
│   │   ├── _template.md
│   │   └── ADR-NNN-*.md
│   │
│   ├── guides/                       # How-to guides
│   │   ├── deployment.md
│   │   ├── mcp-guide.md
│   │   └── onboarding.md
│   │
│   ├── changelog/                    # Changelog (sliding window)
│   │   ├── CHANGELOG_SYSTEM.md
│   │   └── CL-*.md
│   │
│   └── gotchas/                      # ⚠️ Known issues & workarounds
│       ├── fb-webhook-race.md
│       ├── dbId-vs-id.md
│       └── token-management.md
│
├── .dev/                             # 🔧 DEV TOOLING (ไม่ deploy)
│   ├── orchestrator/                 # Workflow orchestration scripts
│   │   ├── package.json              # Dependencies (commander, inquirer)
│   │   ├── cli.js                    # Entry point: npx zuri <command>
│   │   ├── commands/
│   │   │   ├── new-feature.js        # DOC TO CODE workflow
│   │   │   ├── new-adr.js            # Create ADR from template
│   │   │   ├── changelog.js          # Sliding window changelog
│   │   │   ├── verify-flow.js        # Verify feature flow before implement
│   │   │   ├── sync-obsidian.js      # Verify docs SSOT integrity
│   │   │   └── pre-commit.js         # Pre-commit checks
│   │   └── templates/
│   │       ├── feature-spec.md
│   │       ├── adr.md
│   │       └── changelog-entry.md
│   │
│   ├── agents/                       # Multi-agent config
│   │   ├── claude-skills/            # Claude Code skills
│   │   ├── agent-skills/             # Other agent skills
│   │   └── AGENT_PROTOCOL.md         # Agent behavior rules
│   │
│   ├── scripts/                      # One-off scripts
│   │   ├── backfill/
│   │   ├── migration/
│   │   └── smoke-test.mjs
│   │
│   └── shared-context/               # 📋 Shared context (push to github)
│       ├── CLAUDE.md                  # → symlink to E:\zuri\CLAUDE.md
│       ├── GOAL.md                    # Current objectives
│       ├── MEMORY.md                  # Agent handover
│       └── CONTEXT_INDEX.yaml         # Session context map
│
├── system_config.yaml                # Config SSOT
├── id_standards.yaml                 # ID format SSOT
├── system_requirements.yaml          # Requirements SSOT
├── CLAUDE.md                         # Project rules (auto-load)
├── CHANGELOG.md                      # Sliding window (last 5)
│
├── .gitignore                        # node_modules, .env, .next
├── .vercelignore                     # .dev/, docs/_vault/, *.yaml (non-deploy)
├── vercel.json                       # QStash crons
├── package.json
└── next.config.js
```

---

## 4. Module Structure (แต่ละ module)

```
src/modules/core/inbox/
├── components/                # Module-specific UI
│   ├── ConversationList.jsx
│   ├── ChatView.jsx
│   ├── ReplyBox.jsx
│   ├── CustomerCard.jsx
│   └── ChatPOS.jsx
├── api/                       # Route handlers (imported by app/api/)
│   ├── conversations.js       # GET list, POST create
│   ├── reply.js               # POST send reply
│   └── marketing-chat.js      # GET with dbId + customerId
├── repo.js                    # Repository (DB access)
├── hooks.js                   # Module-specific hooks
├── constants.js               # Module constants
└── index.js                   # Module manifest (exports)
```

---

## 5. Obsidian Strategy

### SSOT = `E:\zuri\docs\`

```
Obsidian Vault Path = E:\zuri\docs\
```

- **ไม่มี copy** — docs/ คือ vault เดียว
- Obsidian อ่าน/เขียน markdown ใน docs/ โดยตรง
- Git track ทุกไฟล์ใน docs/ (version controlled)
- `.obsidian/` config อยู่ใน `docs/_vault/` (gitignore ได้)

### Obsidian Graph View จะเห็น:

```
PRD.md ← links → INBOX.md, POS.md, DSB.md
ADR-056 ← links → SPEC.md (multi-tenant)
Customer (DB) ← links → Order, Conversation, Enrollment
Gotchas ← links → ADR ที่เกี่ยวข้อง
```

### Workflow:
```
1. แก้ doc ใน Obsidian (human) หรือ Claude (AI)
2. ทั้งคู่แก้ไฟล์เดียวกันใน docs/
3. git commit track ทุกการเปลี่ยนแปลง
4. ไม่มี sync problem — single source
```

---

## 6. DOC TO CODE Workflow

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: SPEC                                            │
│                                                          │
│ Boss: "ต้องการ feature X"                                  │
│   ↓                                                      │
│ Claude: สร้าง docs/product/features/X.md                   │
│   ↓                                                      │
│ Boss: review + approve                                    │
│   ↓                                                      │
│ Claude: ไล่ flow → docs/product/flows/X-flow.md            │
│   ↓                                                      │
│ Boss: approve flow                                        │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────┴──────────────────────────────────┐
│ PHASE 2: ARCHITECTURE                                    │
│                                                          │
│ Claude: มี architectural decision? → สร้าง ADR             │
│   ↓                                                      │
│ Claude: เขียน migration plan (schema changes)              │
│   ↓                                                      │
│ Boss: approve ADR                                         │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────┴──────────────────────────────────┐
│ PHASE 3: IMPLEMENT                                       │
│                                                          │
│ Claude: implement ตาม spec + ADR                          │
│   ↓                                                      │
│ Claude: สร้าง CHANGELOG entry                              │
│   ↓                                                      │
│ Boss: verify + accept                                     │
└─────────────────────────────────────────────────────────┘
```

### Orchestrator CLI:

```bash
# สร้าง feature spec จาก template
npx zuri new-feature "Daily Sales Brief"

# สร้าง ADR
npx zuri new-adr "Split Prisma Schema"

# ตรวจสอบ flow ก่อน implement
npx zuri verify-flow docs/product/features/DSB.md

# สร้าง changelog entry หลัง commit
npx zuri changelog "v3.8.0" "Add Daily Sales Brief"

# Pre-commit check (ADR required?)
npx zuri pre-commit
```

---

## 7. Model Classification (81 → จัดกลุ่มใหม่)

### Core Models (ทุก industry ใช้) — 25 models

| Group | Models |
|---|---|
| **Tenant** | Tenant, TenantConfig |
| **CRM** | Customer, CustomerProfile |
| **Employee** | Employee |
| **Inbox** | Conversation, Message, ConversationLog, ChatEpisode, ConversationIntelligence |
| **Orders** | Order, Transaction, CartItem |
| **Marketing** | AdAccount, Campaign, AdSet, Ad, AdCreative, AdLiveStatus, AdHourlyMetric, AdDailyMetric, AdHourlyLedger, AdDailyDemographic, AdDailyPlacement, AdActivity |
| **Tasks** | Task |
| **Notifications** | NotificationRule, PushSubscription |

### Shared Models (ข้าม industry ใช้ได้) — 16 models

| Group | Models |
|---|---|
| **Inventory** | Warehouse, WarehouseStock, StockMovement, StockCount, StockCountItem, ProductBarcode |
| **Procurement** | Supplier, PurchaseOrderV2, POItem, POApproval, POAcceptance, POTracking, GoodsReceivedNote, GRNItem, POReturn, POIssue, CreditNote, Advance |
| **Audit** | AuditLog, AdsOptimizeRequest |
| **AI** | KnowledgeFile, AIConfig, AIAssistLog |

### Industry: Culinary — 20 models

| Group | Models |
|---|---|
| **Courses** | Product (course), CourseSchedule, CourseMenu, CourseEquipment, ClassAttendance |
| **Enrollment** | Enrollment, EnrollmentItem, Package, PackageCourse, PackageGift, PackageEnrollment, PackageEnrollmentCourse |
| **Kitchen** | Ingredient, IngredientLot, Recipe, RecipeIngredient, RecipeEquipment, MarketPrice, PurchaseRequest, PurchaseRequestItem |
| **Certificates** | Certificate |
| **Stock** | StockDeductionLog |

### DSB (AI Analytics) — 3 models

| Group | Models |
|---|---|
| **Daily Brief** | ConversationAnalysis, DailyBrief, CustomerProfile (shared with CRM) |

### Deprecated / Review — 5 models

| Model | เหตุผล |
|---|---|
| Experiment | ไม่มี relation, ไม่เห็นใช้งาน |
| TimelineEvent | schema minimal, อาจซ้ำกับ AuditLog |
| InventoryItem | ซ้ำกับ WarehouseStock |
| AdReviewResult | อาจ merge กับ Ad |
| BroadcastCampaign | ต้อง review ว่ายังใช้ไหม |

---

## 8. Phased Roadmap

### Phase 0: Foundation (ทำแล้วบางส่วน)
> สร้างโครงสร้างโปรเจค + config + infra

| Task | Subtask | สถานะ |
|---|---|---|
| 0.1 Project scaffold | โฟลเดอร์, package.json, configs | ✅ Done |
| 0.2 Prisma schema (merged) | Copy จาก ZURI, ยังไม่ split | ✅ Done (basic) |
| 0.3 Infra libs | db, redis, qstash, pusher, tenant | ✅ Done |
| 0.4 RBAC + permissionMatrix | 12 roles, can() function | ✅ Done |
| 0.5 CLAUDE.md + memory | Project rules | ✅ Done |
| 0.6 Skeleton pages + routes | Placeholder ทุกหน้า | ✅ Done |

### Phase 1: DOC — Feature Specs (ยังไม่ทำ)
> เขียน spec ทุก feature ให้นิ่งก่อน implement

| Task | Subtask | Priority |
|---|---|---|
| 1.1 Copy + clean docs จาก ZURI | PRD, SPEC, feature specs → docs/ | 🔴 |
| 1.2 เขียน module manifest | แต่ละ module มี index.js + README | 🔴 |
| 1.3 เขียน data flow ทุก module | docs/architecture/data-flows/ | 🔴 |
| 1.4 Review + approve ทุก feature spec | Boss sign-off | 🔴 |
| 1.5 เขียน gotchas จาก ZURI | docs/gotchas/ | 🟠 |
| 1.6 สร้าง Obsidian vault config | docs/_vault/, graph view | 🟠 |

### Phase 2: DOC — Architecture Decisions
> ADR สำหรับ decisions ที่ต่างจาก ZURI เก่า

| Task | ADR | เนื้อหา |
|---|---|---|
| 2.1 | ADR-060: Modular Architecture | ทำไมแยก modules/, industry plugin |
| 2.2 | ADR-061: Split Prisma Schema | prisma-merge strategy |
| 2.3 | ADR-062: Obsidian as SSOT | docs/ = vault, no copy |
| 2.4 | ADR-063: Dev Tools Isolation | .dev/ แยก, .vercelignore |
| 2.5 | ADR-064: DOC TO CODE Workflow | Orchestrator CLI, pre-commit |
| 2.6 | ADR-065: Industry Plugin System | Tenant config → module loading |
| 2.7 | ADR-066: Component Size Limit | Max 500 LOC per component |
| 2.8 | ADR-067: Changelog System v2 | Sliding window + orchestrator |

### Phase 3: Orchestrator CLI
> Dev tool สำหรับ enforce workflow

| Task | Subtask | ภาษา |
|---|---|---|
| 3.1 Scaffold .dev/orchestrator/ | package.json, cli.js (commander) | Node.js |
| 3.2 `new-feature` command | สร้าง feature spec จาก template | Node.js |
| 3.3 `new-adr` command | สร้าง ADR จาก template + auto-number | Node.js |
| 3.4 `changelog` command | Sliding window update | Node.js |
| 3.5 `verify-flow` command | Parse spec → check completeness | Node.js |
| 3.6 `pre-commit` hook | Check: ADR exists? Spec approved? | Node.js |
| 3.7 `sync-check` command | Verify docs/ integrity | Node.js |

### Phase 4: Core Module Migration
> ย้าย feature จาก ZURI → CO ทีละ module

| Task | Module | Models | จาก ZURI |
|---|---|---|---|
| 4.1 | core/auth | Employee, session | authOptions.js, rbac.js |
| 4.2 | core/tenant | Tenant, TenantConfig | tenant.js, middleware.js |
| 4.3 | core/crm | Customer, CustomerProfile | customerRepo.js (222 LOC) |
| 4.4 | core/inbox | Conversation, Message | inboxRepo.js (372 LOC), FacebookChat.js |
| 4.5 | core/pos | Order, Transaction | PremiumPOS.js (2.4K → split), ChatPOS.js |
| 4.6 | core/marketing | Ad, Campaign, Metrics | marketingRepo.js (798 LOC), FacebookAds.js |
| 4.7 | core/tasks | Task | TaskPanel.js (1.2K) |
| 4.8 | core/employees | Employee | EmployeeManagement.js (2K → split) |
| 4.9 | core/ai | Gemini endpoints | compose-reply, ask, DSB |
| 4.10 | core/notifications | Push, LINE, In-App | notificationEngine.js |

### Phase 5: Shared Module Migration

| Task | Module | Models |
|---|---|---|
| 5.1 | shared/inventory | Warehouse, StockMovement, StockCount |
| 5.2 | shared/procurement | PO lifecycle (919 LOC repo → split) |
| 5.3 | shared/audit | AuditLog, approval workflow |

### Phase 6: Industry Plugin — Culinary

| Task | Module | Models |
|---|---|---|
| 6.1 | industry/culinary/courses | Course, Schedule, Attendance |
| 6.2 | industry/culinary/recipes | Recipe, BOM, Menu |
| 6.3 | industry/culinary/kitchen | Ingredient, Lot (FEFO), Stock |
| 6.4 | industry/culinary/certificates | Certificate |
| 6.5 | industry/culinary/packages | Package bundling |

### Phase 7: Integration & Testing

| Task | Subtask |
|---|---|
| 7.1 | E2E flow testing (Inbox → Order → Payment) |
| 7.2 | Multi-tenant isolation testing |
| 7.3 | Industry plugin switching test |
| 7.4 | Performance benchmark vs ZURI |
| 7.5 | Migration script: ZURI DB → CO DB |

---

## 9. Orchestrator Technical Design

### ภาษา: Node.js (ใช้ใน project อยู่แล้ว)

```
.dev/orchestrator/
├── package.json
│   dependencies:
│     commander: CLI framework
│     inquirer: Interactive prompts
│     chalk: Colored output
│     gray-matter: Parse frontmatter
│     glob: File matching
│     yaml: Parse YAML
│
├── cli.js                  # #!/usr/bin/env node
│   program
│     .command('new-feature <name>')
│     .command('new-adr <title>')
│     .command('changelog <version> <summary>')
│     .command('verify-flow <spec-path>')
│     .command('pre-commit')
│     .command('sync-check')
│
├── commands/
│   ├── new-feature.js
│   │   1. Prompt: module (core/shared/industry)
│   │   2. Prompt: description
│   │   3. Create docs/product/features/{name}.md from template
│   │   4. Create docs/product/flows/{name}-flow.md
│   │   5. Log: "Feature spec created — review before implement"
│   │
│   ├── new-adr.js
│   │   1. Scan docs/adr/ → find next number
│   │   2. Prompt: context, decision, consequences
│   │   3. Create docs/adr/ADR-{NNN}-{slug}.md
│   │   4. Log: "ADR created — needs approval"
│   │
│   ├── changelog.js
│   │   1. Read CHANGELOG.md
│   │   2. Create changelog/CL-{date}-{serial}.md (full detail)
│   │   3. Add to Recent section (top)
│   │   4. If Recent > 5 → move oldest to Index
│   │   5. Update LATEST pointer
│   │
│   ├── verify-flow.js
│   │   1. Parse feature spec frontmatter
│   │   2. Check: has data flow? has API endpoints? has roles?
│   │   3. Check: referenced models exist in schema?
│   │   4. Check: ADR exists if architectural decision?
│   │   5. Report: PASS / FAIL with reasons
│   │
│   └── pre-commit.js
│       1. Check staged files
│       2. If schema.prisma changed → ADR required?
│       3. If API route changed → feature spec updated?
│       4. If > 500 LOC component → warn
│       5. Report: PASS / BLOCK with reasons
│
└── templates/
    ├── feature-spec.md
    ├── adr.md
    └── changelog-entry.md
```

---

## 10. Shared Context Strategy

### ไฟล์ที่ push ขึ้น GitHub ได้:

```
.dev/shared-context/
├── GOAL.md              # Current objectives (ไม่มี secret)
├── MEMORY.md            # Agent handover log
├── CONTEXT_INDEX.yaml   # Session context map
└── AGENT_PROTOCOL.md    # Agent behavior rules
```

### ไฟล์ที่ห้าม push:
```
.env.local               # Secrets
.dev/scripts/backfill/   # มี connection strings
```

### .gitignore ใหม่:
```
node_modules/
.next/
.env
.env.local
.vercel
docs/_vault/.obsidian/   # Obsidian personal config
```

### .vercelignore (ไม่ deploy ขึ้น Vercel):
```
.dev/
docs/
changelog/
*.yaml
*.md
!CLAUDE.md
```

---

## 11. ลำดับการทำงาน (ขั้นตอนถัดไป)

```
ตอนนี้อยู่ที่: Phase 0 ✅ (scaffold done)

ขั้นตอนถัดไป:
1. Boss approve แผนนี้
2. → Phase 1: เขียน/copy feature specs ให้ครบ
3. → Phase 2: เขียน ADR สำหรับ decisions ใหม่
4. → Phase 3: สร้าง orchestrator CLI
5. → Phase 4-6: Migrate ทีละ module (DOC TO CODE)
```

---

## 12. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| Spec ไม่นิ่ง เปลี่ยนบ่อย | DOC TO CODE enforce — ไม่ implement จนกว่า approve |
| Module dependency ซับซ้อน | แต่ละ module มี manifest, explicit imports |
| Prisma merge conflict | prisma-merge tool + CI check |
| Obsidian vault conflict | Git track ทุกไฟล์, resolve ปกติ |
| Agent hallucinate schema | Schema split ทำให้อ่านง่ายขึ้น + docs/gotchas/ |
| Component ใหญ่ขึ้นอีก | Pre-commit hook warn > 500 LOC |
