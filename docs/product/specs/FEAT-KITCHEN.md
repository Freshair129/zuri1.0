# FEAT-KITCHEN — Kitchen Operations Module

**Status:** APPROVED
**Version:** 1.0.0
**Date:** 2026-03-30
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview

Kitchen Operations module สำหรับโรงเรียนสอนทำอาหารและธุรกิจ F&B ในประเทศไทย ครอบคลุมตั้งแต่การจัดการสูตรอาหาร (Recipe Management), คลังวัตถุดิบ (Ingredient Inventory) แบบ FEFO, การหักสต๊อกอัตโนมัติเมื่อเริ่มคลาส, ไปจนถึงการแจ้งเตือนจัดซื้อและ Prep Sheet รายวัน

**Core value:** "รู้ก่อนเปิดคลาส — วัตถุดิบพร้อม ของไม่ขาด ต้นทุนโปร่งใส"

**Primary users:**
- **Kitchen Manager (KM)** — ดูแลสต๊อก, อนุมัติการจัดซื้อ, ออก Prep Sheet
- **Chef / Instructor** — ดูสูตร, บันทึก wastage
- **Purchasing (PUR)** — รับ Purchase Request อัตโนมัติจากระบบ

---

## 2. Terminology

| คำศัพท์ | ความหมาย |
|---|---|
| **Recipe (สูตรอาหาร)** | สูตรที่ผูกกับ Course — ระบุวัตถุดิบ, อุปกรณ์, และขั้นตอน |
| **Ingredient (วัตถุดิบ)** | รายการวัตถุดิบใน catalog พร้อม unit, category, allergens |
| **IngredientLot (ล็อตวัตถุดิบ)** | ล็อตที่รับเข้า — มี expiryDate, supplier, remainingQty |
| **FEFO** | First-Expiry-First-Out — ตัดล็อตที่หมดอายุก่อน |
| **StockDeduction (หักสต๊อก)** | การตัดสต๊อกอัตโนมัติตาม recipe × จำนวนนักเรียน |
| **Prep Sheet** | รายการเตรียมวัตถุดิบสำหรับคลาสวันถัดไป |
| **Wastage (ของเสีย)** | วัตถุดิบที่ทิ้ง/เสียหายต่อคลาส ใช้วิเคราะห์ต้นทุน |
| **Purchase Request (PR)** | คำขอจัดซื้อที่ระบบสร้างอัตโนมัติเมื่อสต๊อกต่ำกว่า minStock |
| **CourseSchedule** | ตารางคลาสที่ผูก Course → Recipe → นักเรียน |
| **currentStock** | ยอดสต๊อกรวมบน Ingredient model (denormalized) — ต้อง sync กับ sum(IngredientLot.remainingQty) |

---

## 3. Feature Breakdown

### 3.1 Ingredient Catalog

จัดการรายการวัตถุดิบทั้งหมดของ tenant — เป็น master data สำหรับทุก recipe

**Fields:**
| Field | Type | หมายเหตุ |
|---|---|---|
| `name` | string | ชื่อวัตถุดิบ (ไทย/อังกฤษ) |
| `unit` | string | หน่วยนับหลัก (กรัม, มล., ชิ้น ฯลฯ) |
| `category` | string | หมวดหมู่ (เนื้อสัตว์, ผัก, เครื่องปรุง ฯลฯ) |
| `allergens` | string[] | สารก่อภูมิแพ้ (gluten, dairy, nuts ฯลฯ) |
| `currentStock` | decimal | ยอดคงเหลือรวม (denormalized จาก lots) |
| `minStock` | decimal | ขีดต่ำสุดที่ trigger Purchase Request |

**Actions:**
- เพิ่ม/แก้ไข/ลบวัตถุดิบ (soft delete)
- ค้นหาด้วย fuzzy matching รองรับชื่อภาษาไทย (ADR-043)
- Export catalog เป็น CSV

**API Endpoints:**
- `GET /api/kitchen/ingredients` — list (paginated, filter by category)
- `POST /api/kitchen/ingredients` — create
- `PATCH /api/kitchen/ingredients/[id]` — update
- `DELETE /api/kitchen/ingredients/[id]` — soft delete

