# FEAT-MULTI-TENANT — Multi-Tenant Foundation

**Status:** APPROVED
**Version:** 1.0.0
**Date:** 2026-03-27
**Origin:** ZURI-v1 (DRAFT)
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview

แปลง Zuri จาก single-tenant (V School only) เป็น multi-tenant SaaS — tenant แต่ละรายมีข้อมูลแยกกัน deploy บน infrastructure เดียวกัน

**Target State:**
```
vschool.zuri.app  → Tenant: The V School
sakura.zuri.app   → Tenant: Sakura Cooking
demo.zuri.app     → Tenant: Demo account
```

---

## 2. Strategy

**Shared DB + Row-Level tenantId** (ตาม PRD ADR-054)

| ตัวเลือก | เลือก | เหตุผล |
|---|---|---|
| Separate DB per tenant | No | ค่า infra สูง, migrate schema N ครั้ง |
| Shared DB + tenantId | Yes | cost ต่ำ, migrate ครั้งเดียว, scale ได้ทีหลัง |
| Shared DB + Supabase RLS | Yes (backstop) | defense in depth — ถ้า app layer miss tenantId |

---

## 3. Tenant Model (ใหม่)

```prisma
model Tenant {
  id          String   @id @default(uuid())
  tenantId    String   @unique @map("tenant_id")  // e.g. "vschool", "sakura"
  name        String                               // "The V School"
  slug        String   @unique                     // subdomain: slug.zuri.app
  plan        String   @default("STARTER")         // STARTER | GROWTH | PRO | ENTERPRISE
  status      String   @default("ACTIVE")          // ACTIVE | SUSPENDED | TRIAL

  // Per-tenant integrations
  fbPageId        String?  @map("fb_page_id")
  fbAdAccountId   String?  @map("fb_ad_account_id")
  lineChannelId   String?  @map("line_channel_id")
  lineGroupId     String?  @map("line_group_id")

  // Per-tenant config (overrides system_config.yaml)
  config      Json     @default("{}") @map("config")
  // { vatRate, currency, timezone, brandColor, logoUrl }

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("tenants")
}
```

---

## 4. tenantId บน Tables ทั้งหมด

74 tables ต้องเพิ่ม `tenantId` — แบ่งเป็น 3 กลุ่ม:

### กลุ่ม A: Core Data (ต้องมี tenantId — 58 tables)

| Domain | Tables |
|---|---|
| **CRM** | Customer, Conversation, Message, ConversationIntelligence, ChatEpisode, AIAssistLog |
| **DSB (ใหม่)** | ConversationAnalysis, CustomerProfile, DailyBrief |
| **MANAGER** | Employee |
| **Sales** | Order, CartItem, Transaction, CreditNote, Advance |
| **Course** | Enrollment, EnrollmentItem, Certificate, ClassAttendance, CourseSchedule, CourseMenu, CourseEquipment |
| **Package** | Package, PackageCourse, PackageEnrollment, PackageEnrollmentCourse, PackageGift |
| **Product** | Product, ProductBarcode |
| **Marketing** | Campaign, Ad, AdSet, AdAccount, AdActivity, AdCreative, AdDailyMetric, AdHourlyMetric, AdDailyDemographic, AdDailyPlacement, AdHourlyLedger, AdLiveStatus, AdReviewResult, AdsOptimizeRequest |
| **Kitchen** | Ingredient, IngredientLot, Recipe, RecipeIngredient, RecipeEquipment |
| **Inventory** | Warehouse, WarehouseStock, InventoryItem, StockCount, StockCountItem, StockDeductionLog, StockMovement |
| **Procurement** | GoodsReceivedNote, GRNItem, PurchaseOrderV2, PurchaseRequest, PurchaseRequestItem, POItem, POAcceptance, POApproval, POIssue, POReturn, POTracking, Supplier, MarketPrice |
| **Asset** | Asset |
| **Task** | Task, TimelineEvent |
| **Notification** | NotificationRule, PushSubscription |
| **Audit** | AuditLog |
| **AI** | KnowledgeFile, Experiment, AIConfig |

### กลุ่ม B: System-level (ไม่ต้องมี tenantId — 2 tables)

| Table | เหตุผล |
|---|---|
| `Tenant` | IS the tenant — ไม่มี self-reference |
| `MarketPrice` | ราคาตลาดกลาง — shared across tenants |

### กลุ่ม C: Review ก่อน (4 tables)

| Table | ผลการ review |
|---|---|
| `AIConfig` | per-tenant → ใส่ tenantId |
| `NotificationRule` | per-tenant → ใส่ tenantId |
| `KnowledgeFile` | per-tenant knowledge base → ใส่ tenantId |
| `Experiment` | per-tenant → ใส่ tenantId |

---

## 5. Prisma Schema Pattern

ทุก table ใน Group A เพิ่ม field นี้:

```prisma
  tenantId    String   @map("tenant_id")
  tenant      Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
```

---

## 6. tenantId Injection — Prisma Middleware

ทุก query ต้อง filter ด้วย tenantId อัตโนมัติ — ไม่ให้ developer ลืม

