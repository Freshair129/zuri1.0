# Changelog — Zuri Platform v2

> Format: [version] date — summary
> LATEST → v2.5.2

---

## [2.5.2] 2026-04-02

### Fixed — Deep Architecture Audit & Build Restoration
- [x] **Security**: Fixed QStash signature verification in all worker routes (previously bypassed due to object-check bug).
- [x] **Data Isolation (NFR7)**: Enforced `tenantId` scoping across `campaignRepo`, `orderRepo`, and `conversationRepo` to prevent cross-tenant leaks.
- [x] **Build Restoration**: Restored 12+ missing repository exports (`getOrders`, `getCampaignMetrics`, etc.) identified during deployment failures.
- [x] **AI Standard**: Standardized all AI-driven features to use **Google Gemini 2.0 Flash** (updated from v1.5).
- [x] **Infrastructure**: Added `postinstall: prisma generate` to `package.json` to resolve Vercel build-sync errors.
- [x] **RBAC Alignment**: Updated `system_requirements.yaml` to match the 12-role matrix (ADR-045).

---

## [2.5.1] 2026-04-02

### Fixed — Vercel Deployment (Cron Limit)
- [x] `vercel.json` — Removed cron jobs to comply with Hobby plan limitations (1 Cron/Day).
- [x] Transitioning background tasks to **QStash** for high-frequency scheduling.

---

## [2.5.0] 2026-04-02

### Added — CRM AI: AI Customer Intelligence (FEAT14)
- [x] **AI Analysis Engine** — Integrated Gemini 1.5 Flash for automated conversation analysis.
- [x] **Behavioral Scoring** — Purchase Intent and Churn Risk calculation based on chat context.
- [x] **Enrichment Worker** — QStash-driven worker for background customer profile enrichment.
- [x] **Real-time Alerts** — Pusher integration for "Hot Lead" alerts in the Inbox.
- [x] **AI Insights Tab** — New premium dashboard tab in CRM for deep customer analysis.

### Added — FEAT14 Verification: Unit Testing
- [x] `src/lib/repositories/customerInsightRepo.test.js` — Unit tests for AI insight repository and transactional scoring.
- [x] `src/lib/ai/gemini.test.js` — Unit tests for AI logic with class-based Gemini SDK mocks (100% pass).

---

## [2.4.1] 2026-04-02

## [2.4.2] 2026-04-02

### Added — Phase 1 Verification: Unit Testing
- [x] `src/lib/tenant.test.js` — Unit tests for tenant resolution and helpers (100% pass).
- [x] `src/lib/db.test.js` — Unit tests for Prisma multi-tenant middleware logic.
- [x] `src/middleware.test.js` — Unit tests for subdomain/host resolution and header injection (100% pass).

### Fixed — Multi-Tenant Foundation
- [x] `src/lib/db.ts` — Implemented `prisma.$use` middleware for automatic tenant isolation (MT-P4) using `AsyncLocalStorage`.

---


## [2.4.0] 2026-04-02


### Added — Phase 1: Multi-Tenant Foundation (FEAT01)
- `src/middleware.js` — Refactored tenant resolution to support dynamic subdomain routing (`{slug}.zuri.app`).
- `src/app/api/tenants/` — Tenant management API (Admin only).
- `src/app/(dashboard)/tenants/` — Tenant administration UI for managing school/business clients.
- `src/lib/tenant.js` — Added helpers for tenant resolution and caching.

### Added — Phase 2: Customer Core & Omni-Channel (FEAT02)
- **Tenant Sovereignty (Branding)**:
  - `src/context/TenantContext.jsx` — React Context for global tenant configuration/branding.
  - `src/app/api/tenant/config/` — API to fetch tenant-specific settings (logo, color, name).
  - `src/components/layouts/Sidebar.jsx` — Dynamic branding (logo/color) based on the current tenant's "filling".
  - `src/app/(dashboard)/layout.jsx` — Integrated `TenantProvider` into the core dashboard template.
- **Inbox Enhancements (Right Panel)**:
  - `src/components/inbox/RightPanel.jsx` — Tabbed interface (Activity, Profile, Billing).
  - `src/components/inbox/ProfileTab.jsx` — Real-time customer profile editor with lifecycle stage dropdown.
  - `src/components/inbox/ActivityTab.jsx` — Vertical timeline of customer activity logs.
- **Customer 360 Dashboard (Full View)**:
  - `src/app/(dashboard)/crm/[id]/page.jsx` — Implemented premium dashboard with real-time stats, activity timeline, and AI insights.
  - Omnichannel integration: Added direct link to CRM profiles from the Inbox Right Panel.
  - Expanded `FEAT02-PROFILE.md` to Version 2.0.0 (Customer 360 & Profile).
  - Updated `system_requirements.yaml` with Multi-Tenant & Isolation NFRs.

### Changed — Architecture & Strategy
- Updated `docs/product/PRD.md` to reflect the **"Core Template vs. Tenant Filling"** principle.
- Updated `CLAUDE.md` with mandatory multi-tenant development rules.