---

### 3.2 Ingredient Lot Management (FEFO)

แต่ละล็อตที่รับเข้าจะถูกบันทึกแยก เพื่อให้ระบบตัดสต๊อกตาม FEFO ได้ถูกต้อง

**Fields:**
| Field | Type | หมายเหตุ |
|---|---|---|
| `ingredientId` | uuid | FK → Ingredient |
| `quantity` | decimal | ปริมาณที่รับเข้า (original) |
| `remainingQty` | decimal | ปริมาณที่เหลือ — ใช้สำหรับ FEFO deduction |
| `expiryDate` | date | วันหมดอายุ — เรียงล็อตตามนี้ |
| `receivedDate` | date | วันที่รับเข้า |
| `supplierId` | uuid | FK → Supplier |

**FEFO Logic:**
```
เมื่อต้องการตัดสต๊อก X หน่วย:
  1. ดึง lots WHERE ingredientId = ? AND remainingQty > 0
     ORDER BY expiryDate ASC (ล็อตที่ใกล้หมดอายุก่อน)
  2. วนตัด remainingQty ทีละล็อตจนครบ X
  3. บันทึก StockDeductionLog ต่อทุกล็อตที่ถูกตัด
  4. อัพเดท Ingredient.currentStock = SUM(remainingQty) ทุกครั้ง
```

**CRITICAL:** ต้องใช้ `remainingQty` ไม่ใช่ `quantity` เสมอ (ดู Section 7)

**Actions:**
- รับล็อตใหม่ (Goods Receipt)
- ดูประวัติล็อตต่อวัตถุดิบ
- แจ้งเตือนล็อตใกล้หมดอายุ (< 3 วัน) — Pusher notification

**API Endpoints:**
- `GET /api/kitchen/ingredients/[id]/lots` — list lots ของวัตถุดิบ
- `POST /api/kitchen/ingredients/[id]/lots` — รับล็อตใหม่ (trigger currentStock update)
- `GET /api/kitchen/lots/expiring` — lots ที่หมดอายุใน N วัน

---

### 3.3 Recipe Management

สูตรอาหารผูกกับ Course — ระบุวัตถุดิบ, อุปกรณ์, และขั้นตอนการทำ

**Recipe Fields:**
| Field | Type | หมายเหตุ |
|---|---|---|
| `name` | string | ชื่อสูตร |
| `courseId` | uuid | FK → Course (nullable สำหรับ à la carte) |
| `servings` | integer | จำนวน serving ต่อสูตร (basis สำหรับ scale) |
| `prepTime` | integer | นาที (เตรียม) |
| `cookTime` | integer | นาที (ปรุง) |

**RecipeIngredient:** `recipeId`, `ingredientId`, `quantity`, `unit`

**RecipeEquipment:** `recipeId`, `equipmentName`, `quantity`

**Recipe Steps:** `recipeId`, `stepOrder`, `description`, `imageUrl` (optional)

**Actions:**
- CRUD recipe พร้อม ingredient list และ equipment list
- Scale สูตรตามจำนวนนักเรียน (recipe.servings เป็น base)
- ดูต้นทุนโดยประมาณต่อ serving (คำนวณจาก ingredient × ราคาล็อตล่าสุด)
- Clone recipe เป็น version ใหม่

**API Endpoints:**
- `GET /api/kitchen/recipes` — list (filter by courseId)
- `POST /api/kitchen/recipes` — create พร้อม ingredients/equipment
- `PATCH /api/kitchen/recipes/[id]` — update
- `GET /api/kitchen/recipes/[id]/cost-estimate` — ประมาณต้นทุน

---

### 3.4 Stock Deduction (Auto-Deduct on Class Start)

เมื่อ CourseSchedule เริ่มคลาส → ระบบหักสต๊อกอัตโนมัติตาม recipe × student_count