```js
// src/lib/db.ts — เพิ่ม middleware
prisma.$use(async (params, next) => {
  const tenantId = getTenantIdFromContext()

  // AUTO-INJECT on create
  if (params.action === 'create') {
    params.args.data.tenantId = tenantId
  }

  // AUTO-FILTER on findMany, findFirst, findUnique, update, delete
  if (['findMany','findFirst','findUnique','update','delete'].includes(params.action)) {
    params.args.where = { ...params.args.where, tenantId }
  }

  return next(params)
})
```

> Tables ใน Group B (system-level) ต้อง bypass middleware

---

## 7. Session — เพิ่ม tenantId

```js
// src/app/api/auth/[...nextauth]/route.js
callbacks: {
  jwt({ token, user }) {
    if (user) {
      token.tenantId = user.tenantId
      token.role = user.role
    }
    return token
  },
  session({ session, token }) {
    session.user.tenantId = token.tenantId
    session.user.role = token.role
    return session
  }
}
```

> NEXTAUTH_SECRET ต้อง rotate หลัง deploy — JWT เก่าไม่มี tenantId

---

## 8. Subdomain Routing

```js
// middleware.js
export function middleware(request) {
  const host = request.headers.get('host')
  const slug = host.split('.')[0]

  if (slug !== 'www' && slug !== 'zuri') {
    const headers = new Headers(request.headers)
    headers.set('x-tenant-slug', slug)
    return NextResponse.next({ request: { headers } })
  }
}
```

**Local dev:** ใช้ `?tenant=vschool` query param แทน subdomain

---

## 9. Supabase RLS (Backstop)

```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON customers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

App set tenant context ก่อน query:
```sql
SET app.tenant_id = '{tenantId}';
```

> RLS เป็น backstop — app layer (Prisma middleware) เป็น primary guard

---

## 10. Tenant Onboarding Flow

```
1. Boss สร้าง Tenant ใน Admin panel
   → generate tenantId, slug, plan

2. Setup integrations
   → FB Page ID, LINE OA, Meta Ad Account
   → per-tenant tokens

3. สร้าง Employee แรก (OWNER role)
   → ส่ง welcome email พร้อม login URL: {slug}.zuri.app

4. Import ข้อมูลเริ่มต้น (optional)
   → Customer list (CSV import)
   → Product catalog
```

---

## 11. V School Migration (Current Tenant)

V School คือ tenant แรก — ต้องทำ backfill:

```sql
INSERT INTO tenants (id, tenant_id, name, slug, plan, fb_page_id, line_channel_id)
VALUES (gen_random_uuid(), 'vschool', 'The V School', 'vschool', 'PRO',
        '{FB_PAGE_ID}', '{LINE_CHANNEL_ID}');

UPDATE {table} SET tenant_id = '{vschool_tenant_uuid}';
```

---

## 12. Migration Plan

```
Migration 1: create_tenants_table
Migration 2: add_tenant_id_nullable (58 tables)
Migration 3: backfill_vschool
Migration 4: add_tenant_id_not_null + FK
Migration 5: add_tenant_indexes
Migration 6: enable_rls (Supabase)
```

> Migration 2→3→4 ทำต่อเนื่องกันในช่วง traffic น้อย (ตี 2-4) — ใช้เวลา ~30-60 นาที

---

## 13. Impact บน Features อื่น

| Feature | ผลกระทบ |
|---|---|
| **DSB** | `ConversationAnalysis`, `CustomerProfile`, `DailyBrief` ต้องมี tenantId ตั้งแต่สร้าง |
| **Meta Ads Sync** | `sync-hourly` ต้องรู้ว่า tenant ไหนใช้ FB token ไหน |
| **LINE Webhook** | webhook URL เดียว แต่ route ด้วย LINE Channel ID → tenantId |
| **FB Webhook** | webhook URL เดียว แต่ route ด้วย Page ID → tenantId |

---

## 14. Implementation Phases

| Phase | งาน | Priority |
|---|---|---|
| **MT-P1** | `Tenant` model + Migration 1 | P0 |
| **MT-P2** | Add tenantId nullable ทุก table + backfill V School | P0 |
| **MT-P3** | Make NOT NULL + FK + indexes | P0 |
| **MT-P4** | Prisma middleware (auto-inject tenantId) | P0 |
| **MT-P5** | NextAuth session เพิ่ม tenantId + rotate secret | P0 |
| **MT-P6** | Subdomain routing middleware | P1 |
| **MT-P7** | Supabase RLS policies | P1 |
| **MT-P8** | Admin panel: สร้าง/จัดการ Tenant | P1 |
| **MT-P9** | Tenant onboarding flow | P2 |

---

## 15. Decision Log

| # | คำถาม | คำตอบ | วันที่ |
|---|---|---|---|
| Q1 | DB strategy? | Shared DB + tenantId + RLS backstop | 2026-03-27 |
| Q2 | tenantId injection? | Prisma middleware (auto) | 2026-03-27 |
| Q3 | Subdomain format? | {slug}.zuri.app | 2026-03-27 |
| Q4 | MarketPrice — shared หรือ per-tenant? | Shared — ราคาตลาดเป็น objective data | 2026-03-27 |
| Q5 | Maintenance window? | ตี 2-4 (~30-60 นาที) | 2026-03-27 |
