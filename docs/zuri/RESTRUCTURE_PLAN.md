# Zuri Platform — Restructure Plan

> Version: 1.2.1
> Date: 2026-04-02
> Status: **IN PROGRESS — Phase 0–7 ✅ · Phase 5/7 Verification 🔄**
> Owner: Boss (Product) · Claude (Lead Architect)
> Approach: **DOC TO CODE** — ไม่ลงมือ implement จนกว่า feature/flow นิ่ง

### Changelog
| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-03-28 | Initial plan |
| 1.1.0 | 2026-04-02 | Add positioning update (AI Business Platform), new FEAT specs, multi-surface platform |
| 1.2.0 | 2026-04-02 | Update phase statuses, add FEAT numbering, new models, update next steps |

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

### 2.0 Positioning (อัพเดท 2026-04-02)

```
เดิม: "Vertical SaaS for Thai service SMEs"
ใหม่: "The AI Business Platform built for Thailand"

Zuri = CDP + CRM + Inbox + POS + Ops + AI + Campaign
     = รู้จักลูกค้า → ส่งหาลูกค้า → วัดผลจริง (loop สมบูรณ์)

จุดเด่นที่คู่แข่งสู้ไม่ได้:
  1. LINE-native (ไม่ใช่แค่ integration)
  2. Slip OCR → ROAS จากสลิปจริง (ไม่ใช่ Meta pixel)
  3. AI enrichment จากแชท LINE/FB → Purchase Intent Score
  4. Kitchen + Enrollment Ops (vertical-specific)
  5. Thai SME pricing
```

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
│ Claude: สร้าง docs/product/specs/FEATNN-X.md               │
│   ↓                                                      │
│ Boss: review + approve                                    │
│   ↓                                                      │
│ Claude: ไล่ flow → docs/product/specs/FEATNN-X.md §Flow    │
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

### Core Models (ทุก industry ใช้) — 30 models (อัพเดท 2026-04-02)

| Group | Models | หมายเหตุ |
|---|---|---|
| **Tenant** | Tenant, TenantConfig | |
| **CRM** | Customer (+intentScore, +churnScore), CustomerProfile, CustomerInsight | 🆕 CustomerInsight (FEAT14) · intentScore + churnScore fields added |
| **Employee** | Employee | |
| **Inbox** | Conversation, Message, ConversationLog, ChatEpisode, ConversationIntelligence | |
| **Orders** | Order, Transaction, CartItem | |
| **Marketing** | AdAccount, AdSet, Ad, AdCreative, AdLiveStatus, AdHourlyMetric, AdDailyMetric, AdHourlyLedger, AdDailyDemographic, AdDailyPlacement, AdActivity | |
| **Marketing AI** | TenantMarketingConfig, TenantCRMPattern | 🆕 FEAT15 (business memory + pattern analytics) |
| **Campaign** | Campaign, CampaignLog | 🆕 FEAT16 (outbound LINE/FB campaign) · Customer: +optOut, +lastCampaignAt |
| **Tasks** | Task | |
| **Notifications** | NotificationRule, PushSubscription | |

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

### Phase 0: Foundation ✅ DONE
> สร้างโครงสร้างโปรเจค + config + infra

| Task | Subtask | สถานะ |
|---|---|---|
| 0.1 Project scaffold | โฟลเดอร์, package.json, configs | ✅ Done |
| 0.2 Prisma schema (merged) | Copy จาก ZURI, ยังไม่ split | ✅ Done (basic) |
| 0.3 Infra libs | db, redis, qstash, pusher, tenant | ✅ Done |
| 0.4 RBAC + permissionMatrix | 12 roles, can() function | ✅ Done |
| 0.5 CLAUDE.md + memory | Project rules | ✅ Done |
| 0.6 Skeleton pages + routes | Placeholder ทุกหน้า | ✅ Done |

### Phase 1: DOC — Feature Specs ✅ DONE
> เขียน spec ทุก feature ให้นิ่งก่อน implement

**Feature Specs (19 specs, ใน `docs/product/specs/`):**