**Trigger:** QStash job `/api/workers/kitchen-deduct` ทำงาน 15 นาทีก่อนเวลาเริ่มคลาสทุกรายการ

**Deduction Flow:**
```
CourseSchedule.status → STARTING
  → ดึง recipe ของ course
  → คำนวณ ingredient qty = recipeIngredient.quantity × (studentCount / recipe.servings)
  → สำหรับแต่ละ ingredient:
      → FEFO: ดึง lots ORDER BY expiryDate ASC
      → ตัด remainingQty ทีละล็อตใน prisma.$transaction
      → บันทึก StockDeductionLog
      → อัพเดท Ingredient.currentStock
  → ถ้าสต๊อกไม่พอ → alert Kitchen Manager (Pusher + in-app notification)
  → CourseSchedule.stockDeducted = true
```

**StockDeductionLog Fields:**
| Field | Type | หมายเหตุ |
|---|---|---|
| `ingredientLotId` | uuid | FK → IngredientLot ที่ถูกตัด |
| `quantity` | decimal | ปริมาณที่ตัด |
| `reason` | string | `CLASS_DEDUCTION` / `MANUAL_ADJUST` / `WASTAGE` |
| `classScheduleId` | uuid | FK → CourseSchedule |

**Insufficient Stock Alert:**
- แจ้ง Kitchen Manager ผ่าน Pusher channel `kitchen-alerts`
- สร้าง in-app notification พร้อม ingredient ที่ขาด
- ไม่ block การเริ่มคลาส — แค่แจ้งเตือน

---

### 3.5 Stock Movement Log

บันทึก movement ทุกประเภทเพื่อ audit trail

| Type | เมื่อไหร่ |
|---|---|
| `IN` | รับล็อตใหม่ (Goods Receipt) |
| `OUT` | หักสต๊อก (Class Deduction + Manual) |
| `ADJUST` | ปรับสต๊อกโดย Kitchen Manager |

**API Endpoints:**
- `GET /api/kitchen/ingredients/[id]/movements` — history ของวัตถุดิบ
- `POST /api/kitchen/stock/adjust` — manual adjustment (KM เท่านั้น)

---

### 3.6 Prep Sheet (Daily)

รายการเตรียมวัตถุดิบที่ Kitchen Manager พิมพ์/ดูก่อนวันเปิดคลาส

**Generated From:** CourseSchedule ของวันถัดไป → รวม ingredients ทุกคลาส → จัดกลุ่มตาม category

**Prep Sheet Content:**
- รายการวัตถุดิบที่ต้องเตรียม (พร้อมปริมาณรวม)
- แยกตาม category (เนื้อสัตว์ → ผัก → เครื่องปรุง ฯลฯ)
- คลาสที่ต้องใช้วัตถุดิบนั้น
- สต๊อกปัจจุบัน vs ที่ต้องใช้ → สีแดงถ้าไม่พอ

**API Endpoints:**
- `GET /api/kitchen/prep-sheet?date=YYYY-MM-DD` — Prep Sheet สำหรับวันที่ระบุ (cached Redis 1 ชั่วโมง)

**Delivery:**
- ดูในหน้า Kitchen Dashboard
- Print-friendly layout (A4)
- ส่งอัตโนมัติทาง LINE ถึง Kitchen Manager ทุกวัน 20:00 น. (QStash cron)

---

### 3.7 Equipment Tracking

อุปกรณ์ที่ต้องใช้ต่อ recipe — ตรวจสอบ availability ก่อนเริ่มคลาส

**RecipeEquipment:** ชื่ออุปกรณ์ + จำนวนที่ต้องการต่อ recipe

**Availability Check:**
- เช็คว่าคลาสในช่วงเวลาเดียวกันใช้อุปกรณ์ชนิดเดียวกันเกิน capacity หรือไม่
- แจ้งเตือน Kitchen Manager ถ้า conflict

> Note: ใน Phase 1 เป็นแค่ tracking ตาม recipe — ไม่มี equipment inventory system เต็มรูปแบบ (planned Phase 2)

---

### 3.8 Wastage Tracking