---

## [2.3.0] 2026-03-30

### Added — Feature Specs (Task 1.1)
- `docs/product/specs/FEAT-INBOX.md` — Unified Inbox (FB+LINE), 3-panel layout, Quick Sale toggle
- `docs/product/specs/FEAT-DSB.md` — AI Daily Sales Brief, ConversationAnalysis, CustomerProfile, DailyBrief models
- `docs/product/specs/FEAT-BILLING.md` — Invoice & Payment, slip OCR, refNumber dedup
- `docs/product/specs/FEAT-PROFILE.md` — Customer Profile (CRM), identity resolution, ad attribution
- `docs/product/specs/FEAT-AGENT.md` — AI Assistant Panel (compose-reply + ask-AI in Inbox)
- `docs/product/specs/FEAT-MULTI-TENANT.md` — Multi-tenant foundation, shared DB + tenantId + RLS backstop
- `docs/product/specs/FEAT-LINE-AGENT.md` — LINE Webhook Agent Mode, auto-reply + escalation engine
- `docs/architecture/tech-spec.md` — Technical specification (stack, API design, RBAC, integrations)

### Added — New Feature Specs (written from scratch)
- `docs/product/specs/FEAT-CRM.md` — Customer list, lead funnel, identity resolution, tags, segments, import/export
- `docs/product/specs/FEAT-KITCHEN.md` — Recipe management, FEFO stock, auto-deduction, prep sheet, wastage tracking
- `docs/product/specs/FEAT-ENROLLMENT.md` — Package catalog, enrollment lifecycle, class schedule, QR attendance, certificates
- `docs/product/specs/FEAT-MARKETING.md` — Meta Ads dashboard, QStash sync, ROAS, demographics, attribution

### Added — Module Manifests (Task 1.2)
- `docs/product/module-manifests/` — 13 YAML manifests defining module ownership
  - **Core (8):** crm, inbox, pos, marketing, dsb, enrollment, kitchen, tasks
  - **Shared (5):** auth, ai, multi-tenant, notifications, procurement
  - Each manifest defines: models, repos, API routes, workers, pages, components, hooks, dependencies, public API

### Added — Data Flows (Task 1.3)
- `docs/architecture/data-flows/` — 11 data flow documents with Mermaid sequence diagrams
  - **Core (8):** crm, inbox, pos, marketing, dsb, enrollment, kitchen, tasks
  - **Shared (3):** auth, ai, multi-tenant
  - Each covers: read/write flows, external integrations, realtime events, cache strategy, cross-module deps

### Added — Phase 5: Shared Module Migration
- `prisma/schema.prisma` — 19 new models (Inventory: 5, Procurement: 12, Audit: 2), AuditLog tenantId added
- `src/lib/repositories/inventoryRepo.js` — stock levels, FEFO movements, stock counts ($transaction)
- `src/lib/repositories/poRepo.js` — PO lifecycle, approval chain, GRN receipt ($transaction)
- `src/lib/repositories/supplierRepo.js` — supplier CRUD with search
- `src/lib/repositories/auditRepo.js` — updated with tenantId, added findByTenant
- `src/modules/shared/inventory/index.js` + `audit/index.js` — new module barrels
- `src/app/api/procurement/suppliers/` — new supplier API routes (GET, POST, PATCH, DELETE)
- All existing stub API routes wired to real repo calls

### Added — Phase 7: Integration Testing
- `vitest.config.mjs` — Vitest config with `@` alias, node env, v8 coverage
- `src/tests/setup.js` — global mock setup with Prisma proxy
- `src/tests/mocks/prismaMock.js` — mock Prisma client factory
- `src/tests/mocks/sessionMock.js` — mock session/tenant helpers
- `src/lib/repositories/inventoryRepo.test.js` — 3 tests
- `src/lib/repositories/poRepo.test.js` — 4 tests
- `src/lib/repositories/supplierRepo.test.js` — 4 tests
- `src/tests/integration/multi-tenant.test.js` — 4 tests (tenant isolation)
- `scripts/migrate-zuri-to-co.js` — 9-phase migration skeleton
- `src/tests/perf/benchmark.js` — NFR2 p95 < 500ms checker
- **15 tests, all passing**

### Added — Phase 3: Orchestrator CLI Update
- Updated all 7 orchestrator commands to use new paths (specs/, decisions/adrs/)
- Updated feature-spec template to match FEAT-*.md format (9 sections)
- Updated module choices (13 modules across core/shared/industry)
- ADR auto-numbering starts after ADR-067

### Added — Phase 4+6: Modular Architecture (CODE)
- `src/modules/core/` — 8 module barrels: crm, inbox, pos, marketing, dsb, tasks, notifications, auth
- `src/modules/shared/` — 3 module barrels: ai, multi-tenant, procurement
- `src/modules/industry/culinary/` — plugin manifest + enrollment + kitchen sub-modules
- `src/modules/industry/culinary/enrollment/handlers/onOrderCreated.js` — skeleton
- `src/modules/industry/culinary/kitchen/handlers/onClassStarted.js` — skeleton (FEFO deduction)
- `src/modules/industry/index.js` — plugin registry with lazy-loading
- Total: 17 index.js files + 2 handler skeletons

