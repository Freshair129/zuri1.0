# Zuri Platform — Claude Code Rules

## Product
Zuri is a Vertical SaaS for culinary schools and food businesses in Thailand.

**Core Modules:** CRM, Unified Inbox (FB+LINE), POS, Marketing/Ads Analytics, Kitchen Ops, Enrollment, Tasks, Daily Sales Brief (AI)

**Add-ons (sold separately):**
- AI Assistant (FEAT-AI-ASSISTANT.md) — Web FAB + LINE Bot + NL2SQL + NL2Data + Group Monitor + Slip OCR
- Accounting Platform (FEAT-ACCOUNTING-PLATFORM.md) — FlowAccount API auto-sync + Express X-import

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

### RBAC (ADR-045)
- 12 roles: DEV, TEC, MGR, MKT, HR, PUR, PD, ADM, ACC, SLS, AGT, STF + OWNER
- Use `can(roles, domain, action)` from `src/lib/permissionMatrix.js`
- Roles stored UPPERCASE in DB

### Config SSOT
- `system_config.yaml` — roles, VAT, statuses, thresholds
- Import via `src/lib/systemConfig.js` — never hardcode these values

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

## File Reference
- `prisma/schema.prisma` — DB schema (single source of truth)
- `src/lib/repositories/` — all DB access
- `src/app/api/workers/` — QStash cron targets
- `src/app/api/webhooks/` — FB + LINE inbound
- `src/middleware.js` — tenant resolution + auth guard

## Obsidian — Second Brain (SSOT for Docs)
- Vault: `docs/` — accessible via Obsidian MCP (`mcp__obsidian__*`)
- `docs/product/PRD.md` — product requirements v2.2
- `docs/product/ROADMAP.md` — milestones M1–M7
- `docs/product/specs/` — FEAT-*.md approved specs (read before implement)
- `docs/decisions/adrs/` — ADR-*.md architecture decisions (read before schema/arch changes)
- `docs/decisions/log.md` — decision history
- `docs/gotchas/` — incident rules (read if unsure)
- **Rule:** ถ้า context หาย → query Obsidian ก่อนถาม Boss