บันทึกของเสีย/เสียหายต่อคลาส เพื่อวิเคราะห์ต้นทุนจริง

**Fields:** `ingredientId`, `classScheduleId`, `quantity`, `unit`, `reason`, `recordedBy`

**Actions:**
- Chef/Instructor บันทึก wastage หลังจบคลาส
- สรุป wastage report ต่อ ingredient ต่อเดือน
- เปรียบเทียบ expected usage vs actual usage

**API Endpoints:**
- `POST /api/kitchen/wastage` — บันทึก wastage (สร้าง StockDeductionLog reason=WASTAGE)
- `GET /api/kitchen/wastage/report?month=YYYY-MM` — monthly wastage report

---

### 3.9 Purchase Request Auto-Generation

เมื่อ `Ingredient.currentStock <= Ingredient.minStock` → ระบบสร้าง Purchase Request อัตโนมัติ

**Trigger:** หลัง stock deduction ทุกครั้ง → check ทุก ingredient ที่ถูกตัด

**Purchase Request:**
- สร้าง record ใน PurchaseRequest table (scope: `src/lib/repositories/purchaseRequestRepository.js`)
- แจ้ง Purchasing (PUR) ผ่าน in-app notification
- ป้องกัน duplicate — ถ้า PR ที่ pending อยู่แล้วสำหรับ ingredient นั้น → ไม่สร้างซ้ำ

**API Endpoints:**
- `GET /api/kitchen/purchase-requests` — list (filter: PENDING/APPROVED/REJECTED)
- `PATCH /api/kitchen/purchase-requests/[id]` — อัพเดทสถานะ (PUR/MGR)

---

## 4. Data Flow

### 4.1 Stock Deduction Flow (Happy Path)

```
CourseSchedule ถูกสร้าง/อัพเดท
  → QStash schedule job "kitchen-deduct" ล่วงหน้า 15 นาที
  → /api/workers/kitchen-deduct รับ payload { classScheduleId }
  → ดึง CourseSchedule → Course → Recipe → RecipeIngredients
  → คำนวณ scaled qty ต่อ ingredient (qty × studentCount / servings)
  → BEGIN prisma.$transaction
      สำหรับแต่ละ ingredient:
        ดึง IngredientLots ORDER BY expiryDate ASC WHERE remainingQty > 0
        วนตัดทีละล็อต → update remainingQty
        INSERT StockDeductionLog (reason=CLASS_DEDUCTION)
        UPDATE Ingredient.currentStock = SUM(remainingQty)
        ถ้า insufficientStock → เก็บ list ไว้
  → COMMIT
  → ถ้ามี insufficientStock → Pusher.trigger('kitchen-alerts', 'stock-alert', payload)
  → UPDATE CourseSchedule.stockDeducted = true
```

### 4.2 Low Stock → Purchase Request Flow

```
หลัง stock deduction:
  → สำหรับแต่ละ ingredient ที่ถูกตัด:
      IF currentStock <= minStock:
        CHECK PurchaseRequest WHERE ingredientId = ? AND status = PENDING
        IF ไม่มี pending PR → INSERT PurchaseRequest
        → notify PUR role via in-app notification
```

### 4.3 Goods Receipt Flow

```
Kitchen Manager รับของเข้า:
  → POST /api/kitchen/ingredients/[id]/lots
  → INSERT IngredientLot (quantity, remainingQty = quantity, expiryDate, supplierId)
  → INSERT StockMovement (type=IN)
  → UPDATE Ingredient.currentStock += quantity
  → ถ้า PurchaseRequest pending → auto-update status = FULFILLED
```

### 4.4 Daily Prep Sheet Flow

```
QStash cron 20:00 ทุกวัน:
  → /api/workers/kitchen-prep-sheet
  → ดึง CourseSchedule ของวันพรุ่งนี้
  → รวม ingredients จากทุก recipe × studentCount
  → เปรียบเทียบกับ currentStock
  → cache ใน Redis key `prep-sheet:{tenantId}:{date}` TTL 3600
  → ส่ง LINE message ถึง Kitchen Manager (ถ้า LINE integration เปิดอยู่)
```