### Added — Phase 2: Architecture Decision Records
- `docs/decisions/adrs/ADR-060-modular-architecture.md` — Core/Shared/Industry module split
- `docs/decisions/adrs/ADR-061-split-prisma-schema.md` — prisma-merge per-module schema files
- `docs/decisions/adrs/ADR-062-obsidian-as-ssot.md` — docs/ = Obsidian vault, no copy
- `docs/decisions/adrs/ADR-063-dev-tools-isolation.md` — .dev/ directory, .vercelignore
- `docs/decisions/adrs/ADR-064-doc-to-code-workflow.md` — mandatory spec before implementation
- `docs/decisions/adrs/ADR-065-industry-plugin-system.md` — tenant-configured module loading
- `docs/decisions/adrs/ADR-066-component-size-limit.md` — max 500 LOC per component
- `docs/decisions/adrs/ADR-067-changelog-system-v2.md` — sliding window + orchestrator

### Added — Obsidian Vault Config (Task 1.6)
- `docs/HOME.md` — full vault dashboard with 15 specs, 11 data flows, manifests, gotchas, guides
- `docs/.obsidian/graph.json` — 8 color groups (specs, architecture, data-flows, gotchas, decisions, guide, devtools, product)
- `docs/.obsidian/core-plugins.json` — enabled: templates, daily-notes, note-composer, word-count, editor-status
- `docs/.obsidian/templates.json` — template folder: `templates/`
- `docs/.obsidian/daily-notes.json` — devlog folder with YYYY-MM-DD format
- `docs/.obsidian/hotkeys.json` — Ctrl+G graph, Ctrl+Shift+D daily note, Ctrl+O switcher
- `docs/templates/feature-spec.md` — FEAT-*.md template
- `docs/templates/adr.md` — ADR template
- `docs/templates/devlog.md` — daily dev log template

### Notes
- 7 specs copied from ZURI-v1 `docs/zuri/`, cleaned (FEAT-* naming, updated cross-refs, path fixes)
- 4 specs written from scratch (not found in ZURI-v1 docs)
- TOKEN-REFRESH.md not copied (cancelled — using System User Token instead)
- Total: 15 feature specs + 13 module manifests

---

## [2.2.0] 2026-03-30

### Added
- `docs/product/specs/FEAT-ACCOUNTING-PLATFORM.md` — FlowAccount (auto) + Express ESG (semi-auto) adapter pattern
- `docs/product/specs/FEAT-AI-ASSISTANT.md` v1.2 — LINE Group monitor (REPORT/ORDER/SLIP intents), Gemini Vision slip processing
- `.claude/commands/catchup.md` — /catchup slash command
- `.claude/commands/checkpoint.md` — /checkpoint slash command
- Obsidian MCP configured to read `E:\zuri\docs\` as vault

### Changed
- `docs/product/PRD.md` → v2.2 (synced with all approved specs; AI add-on pricing, Accounting Platform section)
- `docs/product/ROADMAP.md` → v2.1 (A5 AI Assistant moved M6→M3; E1 Accounting Platform added M4)
- `.dev/agents/AGENT_PROTOCOL.md` → v1.1 (Section 9: Obsidian Second Brain)
- `CLAUDE.md` — added AI add-on, Accounting add-on, Obsidian Second Brain rules

### Infrastructure
- Git repo initialized → pushed to https://github.com/Freshair129/zuri1.0.git
- Project renamed: `E:\CO` → `E:\zuri` (v1 monolith: `E:\ZURI` → `E:\ZURI-v1`)

---

## [2.1.0] 2026-03-28

### Added
- Full project scaffold: 139+ files, Prisma schema (17 models)
- Infrastructure: db, redis, qstash, pusher, tenant middleware, RBAC, systemConfig, idGenerator
- Skeleton pages (22), API routes (38), components (32), repos (13)
- `docs/gotchas/` — 7 files, 30 rules from ZURI-v1 lessons
- `docs/zuri/RESTRUCTURE_PLAN.md` — 8-phase modular migration plan
- `docs/product/PRD.md` v2.0 — 15 sections
- `docs/architecture/database-erd/full-schema.md` v2.0
- `.dev/orchestrator/` — CLI with 6 commands
- `.dev/agents/` — Agent Protocol, 11 Claude skills, 4 sub-agent skills
- `.dev/vibecode/` — Multi-agent config (9 agents, cost modes, gate rules)
- `.dev/shared-context/` — GOAL.md, MEMORY.md, CONTEXT_INDEX.yaml

---

## [1.x] Pre-2026-03-28

> Legacy monolith — see `E:\ZURI-v1` (archived)
