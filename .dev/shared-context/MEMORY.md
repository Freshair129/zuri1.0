# Agent Memory — Progress Log

> ใช้สำหรับ handover ระหว่าง sessions
> อ่านทุกครั้งที่เริ่ม session ใหม่

---

## 2026-03-28 — Session 1 (Claude Opus)

### สิ่งที่ทำ (ครบ 1 session ใหญ่)

**Phase 0: Foundation ✅**
1. ออกแบบโครงสร้าง modular (core/shared/industry)
2. สร้าง scaffold: 139+ files
3. Prisma schema 17 models (core)
4. Infrastructure: db, redis, qstash, pusher, tenant, RBAC, systemConfig, idGenerator
5. Skeleton pages (22), API routes (38), components (32), repos (13), hooks (4), utils (2)
6. Copy YAML configs จาก ZURI (system_config, id_standards, system_requirements)

**Docs ✅**
7. อ่าน ZURI codebase ทั้งหมด: 81 models, 341 files, ~61K LOC, 167 API routes
8. อ่าน 6 incidents + 33 ADRs (024-056) โดยละเอียด
9. สร้าง docs/gotchas/ — 7 หมวด, 30 rules
10. เขียน RESTRUCTURE_PLAN.md — 8 phases, modular arch, DOC TO CODE
11. เขียน PRD v2.0.0 — 15 sections (industry-agnostic, competitive, metrics)
12. เขียน ERD v2.0.0 — 16 sections (17 models + migration plan +40 models, Mermaid, flowcharts)

**Dev Tools ✅**
13. สร้าง .dev/ directory ทั้งหมด
14. Orchestrator CLI — 6 commands ทำงานจริง (new-feature, new-adr, changelog, verify-flow, pre-commit, sync-check)
15. Templates — feature-spec, adr, changelog-entry
16. Agent Protocol — 8 sections (hierarchy, session start, DOC TO CODE, code rules, checkpoint, incident prevention, handoff, communication)
17. Shared Context — GOAL.md, MEMORY.md, CONTEXT_INDEX.yaml
18. Claude Skills — 11 ตัว (catchup, checkpoint, 6 domain experts, verify-adr, sync-docs, plan-phase)
19. Sub-Agent Skills — 4 ตัว (code-reviewer, test-writer, migration-planner, doc-writer)
20. Copy ไป .claude/skills/ แล้ว

**Multi-Agent (vibecode) ✅**
21. ย้าย vibecode จาก E:\multiagent-main → .dev/vibecode/
22. แก้ agents.yaml — 9 agents + domain ownership + module assignment + dependency graph + ownership matrix
23. แก้ router.yaml — 4 cost modes (quality/balanced/speed/free) + Claude Opus/Sonnet + Gemini Pro/Flash routing
24. แก้ gates.yaml — 15 gate rules (7 require approval, 8 auto)

**MCP Check ✅**
25. ตรวจ MCP: 12 ตัวติดตั้งแล้ว, ขาด Google Sheets + Docs (Drive อ่านได้แต่ edit ไม่ได้), NotebookLM ไม่มี MCP

### สถานะปัจจุบัน
- Phase 0 (Foundation): ✅ Done
- Phase 1 (Feature Specs): 🔲 Next — รอ Boss approve RESTRUCTURE_PLAN.md

### Key Decisions Made (session นี้)
- docs/ = Obsidian vault (single SSOT, no copy)
- .dev/ = dev tools (ไม่ deploy, push GitHub ได้)
- src/modules/ = modular architecture (core/shared/industry)
- DOC TO CODE = mandatory workflow
- Node.js สำหรับ orchestrator
- Python สำหรับ vibecode multi-agent
- Model routing: Opus (arch/review) → Sonnet (code) → Gemini Pro (specs) → Gemini Flash (tests/docs)
- MCP: Supabase+Vercel always-on, ที่เหลือ on-demand

