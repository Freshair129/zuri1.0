# Changelog — Zuri Platform v2

> Format: [version] date — summary
> LATEST → v2.2.8

---

## [2.2.8] 2026-04-06

### Added — culinary/certificates: Phase 6.4 (M2) — Certificate lifecycle

**Schema (ต้อง `prisma db push`)**
- `Enrollment` — เพิ่ม `tenantId`, `packageId`, `orderId`, `hoursCompleted`, `completedAt`; status default → `PENDING`; relations: `items[]`, `attendance[]`, `certificate?`; เพิ่ม indexes
- `EnrollmentItem` (NEW) — per-course progress tracking (hoursCompleted, status PENDING/IN_PROGRESS/COMPLETED)
- `ClassAttendance` (NEW) — QR/manual check-in per student per class; `@@unique([enrollmentId, scheduleId])` ป้องกัน double check-in (G1)
- `Certificate` (NEW) — `certificateId` (CERT-YYYYMMDD-NNN), `level` (BASIC_30H/PRO_111H/MASTER_201H), `pdfUrl`, `notifiedAt`; `@@unique(enrollmentId)` guard G7
- `CourseSchedule` — เพิ่ม `tenantId`, `attendances[]`, indexes

**Repositories**
- `src/lib/repositories/certificateRepo.js` (NEW) — `findMany`, `findById`, `createForEnrollment` (idempotent), `generateCertId`, `getCertLevel`, `findCompletableEnrollments`, `completeEnrollment`, `markNotified`, `updatePdfUrl`

**API Routes**
- `GET /api/culinary/certificates` — list certs, pagination + customerId filter; `withAuth(enrollment:R)`
- `GET /api/culinary/certificates/[id]` — by UUID or certificateId string; `withAuth(enrollment:R)`
- `POST /api/workers/check-completion` (NEW) — QStash cron hourly: หา IN_PROGRESS enrollments ที่ hoursCompleted >= threshold → mark COMPLETED → issue Certificate; throws for QStash retry (NFR3)

---

## [2.2.8] 2026-04-06

### Roadmap Cleanup — Phase 1 Docs & Phase 2 ADR-069 ✅
- `docs/architecture/data-flows/` — Added data flow diagrams for Audit, Inventory, Procurement, and Notifications modules.
- `docs/.obsidian/` — Updated community plugins for better dev experience.
- `docs/decisions/adrs/ADR-069.md` — NEW: AI Context Layer (NotebookLM) architecture decision.

### 4.5 core/pos — POS Full Upgrade ✅
- `src/lib/ai/slipVerifier.js` — NEW: Gemini Vision integration for Thai bank slip OCR (Verified).
- `src/app/api/payments/verify-slip/` — NEW: Real-time QR slip verification endpoint (Verified).
- `src/lib/repositories/orderRepo.js` — Process payment now triggers automated ingredient inventory deduction (FEFO).
- `src/app/(dashboard)/pos/` — UI: Quick Sale (custom items), QR Slip upload with AI verify, and Receipt preview/print system.
- `src/lib/repositories/ingredientRepo.test.js` — NEW: Unit tests for FEFO inventory logic (Passed).
- `src/lib/repositories/orderRepo.test.js` — NEW: Unit tests for payment & inventory sync (Passed in Transaction).
- `src/lib/redis.js` — FIXED: Exported `redis` singleton to prevent undefined import errors in tests/repos.
- `src/tests/mocks/redisMock.js` — NEW: Global Redis mock for Vitest stability.
- `src/lib/repositories/customerRepo.test.js` — REFINED: Updated expectations to match multi-tenant & soft-delete implementation.

---

## [2.2.7] 2026-04-05

### Multi-tenant Token Migration — FB/LINE tokens out of env, into DB

- `prisma/schema.prisma` — Tenant: เพิ่ม `fbPageToken`, `lineChannelToken` columns ⚠️ ต้อง `prisma db push`
- `tenantRepo` — เพิ่ม `getTenantTokens(tenantId)`: raw token fetch (no cache) + env fallback; อัปเดต `updateTenantIntegrations` รับ token fields + bust 3 Redis keys; `hasFbPage`/`hasLineOa` เช็ค token ด้วย
- `workers/send-message` — เปลี่ยนจาก `process.env` hardcode → `getTenantTokens(tenantId)` (tenant DB first, env fallback)
- `PATCH /api/tenant/integrations` (NEW) — OWNER only, อัปเดต fbPageId/fbPageToken/lineOaId/lineChannelToken
- `settings/page.jsx` — Integrations section: FB + LINE token form พร้อม show/hide toggle, connected badge

