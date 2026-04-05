# Changelog — Zuri Platform v2

> Format: [version] date — summary
> LATEST → v2.2.5

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
- `GET /api/conversations/[id]` — detail view with full message history + customer profile
- `POST /api/conversations/[id]/reply` — save to DB + enqueue QStash send-message + Pusher event
- `POST /api/workers/send-message` — QStash worker sends outbound via FB Messenger or LINE push API (NFR3: 5 retries)
- `POST /api/webhooks/facebook` — inbound: upsert customer+conversation+message + Pusher (NFR1: async < 200ms)
- `GET /api/webhooks/facebook` —