---

## 5. Roles & Permissions

| Action | DEV | MGR | PD | PUR | STF | AGT | หมายเหตุ |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| ดู Ingredient Catalog | ✓ | ✓ | ✓ | ✓ | ✓ | — | ทุก staff role |
| เพิ่ม/แก้ไข Ingredient | ✓ | ✓ | ✓ | — | — | — | Kitchen Manager (MGR) + PD |
| ดู IngredientLots | ✓ | ✓ | ✓ | ✓ | — | — | |
| รับล็อตใหม่ (Goods Receipt) | ✓ | ✓ | — | ✓ | — | — | KM หรือ Purchasing |
| Manual Stock Adjust | ✓ | ✓ | — | — | — | — | KM เท่านั้น |
| CRUD Recipe | ✓ | ✓ | ✓ | — | — | — | KM + Chef (PD) |
| ดู Recipe | ✓ | ✓ | ✓ | — | ✓ | — | Staff ดูได้ |
| บันทึก Wastage | ✓ | ✓ | ✓ | — | ✓ | — | Chef + Staff |
| ดู Prep Sheet | ✓ | ✓ | ✓ | ✓ | ✓ | — | |
| อนุมัติ Purchase Request | ✓ | ✓ | — | ✓ | — | — | MGR + PUR |
| ดู Stock Movement History | ✓ | ✓ | ✓ | ✓ | — | — | |

> Permission check ผ่าน `can(roles, 'kitchen', action)` จาก `src/lib/permissionMatrix.js`

---

## 6. NFR

| ID | Requirement | Target |
|---|---|---|
| NFR-K1 | Stock deduction ต้องอยู่ใน `prisma.$transaction` | 100% — ไม่มี partial deduction |
| NFR-K2 | QStash worker kitchen-deduct retry | >= 5 ครั้ง (throw error เมื่อ fail) |
| NFR-K3 | Prep Sheet API response time | < 500ms (Redis cache) |
| NFR-K4 | Low stock alert latency (Pusher) | < 3 วินาทีหลัง deduction |
| NFR-K5 | currentStock sync accuracy | currentStock = SUM(IngredientLot.remainingQty) ต้องตรงกัน 100% |
| NFR-K6 | Ingredient fuzzy search (Thai) | รองรับ partial match ชื่อภาษาไทย (ADR-043) |
| NFR-K7 | Duplicate PR prevention | ต้องไม่สร้าง PR ซ้ำถ้ามี PENDING อยู่แล้ว |

---

## 7. Known Gotchas

### G-K1: ใช้ `remainingQty` ไม่ใช่ `quantity`
ข้อผิดพลาดที่พบบ่อยที่สุดใน ZURI-v1 — FEFO deduction ต้องอ่านและตัดจาก `IngredientLot.remainingQty` เสมอ ไม่ใช่ `quantity` (ซึ่งคือปริมาณตอนรับเข้า)

### G-K2: `currentStock` เป็น Denormalized Field
`Ingredient.currentStock` ต้องถูก update ทุกครั้งที่มีการเปลี่ยนแปลง `IngredientLot.remainingQty` ไม่ว่าจะเป็น deduction, adjustment, หรือ goods receipt — ต้องทำภายใน transaction เดียวกัน

### G-K3: Race Condition บน Stock Deduction
ถ้าหลายคลาสเริ่มพร้อมกัน QStash อาจ dispatch หลาย job พร้อมกัน — `prisma.$transaction` เป็น safeguard แต่ต้องระวัง deadlock บน IngredientLot rows เดียวกัน ใช้ `SELECT ... FOR UPDATE` ถ้าจำเป็น

### G-K4: Thai Ingredient Names Fuzzy Search
ชื่อวัตถุดิบภาษาไทยมักมีหลาย variant (เช่น "กะเพรา" vs "กะเพา") — ใช้ trigram similarity search ตาม ADR-043 ไม่ใช่ exact match