| ID | File | Status |
|---|---|---|
| FEAT01 | FEAT01-MULTI-TENANT.md | ✅ Approved |
| FEAT02 | FEAT02-PROFILE.md | ✅ Approved |
| FEAT03 | FEAT03-BILLING.md | ✅ Approved |
| FEAT04 | FEAT04-INBOX.md | ✅ Approved |
| FEAT05 | FEAT05-CRM.md | ✅ Approved |
| FEAT06 | FEAT06-POS.md | ✅ Approved |
| FEAT07 | FEAT07-ENROLLMENT.md | ✅ Approved |
| FEAT08 | FEAT08-KITCHEN.md | ✅ Approved |
| FEAT09 | FEAT09-MARKETING.md | ✅ Approved |
| FEAT10 | FEAT10-DSB.md | ✅ Approved |
| FEAT11 | FEAT11-AI-ASSISTANT.md | ✅ Approved |
| FEAT12 | FEAT12-LINE-AGENT.md | ✅ Approved |
| FEAT13 | FEAT13-AGENT.md | ✅ Approved |
| FEAT14 | FEAT14-CRM-AI.md | 🆕 DRAFT — awaiting approval |
| FEAT15 | FEAT15-MARKETING-AI.md | 🆕 DRAFT — awaiting approval |
| FEAT16 | FEAT16-CAMPAIGN.md | 🆕 DRAFT — awaiting approval |
| FEAT17 | FEAT17-ACCOUNTING-PLATFORM.md | ✅ Approved |
| FEAT18 | FEAT18-EXPRESS-INTEGRATION.md | ✅ Approved |
| FEAT19 | FEAT19-PLATFORM.md | 🆕 DRAFT — awaiting approval |

**Supporting Docs (เสร็จแล้ว):**

| Doc | Path | Status |
|---|---|---|
| PRD v2.2 | docs/product/PRD.md | ✅ Updated |
| ROADMAP | docs/product/ROADMAP.md | ✅ Updated |
| Site Map | docs/product/site_map.md | ✅ Done (4 surfaces) |
| API Reference | docs/product/API_REFERENCE.md | ✅ Done (45 routes) |
| Webhook Event Catalog | docs/architecture/WEBHOOK_EVENT_CATALOG.md | ✅ Done |
| UI Component Inventory | docs/product/UI_COMPONENT_INVENTORY.md | ✅ Done (32 components) |
| Dev Setup Guide | docs/DEV_SETUP.md | ✅ Done |
| README | README.md | ✅ Done |
| Landing Page | docs/product/LANDING_PAGE.md | ✅ Done |
| Pitch Deck | docs/product/PITCH_DECK.md | ✅ Done (12 slides) |

### Phase 2: DOC — Architecture Decisions ✅ DONE
> ADR สำหรับ decisions ที่ต่างจาก ZURI เก่า

| Task | ADR | สถานะ |
|---|---|---|
| 2.1 | ADR-060: Modular Architecture | ✅ PROPOSED (ต้อง Boss approve) |
| 2.2 | ADR-061: Split Prisma Schema | ✅ PROPOSED |
| 2.3 | ADR-062: Obsidian as SSOT | ✅ PROPOSED |
| 2.4 | ADR-063: Dev Tools Isolation | ✅ PROPOSED |
| 2.5 | ADR-064: DOC TO CODE Workflow | ✅ PROPOSED |
| 2.6 | ADR-065: Industry Plugin System | ✅ PROPOSED |
| 2.7 | ADR-066: Component Size Limit | ✅ PROPOSED |
| 2.8 | ADR-067: Changelog System v2 | ✅ PROPOSED |

### Phase 3: Orchestrator CLI ✅ DONE
> Dev tool สำหรับ enforce workflow

| Task | Subtask | สถานะ |
|---|---|---|
| 3.1 Scaffold .dev/orchestrator/ | package.json, cli.js (commander) | ✅ Done |
| 3.2 `new-feature` command | สร้าง feature spec จาก template | ✅ Done |
| 3.3 `new-adr` command | สร้าง ADR จาก template + auto-number | ✅ Done |
| 3.4 `changelog` command | Sliding window update | ✅ Done |
| 3.5 `verify-flow` command | Parse spec → check completeness | ✅ Done |
| 3.6 `pre-commit` hook | Check: ADR exists? Spec approved? | ✅ Done |
| 3.7 `sync-check` command | Verify docs/ integrity | ✅ Done |

