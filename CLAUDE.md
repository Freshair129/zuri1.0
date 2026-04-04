# Zuri Platform — Claude Code Rules

## Product
Zuri is an **AI Business Platform** for Thai service SMEs — starting with culinary schools, expandable to any service business via industry plugins.

> **Positioning:** "The AI Business Platform built for Thailand"
> Thai-first · Vertical AI · All-in-one (Inbox + CRM + POS + Ops)

**Core Modules:** CRM, Unified Inbox (FB+LINE), POS, Marketing/Ads Analytics, Kitchen Ops, Enrollment, Tasks, Daily Sales Brief (AI)

**Add-ons (sold separately):**
- AI Assistant (FEAT11-AI-ASSISTANT.md) — Web FAB + LINE Bot + NL2SQL + NL2Data + Group Monitor + Slip OCR
- Accounting Platform (FEAT17-ACCOUNTING-PLATFORM.md) — FlowAccount API auto-sync + Express X-import

**DOC TO CODE:** Never implement without approved spec + ADR. Check `docs/product/specs/` for APPROVED specs before coding.

## Tech Stack
- **Framework:** Next.js 14 (App Router) — deployed on Vercel (serverless)
- **Language:** JavaScript (JSX) — NOT TypeScript (except `src/lib/db.ts` for Prisma)
- **Database:** PostgreSQL via Supabase + Prisma ORM
- **Cache:** Upstash Redis (REST) — `getOrSet` pattern with TTL
- **Queue:** Upstash QStash — cron workers (no BullMQ, no local Redis)
- **Realtime:** Pusher Channels (new-message, customer-updated)
- **Auth:** NextAuth.js v4 (JWT, credentials provider, bcrypt)
- **AI:** Gemini 2.0 Flash — compose-reply, ask-AI, daily brief, NL2SQL (AI Assistant), Gemini Vision (slip OCR + สลิปใน LINE)
- **Styling:** Tailwind CSS + Framer Motion + Lucide icons + Recharts

## Architecture Rules

### Data Flow (CRITICAL)
- **UI reads from DB only** — never call Meta Graph API or LINE Messaging API from UI/API routes
- **QStash workers sync external data → DB** every 1 hour (`/api/workers/sync-hourly`)
- **Webhooks** (FB/LINE) write inbound messages to DB — respond 200 immediately (NFR1: < 200ms)
- Pusher triggers realtime updates to connected clients

### Repository Pattern (MANDATORY)
- ALL DB operations go through `src/lib/repositories/` — no direct `getPrisma()` from API routes or components
- Each repo function receives `tenantId` as first param for multi-tenant isolation

### Multi-Tenant (ADR-056)
- Every core table has `tenant_id` column
- Middleware resolves tenant → injects `x-tenant-id` header
- V School default: `10000000-0000-0000-0000-000000000001`
- **Tenant Sovereignty Rule**: Use `TenantContext` for all UI branding (logo, colors). Never hardcode tenant-specific UI. "Core once, Filling many."


### RBAC (ADR-068)
- 7 roles: **DEV, OWNER, MANAGER, SALES, KITCHEN, FINANCE, STAFF**
- Use `can(roles, domain, action)` from `src/lib/permissionMatrix.js`
- Roles stored UPPERCASE in DB
- Legacy mapping: MGR/ADM/HR → MANAGER | SLS/AGT/MKT → SALES | TEC/PUR/PD → KITCHEN | ACC → FINANCE | STF → STAFF

### Config SSOT
- `system_config.yaml` — roles, VAT, statuses, thresholds
- Import via `src/lib/systemConfig.js` — never hardcode these values

## Changelog (MANDATORY)
- หลัง commit ทุกครั้ง ให้รัน: `python scripts/changelog.py --version vX.Y.Z --severity MINOR|PATCH|MAJOR|HOTFIX --summary "..." --changes "..." --files "..."`
- Script จะสร้าง `changelog/CL-YYYYMMDD-NNN.md` และอัปเดต `CHANGELOG.md` sliding window ให้อัตโนมัติ
- ถ้า context หมดก่อน → ทำเป็น task แรกของ session ถัดไป
- ดูรายละเอียด format และ severity ที่ `docs/CHANGELOG_SYSTEM.md`

## Git Workflow

### Branch Naming
```
feat/FEAT##-<slug>     → feature implementation   (e.g. feat/FEAT05-crm)
fix/<domain>-<issue>   → bug fix                  (e.g. fix/inbox-nfr1)
docs/<topic>           → docs only                (e.g. docs/adr-069)
chore/<topic>          → tooling, config, cleanup
```

### Rules
- **1 branch = 1 feature spec** — never mix FEAT## in one branch
- Always branch off `main` — never branch off another feature branch
- PR required before merge — no direct push to `main`
- Commit message prefix: `feat:` `fix:` `docs:` `chore:`

## Code Style
- Error handling: always `console.error('[ModuleName]', error)` — never catch silently
- Workers: `throw error` to let QStash retry (min 5 retries)
- IDs: follow `id_standards.yaml` (e.g., `CUST-[ULID]`, `EMP-[TYPE]-[DEPT]-[NNN]`)
- No `readFileSync/writeFileSync` — use `fs.promises`

## NFRs
- NFR1: Webhook response < 200ms (respond immediately, process async)
- NFR2: Dashboard API < 500ms (Redis cache)
- NFR3: QStash retry >= 5 times
- NFR5: Identity upsert in `prisma.$transaction`

## Checkpoint Protocol