---

## [2.2.6] 2026-04-05

### Dev Tooling — Doppler as env SSOT + prisma db push confirmed
- อัปเดต `CLAUDE.md` เพิ่ม section **Environment Variables** — Doppler เป็น SSOT ของ secrets ทุกตัว
- Pattern บังคับ: `doppler run -- npx prisma db push` (ไม่ใช่ `npx prisma` โดยตรง)
- ยืนยัน `doppler run -- npx prisma db push` → "already in sync" — schema ตรงกับ Supabase
- Prisma Client v5.22.0 regenerated เรียบร้อย

---

## [2.2.5] 2026-04-05

### Added — core/ai: Gemini Endpoints + Daily Sales Brief Pipeline (FEAT10)
- `src/lib/ai/conversationAnalyzer.js` — Gemini per-conversation analysis: contactType, state, cta, revenue, tags, summary
- `src/lib/ai/customerProfiler.js` — Gemini demographic inference: gender, cookingLevel, motivation, budgetSignal ฯลฯ (UNKNOWN > guess)
- `POST /api/ai/compose-reply` — withAuth(inbox:R), tone parameter, calls generateFollowUpDraft
- `POST /api/ai/ask` — Gemini streaming SSE (`generateContentStream`, `data: [DONE]`)
- `POST /api/ai/promo-advisor` — promotion recommendations จาก order history, graceful fallback
- `POST /api/workers/daily-brief/process` — QStash 00:05 ICT: paginate convs → analyze (parallel) → aggregate → upsert DailyBrief → enqueue notify
- `POST /api/workers/daily-brief/notify` — QStash 08:00 ICT: format Thai LINE message → push via LINE Messaging API → update sentAt
- `GET /api/daily-brief` — list briefs, withAuth(marketing:R), pagination
- `GET /api/daily-brief/[date]` — brief by date (YYYY-MM-DD), withAuth(marketing:R)

### Schema (ต้อง `prisma db push`)
- `ConversationAnalysis` — @@unique(conversationId, analyzedDate), indexes: analyzedDate, contactType, state
- `CustomerProfile` — merge-safe upsert (ไม่ overwrite known ด้วย UNKNOWN)
- `DailyBrief` — @@unique(briefDate), topCtas/adBreakdown/topTags as Json

---

## [2.2.4] 2026-04-05

### Added — Core Modules Migration & Infrastructure
- `core/tasks`: ระบบ Task Management (UI และ API), `taskRepo`, Schema update.
- `core/employees`: ระบบ Employee Management (UI และ API), `employeeRepo`.
- `core/ai`: Gemini Compose Reply API (`/api/ai/compose-reply`) เชื่อมต่อ Gemini 2.0 Flash.
- `core/notifications`: Web Push Subscription API เเละ `pushRepo`.
- `shared/inventory`: Inventory Stock & Movements API (`/api/inventory/*`).
- `shared/audit`: Audit Logs API กรองตาม Tenant.
- **Unit Tests**: เพิ่มชุดทดสอบ `taskRepo.test.js`, `employeeRepo.test.js`, `pushRepo.test.js` (ผ่าน 100%).
- `culinary/recipes`: เพิ่มโมดูลสูตรอาหาร (Schema, Repo, API) และเชื่อมต่อ UI พร้อมระบบค้นหา/กรอง.
- `culinary/courses`: เพิ่ม `courseRepo` และ `ProductRecipe` mapping สำหรับ V School.
- `culinary/schedules`: พัฒนา API `/api/culinary/schedules` และเชื่อมระบบตารางเรียนเข้ากับ Dashboard.
- `culinary/kitchen-ops`: อัปโหลดข้อมูลจริงสู่หน้า Kitchen Intelligence (Live Stock & Schedules).


---

## [2.2.3] 2026-04-05

### Added — FEAT04-inbox: Unified Inbox (conversations API, webhooks, QStash reply, Pusher real-time)
- `GET /api/conversations` — Redis-cached list (NFR2 < 500ms), version-busted on new message
- `GET /api/conversations/[id]` —