### Phase 4: Core Module Migration ✅ DONE

| Task | Module | Models | สถานะ |
|---|---|---|---|
| 4.1 | core/auth | Employee, session | ✅ Done |
| 4.2 | core/tenant | Tenant, TenantConfig | ✅ Done |
| 4.3 | core/crm | Customer, CustomerProfile | ✅ Done |
| 4.4 | core/inbox | Conversation, Message | ✅ Done |
| 4.5 | core/pos | Order, Transaction | ✅ Done |
| 4.6 | core/marketing | Ad, Campaign, Metrics | ✅ Done |
| 4.7 | core/tasks | Task | ✅ Done |
| 4.8 | core/employees | Employee | ✅ Done |
| 4.9 | core/ai | Gemini endpoints | ✅ Done |
| 4.10 | core/notifications | Push, LINE, In-App | ✅ Done |

### Phase 5: Shared Module Migration ✅ DONE
> ย้าย Shared modules (Inventory, Procurement, Audit)

| Task | Module | Models | สถานะ |
|---|---|---|---|
| 5.1 | shared/inventory | Warehouse, WarehouseStock, StockMovement, StockCount, StockCountItem | ✅ Done |
| 5.2 | shared/procurement | Supplier, PurchaseOrderV2, POItem, POApproval, GoodsReceivedNote, ... | ✅ Done |
| 5.3 | shared/audit | AuditLog, ApprovalWorkflow | ✅ Done |

### Phase 6: Industry Plugin — Culinary ✅ DONE

| Task | Module | Models | สถานะ |
|---|---|---|---|
| 6.1 | industry/culinary/courses | Course, Schedule, Attendance | ✅ Done |
| 6.2 | industry/culinary/recipes | Recipe, BOM, Menu | ✅ Done |
| 6.3 | industry/culinary/kitchen | Ingredient, Lot (FEFO), Stock | ✅ Done |
| 6.4 | industry/culinary/certificates | Certificate | ✅ Done |
| 6.5 | industry/culinary/packages | Package bundling | ✅ Done |

### Phase 7: Integration & Testing ✅ DONE
> ระบบ testing และการทดสอบ Multi-tenant ให้มั่นใจ 100%

| Task | Subtask | สถานะ |
|---|---|---|
| 7.1 | Test framework setup (Vitest) | ✅ Done |
| 7.2 | Unit tests: customerRepo, auditRepo, inventoryRepo, poRepo, supplierRepo | ✅ Done |
| 7.3 | Integration test: Multi-tenant isolation | ✅ Done |
| 7.4 | Performance benchmark vs ZURI (p95 < 500ms) | ✅ Done |
| 7.5 | Migration script: ZURI DB → CO DB | 🔄 WIP |

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
│   │   3. Auto-number next FEATNN from docs/product/specs/
│   │   4. Create docs/product/specs/FEATNN-{name}.md from template
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

## 11. ลำดับการทำงาน (อัพเดท 2026-04-02)

```
ตอนนี้อยู่ที่: Phase 5/7 Verification ✅

✅ Done: Phase 0, 1, 2, 3, 4, 5, 6, 7
🔄 Remaining:
  - Phase 7.5: Final migration script polish
  - FEAT14+ (Boss approval pending)
```

**Pending Boss Approval:**
- [ ] ADR-060 → ADR-067 (8 ADRs, all PROPOSED)
- [ ] FEAT14-CRM-AI.md (AI Customer Intelligence)
- [ ] FEAT15-MARKETING-AI.md (AskMarketing)
- [ ] FEAT16-CAMPAIGN.md (Outbound Campaign Engine)
- [ ] FEAT19-PLATFORM.md (Multi-surface: PWA + LINE Mini App + Native + PHP Lite)

**Pending Boss Action:**
- [ ] FlowAccount developer API access (developer_support@flowaccount.com)
- [ ] Fill in traction metrics in PITCH_DECK.md Slide 7
- [ ] Fill in pricing tiers and raise amount in PITCH_DECK.md
- [ ] Replace placeholder testimonials in LANDING_PAGE.md

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