### ทุก 3-4 tasks:
1. อ่าน CLAUDE.md ซ้ำ (refresh rules)
2. ตรวจสอบ: code ตรงกับ spec ไหม?
3. ตรวจสอบ: ไม่ violate gotchas?

### ก่อน claim "DONE":
1. อ่าน source file จริง (Read tool) — ห้าม assume
2. Verify: imports ถูก? (Lucide ไม่ใช่ FontAwesome)
3. Verify: `getPrisma()` → `await`? (G-AI-01)
4. Verify: `tenantId` ใน query? (G-MT-01)
5. Verify: `console.error` มี `[ModuleName]`?

### ก่อนลบไฟล์ใดๆ:
1. อ่านไฟล์จริงก่อน — ห้าม assume ว่า content เหมือนกัน
2. Diff กับ file ที่จะ supersede: `git show HEAD:<path>` หรืออ่านทั้งสองไฟล์
3. Merge unique content ก่อน แล้วค่อยลบ

## Incident Prevention Checklist

ก่อน commit code ที่เกี่ยวกับ:

### Meta API:
- `action_type` ใช้ `.includes()` ไม่ใช่ exact match (G-META-01)
- `Promise.allSettled` ไม่ใช่ `Promise.all` (G-META-05)
- `maxDuration = 300` ใส่แล้ว (G-WH-03)
- `bulkUpsert` update ทุก field (G-META-06)

### Webhook:
- Return 200 ก่อน process (G-WH-01)
- `upsert` ไม่ใช่ `find+create` (G-WH-02)
- QStash signature verify (G-WH-05)

### Database:
- Array mutation ก่อน DB op (G-DB-04)
- ทุก variable declared (G-DB-05)
- `$transaction` สำหรับ identity + stock (G-DB-03)

### Attribution:
- Revenue match product (G-MKT-01)
- `conversationId` = UUID ไม่ใช่ `t_xxx` (G-DB-02)

## Communication with Boss

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

## Handoff (Cross-Platform Workflow)
- สร้างเมื่อ: Boss สั่ง Claude วางแผน feature → ส่งต่อ Antigravity execute
- Format: `docs/handoff/TEMPLATE.md` (อ่านก่อนสร้างทุกครั้ง)
- บันทึกที่: `docs/handoff/IMP-{YYYYMMDD}-{slug}.md`
- status flow: `DRAFT` → `PENDING_APPROVAL` → `IN_PROGRESS` → `DONE`

## File Reference
- `prisma/schema.prisma` — DB schema (single source of truth)
- `src/lib/repositories/` — all DB access
- `src/app/api/workers/` — QStash cron targets
- `src/app/api/webhooks/` — FB + LINE inbound
- `src/middleware.js` — tenant resolution + auth guard

## Scripts (Python — run from project root)
- `python scripts/changelog.py --version vX.Y.Z --severity PATCH --summary "..." --changes "..." --files "..."` — สร้าง changelog entry
- `python scripts/new-adr.py "ADR Title"` — สร้าง ADR ใหม่ใน docs/decisions/adrs/
- `python scripts/new-feature.py "Feature Name"` — สร้าง feature spec + flow skeleton
- `python scripts/pre-commit.py` — ตรวจสอบ staged files ก่อน commit
- `python scripts/sync-check.py` — ตรวจ docs integrity (ADR frontmatter, spec status, changelog LATEST pointer)
- `python scripts/verify-flow.py docs/product/specs/FEAT-*.md` — ตรวจ spec ครบก่อน implement (ต้อง APPROVED)

## DevLog (MANDATORY)
- เขียน `docs/devlog/YYYY-MM-DD.md` ท้าย session ทุกครั้งก่อนบอก Boss ว่าเสร็จ
- Format: ทำไปแล้ว / ค้างอยู่ / context สำคัญ / session ถัดไปทำต่อ
- อ่าน devlog ล่าสุดก่อนเริ่มงานทุก session เพื่อ pickup context

### Lesson Learned Priority
เมื่อพบ lesson ใหม่ ให้ classify และเพิ่มในที่ที่ถูกต้องทันที:

| Level | ชื่อ | Action | เก็บที่ไหน |
|-------|------|--------|-----------|
| **L0** | Critical | เพิ่มเป็น rule ทันที | `CLAUDE.md` |
| **L1** | Gotcha | สร้าง named entry | `docs/gotchas/` → `G-XX-NN` |
| **L2** | Domain | เพิ่มใน domain doc | domain `CLAUDE.md` หรือ spec |
| **L3** | Log | บันทึกเท่านั้น | `docs/devlog/` |

**เกณฑ์:** L0 = ถ้า violate ซ้ำ → damage/rework ใหญ่ · L1 = technical trap ในโค้ด · L2 = เฉพาะ domain · L3 = ephemeral

## Obsidian — Second Brain (SSOT for Docs)
- Vault: `docs/` — accessible via Obsidian MCP (`mcp__obsidian__*`)
- `docs/HOME.md` — vault index (start here)
- `docs/PROJECT_MAP.md` — codebase navigation (repo structure, domain map, infra)
- `docs/product/PRD.md` — product requirements v2.2
- `docs/product/ROADMAP.md` — milestones M1–M7 (v2.2.0)
- `docs/product/SITEMAP.md` — URL map + roles (45 pages, 12 domains)
- `docs/product/specs/` — FEAT01–FEAT19 approved specs (read before implement)
- `docs/decisions/adrs/` — ADR-057–ADR-068 architecture decisions (read before schema/arch changes)
- `docs/decisions/log.md` — decision history
- `docs/gotchas/` — incident rules (read if unsure)
- **Rule:** ถ้า context หาย → query Obsidian ก่อนถาม Boss