### Files Changed (key files)
- E:\zuri\ — ทั้ง project (สร้างใหม่)
- docs/product/PRD.md — PRD v2.0.0
- docs/architecture/database-erd/full-schema.md — ERD v2.0.0
- docs/gotchas/*.md — 7 files, 30 rules
- docs/zuri/RESTRUCTURE_PLAN.md — 8 phases roadmap
- .dev/orchestrator/ — CLI + 6 commands + 3 templates
- .dev/agents/ — 11 Claude skills + 4 sub-agent skills + AGENT_PROTOCOL.md
- .dev/vibecode/config/ — agents.yaml, router.yaml, gates.yaml
- .dev/shared-context/ — GOAL.md, MEMORY.md, CONTEXT_INDEX.yaml
- CLAUDE.md — project rules
- prisma/schema.prisma — 17 models

### Pending / Next Session
1. Boss approve RESTRUCTURE_PLAN.md
2. Phase 1: Copy + clean feature specs จาก ZURI → CO docs/
3. Phase 2: เขียน 8 ADRs ใหม่ (ADR-060 to 067)
4. Phase 3: ปรับ vibecode ให้ทำงานจริงกับ Claude Code + Gemini CLI
5. ติดตั้ง Google Sheets + Docs MCP (ถ้าต้องการ)

---

## 2026-03-30 — Session 2 (Claude Sonnet)

### สิ่งที่ทำ

**Feature Specs ✅**
1. FEAT-ACCOUNTING-PLATFORM.md — APPROVED. Adapter pattern: FlowAccount (REST API OAuth 2.0 full auto) + Express ESG (X-import Excel semi-auto). เราไม่ทำโมดูลบัญชีเอง
2. FEAT-AI-ASSISTANT.md — APPROVED v1.2. เพิ่ม: LINE Group ส่งยอด (REPORT intent), LINE Group รับออเดอร์ (ORDER intent), Slip processing (SLIP intent, Gemini Vision)
3. PRD.md — APPROVED v2.2. Sync กับทุก spec ที่ approve แล้ว. Section 5.9 AI add-on, 5.10 Accounting Platform, pricing table
4. ROADMAP.md — APPROVED v2.1. A5 (AI Assistant) ย้าย M6→M3. E1 (Accounting Platform) เพิ่ม M4

**Git + GitHub ✅**
5. git init → 253 files → push ขึ้น https://github.com/Freshair129/zuri1.0.git (branch: main)
6. Rename: E:\CO → E:\zuri (เดิม E:\ZURI = v1 monolith → E:\ZURI-v1)
7. แก้ path references ใน 8 ไฟล์ (E:/CO → E:/zuri)

**Documentation ✅**
8. AGENT_PROTOCOL.md v1.1 — เพิ่ม Section 9 (Obsidian Second Brain)
9. CLAUDE.md — เพิ่ม AI add-on, Accounting add-on, Obsidian Second Brain section
10. Obsidian MCP config แก้ path จาก E:\CO\docs → E:\zuri\docs

**Claude Code Custom Commands ✅**
11. .claude/commands/catchup.md — /catchup command
12. .claude/commands/checkpoint.md — /checkpoint command

**Research (ไม่ implement) ✅**
13. Gmail expense pipeline → ไม่คุ้มสร้างสำหรับ Zuri (Thai biz ใช้ PromptPay ไม่ใช่ email)
14. Express ESG → ไม่มี REST API → X-import (Excel bridge) เป็น solution เดียว
15. FlowAccount → OpenAPI OAuth 2.0, apply ที่ developer_support@flowaccount.com

**Excel ✅**
16. E:/march_2026_expenses.xlsx — 3 sheets: รายจ่าย (12 items), ตัดออก (2), สรุปตามหมวด

### สถานะปัจจุบัน
- Phase 1 Feature Specs: 🔄 In Progress — PRD/ROADMAP/AI-ASSISTANT/ACCOUNTING-PLATFORM approved, ยัง copy docs จาก ZURI-v1 ไม่ได้
- RESTRUCTURE_PLAN.md: รอ Boss approve
- CHANGELOG.md: ยังไม่มี

### Key Decisions (session นี้)
- ไม่สร้าง Gmail expense pipeline
- Accounting = adapter pattern (FlowAccount auto + Express semi-auto), ไม่ทำบัญชีเอง
- Gemini Vision สำหรับ slip processing (ไม่ต้องการ OCR service แยก)
- AI Assistant Pricing: Starter ฿890, Pro ฿1,290 (one-time purchase TBD)
- .claude/commands/ (ไม่ใช่ .claude/skills/) สำหรับ slash commands

### Files Changed
- docs/product/PRD.md — v2.2
- docs/product/ROADMAP.md — v2.1
- docs/product/specs/FEAT-ACCOUNTING-PLATFORM.md — NEW, APPROVED
- docs/product/specs/FEAT-AI-ASSISTANT.md — v1.2, APPROVED
- .dev/agents/AGENT_PROTOCOL.md — v1.1
- CLAUDE.md — updated
- .claude/commands/catchup.md — NEW
- .claude/commands/checkpoint.md — NEW

### Pending / Next Session
1. Boss approve RESTRUCTURE_PLAN.md (ค้างมาจาก session 1)
2. ~~สร้าง CHANGELOG.md~~ → Done (v2.3.0)
3. ~~Task 1.1: Copy + clean feature specs~~ → Done (7 specs + 1 tech-spec)
4. Task 1.2: Module manifests
5. Task 1.6: Obsidian vault config
6. ADR-060 to ADR-069 (ทุกตัว pending)
7. Contact FlowAccount: developer_support@flowaccount.com
8. Push latest commits ที่ยังไม่ได้ push
9. เขียน FEAT-CRM, FEAT-KITCHEN, FEAT-ENROLLMENT, FEAT-MARKETING (ไม่มีใน ZURI-v1)

---

## 2026-03-30 — Session 3 (Claude Opus)

### สิ่งที่ทำ

**Task 1.1: Copy + Clean Feature Specs ✅**
1. Scanned ZURI-v1 `docs/zuri/` — found 11 .md files
2. Copied 7 feature specs → `docs/product/specs/`:
   - FEAT-INBOX.md — Unified Inbox (FB+LINE), 3-panel, Quick Sale
   - FEAT-DSB.md — AI Daily Sales Brief + ConversationAnalysis + CustomerProfile + DailyBrief models
   - FEAT-BILLING.md — Invoice & Payment, slip OCR
   - FEAT-PROFILE.md — Customer Profile (CRM), identity resolution
   - FEAT-AGENT.md — AI Assistant Panel (compose-reply + ask-AI)
   - FEAT-MULTI-TENANT.md — Shared DB + tenantId + RLS backstop
   - FEAT-LINE-AGENT.md — LINE Webhook Agent Mode + escalation
3. Copied tech-spec.md → `docs/architecture/tech-spec.md`
4. Skipped: TOKEN-REFRESH.md (cancelled — System User Token), PRD.md (zuri has v2.2 newer)
5. Updated CHANGELOG.md → v2.3.0

**Cleaning applied:**
- Renamed all files to FEAT-*.md format
- Updated cross-references (INBOX.md → FEAT-INBOX.md, etc.)
- Updated realtime tech refs (SSE → Pusher where applicable)
- Standardized priority labels (🔴 → P0, 🟠 → P1, 🟡 → P2)

### สถานะปัจจุบัน
- Phase 1 Feature Specs: 🔄 In Progress
  - Task 1.1 ✅ (7 specs copied)
  - Task 1.2 🔲 (module manifests)
  - Task 1.3 🔲 (data flow)
  - Task 1.4 🔲 (Boss sign-off)
  - Task 1.5 ✅ (gotchas)
  - Task 1.6 🔲 (Obsidian vault config)
- Total specs in docs/product/specs/: 11 files
- Missing specs (not in ZURI-v1): CRM, Kitchen, Enrollment, Marketing — ต้องเขียนใหม่

### Files Changed
- docs/product/specs/FEAT-INBOX.md — NEW
- docs/product/specs/FEAT-DSB.md — NEW
- docs/product/specs/FEAT-BILLING.md — NEW
- docs/product/specs/FEAT-PROFILE.md — NEW
- docs/product/specs/FEAT-AGENT.md — NEW
- docs/product/specs/FEAT-MULTI-TENANT.md — NEW
- docs/product/specs/FEAT-LINE-AGENT.md — NEW
- docs/architecture/tech-spec.md — NEW
- CHANGELOG.md — v2.3.0
- .dev/shared-context/GOAL.md — updated task 1.1 ✅, specs list
- .dev/shared-context/MEMORY.md — added session 3

6. เขียน 4 specs ใหม่ (ไม่มีใน ZURI-v1) ด้วย subagents:
   - FEAT-CRM.md — Customer list, lead funnel, identity resolution, tags, segments, import/export
   - FEAT-KITCHEN.md — Recipe management, FEFO stock, auto-deduction, prep sheet, wastage
   - FEAT-ENROLLMENT.md — Package catalog, enrollment lifecycle, QR attendance, certificates
   - FEAT-MARKETING.md — Meta Ads dashboard, QStash sync, ROAS, demographics, attribution
7. Updated CHANGELOG.md → v2.3.0 (11 new specs total)

**Task 1.2: Module Manifests ✅**
8. Created 13 module manifests in docs/product/module-manifests/:
   - Core (8): crm, inbox, pos, marketing, dsb, enrollment, kitchen, tasks
   - Shared (5): auth, ai, multi-tenant, notifications, procurement
   - Each defines: models, repos, APIs, workers, pages, components, hooks, deps, public API
9. Updated CHANGELOG.md, GOAL.md

**Task 1.3: Data Flows ✅**
10. Created 11 data flow docs in docs/architecture/data-flows/:
    - Core (8): crm, inbox, pos, marketing, dsb, enrollment, kitchen, tasks
    - Shared (3): auth, ai, multi-tenant
    - Each has: Mermaid sequence diagrams, read/write/realtime/cache/cross-module sections
11. Updated CHANGELOG.md, GOAL.md

**Task 1.6: Obsidian Vault Config ✅**
12. Updated HOME.md — full vault dashboard (15 specs, 11 data flows, manifests, gotchas, guides)
13. Updated graph.json — 8 color groups for all doc folders
14. Enabled core plugins: templates, daily-notes, note-composer, word-count
15. Created 3 templates: feature-spec.md, adr.md, devlog.md
16. Created hotkeys.json, templates.json, daily-notes.json configs

**Phase 2: ADRs ✅**
17. Created 8 ADRs (ADR-060 to ADR-067) in docs/decisions/adrs/:
    - ADR-060: Modular Architecture (core/shared/industry split)
    - ADR-061: Split Prisma Schema (prisma-merge per module)
    - ADR-062: Obsidian as SSOT (docs/ = vault)
    - ADR-063: Dev Tools Isolation (.dev/ directory)
    - ADR-064: DOC TO CODE Workflow (mandatory spec before code)
    - ADR-065: Industry Plugin System (tenant-configured modules)
    - ADR-066: Component Size Limit (max 500 LOC)
    - ADR-067: Changelog System v2 (sliding window)
18. All status: PROPOSED — pending Boss approval

**Phase 3: Orchestrator CLI Update ✅**
19. Updated 7 commands + template to use new paths (specs/, decisions/adrs/)
20. Updated module choices (13 modules), ADR auto-numbering after 067

**Phase 4+6: Modular Architecture ✅**
21. Created src/modules/core/ — 8 modules with index.js barrel exports
22. Created src/modules/shared/ — 3 modules (ai, multi-tenant, procurement)
23. Created src/modules/industry/culinary/ — plugin manifest + enrollment + kitchen
24. Created 2 event handler skeletons (onOrderCreated, onClassStarted)
25. Created industry plugin registry with lazy-loading

### สถานะปัจจุบัน (updated)
- Total specs: 15 files in docs/product/specs/
- Task 1.1 ✅ Complete (all feature specs done)
- Missing specs: None — all modules covered

### Pending / Next Session
1. Boss approve RESTRUCTURE_PLAN.md (ค้างจาก session 1)
2. ~~เขียน FEAT-CRM, FEAT-KITCHEN, FEAT-ENROLLMENT, FEAT-MARKETING~~ → Done
3. Task 1.2: Module manifests
4. Task 1.3: Data flow ทุก module
5. Task 1.6: Obsidian vault config
6. Task 1.4: Boss review + sign-off ทุก spec
7. ADR-060 to ADR-069
8. Contact FlowAccount
9. Push latest commits