### G-K5: Scaling Recipe — หน่วยต้องตรงกัน
เมื่อ scale recipe ตาม studentCount ต้องตรวจสอบว่า `RecipeIngredient.unit` ตรงกับ `Ingredient.unit` ก่อนคำนวณ — ถ้าต่างกัน (เช่น recipe ใช้ "ช้อนชา" แต่ stock เป็น "กรัม") ต้องมี unit conversion table

### G-K6: CourseSchedule.stockDeducted Flag
ต้องเช็ค flag นี้ก่อนทุกครั้งที่ worker run — ถ้า `stockDeducted = true` ต้อง skip ทันที เพื่อป้องกันหัก stock ซ้ำเมื่อ QStash retry

---

## 8. Implementation Phases

| Phase ID | Task | Priority | หมายเหตุ |
|---|---|:---:|---|
| K-P0-1 | Ingredient CRUD + Catalog UI | P0 | Foundation ของทุกอย่าง |
| K-P0-2 | IngredientLot model + Goods Receipt flow | P0 | FEFO ต้องใช้ lots |
| K-P0-3 | Recipe CRUD + RecipeIngredient/Equipment | P0 | ผูกกับ Course |
| K-P0-4 | FEFO deduction logic (unit test) | P0 | Business critical — ต้อง test ก่อน deploy |
| K-P0-5 | Stock deduction worker (`/api/workers/kitchen-deduct`) | P0 | QStash + prisma.$transaction |
| K-P0-6 | `currentStock` sync helper + Ingredient.currentStock update | P0 | Denormalized field — sync ทุก write path |
| K-P0-7 | Insufficient stock Pusher alert | P0 | แจ้ง Kitchen Manager ทันที |
| K-P1-1 | Prep Sheet API + Redis cache | P1 | Kitchen Manager ใช้ทุกวัน |
| K-P1-2 | Daily Prep Sheet cron (QStash 20:00) + LINE delivery | P1 | ต้องการ LINE integration |
| K-P1-3 | Purchase Request auto-generation + duplicate prevention | P1 | ผูกกับ PUR workflow |
| K-P1-4 | Wastage tracking UI + API | P1 | Cost analysis |
| K-P1-5 | Stock Movement history UI | P1 | Audit trail |
| K-P1-6 | Low stock alert banner บน Kitchen Dashboard | P1 | UX |
| K-P1-7 | Lot expiry notification (< 3 วัน) | P1 | Food safety |
| K-P2-1 | Equipment availability conflict detection | P2 | Phase 2 — full equipment inventory |
| K-P2-2 | Unit conversion table (recipe unit ↔ stock unit) | P2 | ช้อนชา → กรัม ฯลฯ |
| K-P2-3 | Recipe cost estimate (ราคาล็อตล่าสุด × qty) | P2 | Cost analysis dashboard |
| K-P2-4 | Wastage report (monthly) + comparison vs expected | P2 | Reporting |
| K-P2-5 | Recipe versioning (clone + version history) | P2 | Nice-to-have |

---

## 9. Related

| Document | Path | หมายเหตุ |
|---|---|---|
| PRD v2.2 | `docs/product/PRD.md` | Kitchen Ops อยู่ใน Core Modules |
| Roadmap | `docs/product/ROADMAP.md` | M2: Kitchen Ops milestone |
| ADR-043 | `docs/decisions/adrs/ADR-043.md` | Thai fuzzy search strategy |
| ADR-056 | `docs/decisions/adrs/ADR-056.md` | Multi-tenant architecture |
| FEAT-POS | `docs/product/specs/FEAT-POS.md` | POS ใช้ Recipe/Ingredient data ร่วมกัน |
| DB Schema | `prisma/schema.prisma` | Ingredient, IngredientLot, Recipe models |
| Repositories | `src/lib/repositories/` | `kitchenRepository.js`, `recipeRepository.js`, `ingredientRepository.js` |
| QStash Workers | `src/app/api/workers/` | `kitchen-deduct.js`, `kitchen-prep-sheet.js` |
| Gotchas | `docs/gotchas/` | ดูก่อน implement FEFO logic |
