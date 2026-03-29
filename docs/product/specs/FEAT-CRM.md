# FEAT-CRM — Customer Relationship Management

**Status:** APPROVED
**Version:** 1.0.0
**Date:** 2026-03-30
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview

CRM Module คือศูนย์กลางข้อมูลลูกค้าทั้งหมดของ Zuri — รวม lead ที่ทักมาจาก Facebook, LINE, และช่องทางอื่น ๆ ไว้ในฐานข้อมูลเดียว พร้อม funnel management, identity resolution, และ activity timeline แบบครบวงจร

ทีมขายและ manager ใช้ CRM เป็นหน้าหลักสำหรับดูภาพรวมลูกค้า, track lead ตาม lifecycle stage, และ export ข้อมูลเพื่อวิเคราะห์

```
Inbox (conversation) ──┐
POS (order) ───────────┼──▶ Customer Record ──▶ CRM Module ──▶ ทีมขาย
Enrollment (course) ───┘                                       Manager / MKT
```

---

## 2. Terminology

| คำ | นิยาม |
|---|---|
| **Customer** | record ลูกค้า 1 คนในระบบ — อาจมีหลาย platform identity (FB + LINE) |
| **Lead** | customer ที่ยังอยู่ใน funnel stage `NEW` ถึง `INTERESTED` (ยังไม่ได้ลงทะเบียน) |
| **Lifecycle Stage** | สถานะใน funnel: `NEW → CONTACTED → INTERESTED → ENROLLED → PAID` |
| **Identity Resolution** | กระบวนการรวม FB profile + LINE profile → customer record เดียว |
| **Tag** | label อิสระที่ staff ติดไว้บนลูกค้า เช่น "VIP", "คอร์สฟรี", "ส่งต่อ" |
| **Segment** | smart list ที่กรองลูกค้าจาก rule แบบไดนามิก (เช่น "lead ที่ไม่ได้ติดต่อ > 7 วัน") |
| **Activity Timeline** | ประวัติเหตุการณ์ทุกอย่างที่เกิดกับลูกค้า: conversations, orders, enrollments |
| **Merge** | การรวม customer 2 record เป็น 1 (dedup) |
| **Import/Export** | นำเข้า/ส่งออกข้อมูลลูกค้าผ่านไฟล์ CSV |
| **CUST-ID** | unique ID ของ customer ในรูปแบบ `CUST-[ULID]` ตาม `id_standards.yaml` |

---

## 3. Feature Breakdown

### 3.1 Customer List Page

หน้าหลักของ CRM — แสดงรายการลูกค้าทั้งหมดพร้อมเครื่องมือ search, filter, และ sort

**Search:**
- ค้นหาด้วย ชื่อ, เบอร์โทร, อีเมล, platform ID (PSID / LINE userId)
- Full-text search แบบ `ilike` — รองรับภาษาไทยและอังกฤษ
- Debounce 300ms ก่อน trigger API call

**Filter:**
- Lifecycle Stage (multi-select): `NEW`, `CONTACTED`, `INTERESTED`, `ENROLLED`, `PAID`
- Tags (multi-select): กรองลูกค้าที่มี tag ที่เลือก
- Channel: Facebook / LINE / Both
- วันที่สร้าง: date range picker
- Assigned Agent: กรองตาม agent ที่ดูแล

**Sort:**
- เรียงตาม: ชื่อ (A-Z), วันที่สร้าง, วันที่ update ล่าสุด, lifecycle stage
- Default: `updatedAt DESC`

**Columns ที่แสดงใน list:**

| Column | รายละเอียด |
|---|---|
| ชื่อลูกค้า | พร้อม avatar / platform badge (FB/LINE) |
| เบอร์โทร | format E.164 |
| Lifecycle Stage | pill badge แสดงสี |
| Tags | แสดง tag สูงสุด 3 อัน + overflow count |
| Last Contact | วันที่มีการสนทนาล่าสุด |
| Assigned Agent | ชื่อ agent ที่รับผิดชอบ |
| Actions | ปุ่ม View, Edit, Open Conversation |

**Bulk Operations:**
- เลือกลูกค้าหลายคนพร้อมกัน (checkbox)
- Bulk actions: เปลี่ยน stage, เพิ่ม/ลบ tag, assign agent, export เป็น CSV, ลบ (soft delete)

### 3.2 Customer Create / Edit

**Create Customer (manual):**
- ชื่อ-นามสกุล (required)
- เบอร์โทรศัพท์ (format E.164 — validate ก่อน save)
- อีเมล (optional)
- Lifecycle Stage (default: `NEW`)
- Tags (multi-select, สร้างใหม่ได้ inline)
- หมายเหตุ (notes — free text)

**Edit Customer:**
- แก้ไข field ทุกอย่างที่สร้างมา
- บันทึก audit log ทุกครั้งที่มีการเปลี่ยนแปลง (`logAction`)
- เปลี่ยน lifecycle stage ได้จาก dropdown — ระบบบันทึก timestamp ทุก transition

**Soft Delete:**
- ลบ customer ด้วย soft delete (`deletedAt` timestamp) — ไม่ลบออกจาก DB
- customer ที่ถูก soft delete ไม่แสดงใน list (filter `deletedAt IS NULL`)
- Admin สามารถ restore ได้

### 3.3 Lead Management Funnel

```
NEW ──▶ CONTACTED ──▶ INTERESTED ──▶ ENROLLED ──▶ PAID
 │                                        │          │
 └──── ไม่สนใจ (Lost) ◀───────────────────┘          │
                                                      └── Integration: POS / Enrollment
```

**Stage Definitions:**

| Stage | ความหมาย | Action แนะนำ |
|---|---|---|
| `NEW` | ทักมาครั้งแรก / นำเข้าจาก CSV | ตอบและ qualify |
| `CONTACTED` | ได้คุยแล้ว อยู่ระหว่างให้ข้อมูล | ติดตาม + ส่งข้อมูลเพิ่ม |
| `INTERESTED` | สนใจชัดเจน รอการตัดสินใจ | ส่ง proposal / follow-up |
| `ENROLLED` | ลงทะเบียนแล้ว รอชำระเงิน | แจ้งการชำระ |
| `PAID` | ชำระเงินเสร็จสมบูรณ์ | onboarding / cross-sell |

- Stage transition บันทึก `customer_stage_history` table ทุกครั้ง
- ระบบ DSB ใช้ stage history นี้คำนวณ conversion rate รายวัน (ดู FEAT-DSB.md)
- Stage `PAID` sync กับ POS order status `COMPLETED` อัตโนมัติ

### 3.4 Identity Resolution

ลูกค้าคนเดียวอาจทักมาจาก Facebook และ LINE แยกกัน — ระบบต้องรวมเป็น record เดียว

```
FB Messenger (PSID: xxx) ──┐
                            ├──▶ Customer Record เดียว (CUST-[ULID])
LINE OA (userId: yyy) ──────┘
     (match ด้วย phone / manual merge)
```

**Auto-Merge (Phone Matching):**
1. Webhook รับ message ใหม่จาก FB หรือ LINE
2. ดึง phone number จาก profile (ถ้ามี) หรือ staff กรอก
3. ค้นหา customer record ที่มี phone ตรงกัน
4. ถ้าเจอ → link platform identity เข้ากับ customer นั้น (upsert `customer_identities`)
5. ถ้าไม่เจอ → สร้าง customer record ใหม่

**Manual Merge:**
- Staff เปิด customer 2 คน → กด "Merge Customer"
- เลือก record หลัก (primary) — ข้อมูลจาก record นั้นจะเป็น winner
- System merge: รวม `customer_identities`, conversations, orders, enrollments ทั้งหมดไปอยู่ที่ primary
- Record รอง (secondary) ถูก soft delete + เก็บ `merged_into` reference
- ดู ADR-025 สำหรับ algorithm และ conflict resolution

### 3.5 Tags & Labels

- Tag เป็น free-form text หรือเลือกจาก tag ที่มีอยู่แล้ว
- ลูกค้า 1 คนมีได้หลาย tag (many-to-many ผ่าน `customer_tags` table)
- Tag สร้างใหม่ได้ inline ในหน้า customer form
- Tag ลบได้เฉพาะ MGR/ADM (ป้องกัน cascade กระทบ customer อื่น)
- ใช้ tag สำหรับ:
  - Filter ใน customer list
  - Segment criteria
  - Broadcast target (ดู Inbox module)

### 3.6 Customer Segments / Smart Lists

Segment = saved filter ที่ query ผล dynamically ทุกครั้งที่เปิด

**สร้าง Segment:**
- เลือก condition: stage, tag, channel, last contact date, assigned agent, enrollment status, total spend
- Combine ด้วย AND / OR
- ตั้งชื่อ segment + บันทึก (เก็บเป็น JSON rule ใน `customer_segments` table)

**ตัวอย่าง Segment ที่ใช้บ่อย:**

| Segment | Rule |
|---|---|
| Lead ร้อน | stage = INTERESTED AND last_contact < 48 ชม. |
| ลูกค้า VIP | tag = "VIP" AND total_spend > 50,000 |
| Follow Up วันนี้ | next_followup_date = today |
| ยังไม่ตอบ 7 วัน | stage IN (NEW, CONTACTED) AND last_message > 7 วัน |

- Segment แสดงใน sidebar ของ CRM list
- กด segment → filter list ด้วย rule นั้นทันที
- Segment ใช้ได้กับ Broadcast Inbox (ส่ง message bulk)

### 3.7 Activity Timeline

หน้า Customer Detail แสดง timeline เหตุการณ์ทั้งหมดของลูกค้าคนนั้น เรียงตาม `timestamp DESC`

**ประเภท Activity:**

| Type | รายละเอียด | Source |
|---|---|---|
| `CONVERSATION` | บทสนทนา FB/LINE — คลิกไปเปิด Inbox ได้ | FEAT-INBOX.md |
| `ORDER` | ออเดอร์จาก POS — แสดงรายการสินค้า + ยอดรวม | FEAT-POS.md |
| `ENROLLMENT` | การลงเรียน course — แสดงชื่อคอร์ส + วันที่ | Enrollment module |
| `PAYMENT` | ประวัติการชำระเงิน — แสดง slip / invoice | FEAT-BILLING.md |
| `STAGE_CHANGE` | การเปลี่ยน lifecycle stage | CRM |
| `TAG_CHANGE` | การเพิ่ม/ลบ tag | CRM |
| `NOTE` | หมายเหตุที่ staff บันทึก | CRM |

- Timeline ใช้ infinite scroll — load 20 events ต่อหน้า
- Filter timeline ตาม activity type ได้
- คลิก `CONVERSATION` → เปิด conversation นั้นใน Inbox โดยตรง (deep link)

### 3.8 Import / Export CSV

**Import:**
- รับไฟล์ CSV ที่มี columns: `name`, `phone`, `email`, `stage`, `tags`, `notes`
- Validate ก่อน import:
  - Phone format E.164 — ถ้าไม่ตรง → flag เป็น error row
  - Duplicate phone → สร้าง merge suggestion แทน
- แสดง preview 10 row แรก + error summary ก่อน confirm
- Import จริงผ่าน background job (QStash) — ไม่ block UI
- ส่ง Pusher event `import-complete` เมื่อเสร็จ

**Export:**
- Export customer list ที่ filter ปัจจุบัน → CSV
- Columns: CUST-ID, name, phone, email, stage, tags, assigned_agent, created_at, last_contact, total_spend
- Export > 1,000 rows → ทำ background job + notify ผ่าน UI เมื่อไฟล์พร้อม
- ข้อมูลส่วนตัว (phone, email) — เฉพาะ MGR/ADM/SLS export ได้

---

## 4. Data Flow

```
Customer List Page:
    GET /api/customers?search=&stage=&tags=&page=
        → customerRepo.list({ tenantId, filters, pagination })
        → Redis cache 60 วินาที (key: crm:list:[tenantId]:[hash(filters)])
        → Response: { customers[], total, pages }

Customer Detail:
    GET /api/customers/[id]
        → customerRepo.getById(tenantId, id)
        → Redis cache 60 วินาที
        → Response: { customer, identities[], latestConversation }

    GET /api/customers/[id]/timeline?type=&page=
        → customerRepo.getTimeline(tenantId, id, filters)
        → No cache (real-time data)

Create / Update:
    POST /api/customers
    PATCH /api/customers/[id]
        → validate phone (E.164 normalize)
        → customerRepo.create / update (tenantId, data)
        → clear Redis cache (customer list + detail)
        → logAction(tenantId, userId, 'CUSTOMER_UPDATE', { id, changes })
        → Pusher event: customer-updated

Stage Transition:
    PATCH /api/customers/[id]/stage
        → prisma.$transaction([
            update customer.stage,
            create customer_stage_history record
          ])
        → clear Redis cache
        → logAction

Identity Merge:
    POST /api/customers/[id]/merge
        → body: { secondaryId }
        → prisma.$transaction([
            move customer_identities,
            move conversations,
            move orders,
            move enrollments,
            soft-delete secondary customer (merged_into = primaryId)
          ])
        → clear Redis cache

Import:
    POST /api/customers/import
        → validate CSV → enqueue QStash job
        → QStash → /api/workers/customer-import
        → process rows in batches of 50
        → Pusher event: import-complete

Export:
    GET /api/customers/export?...filters
        → ถ้า count <= 1000 → stream CSV response ทันที
        → ถ้า count > 1000 → enqueue QStash job → notify ผ่าน Pusher
```

---

## 5. Roles & Permissions

| Role | สิทธิ์ |
|---|---|
| **SLS, AGT** | ดู + แก้ไข customer ที่ assign ให้ตัวเอง, เปลี่ยน stage, เพิ่ม/ลบ tag, บันทึก note, export (ข้อมูลของตัวเอง) |
| **MGR, ADM** | CRUD ลูกค้าทุกคน, merge customer, bulk operations, สร้าง segment, import/export ทั้งหมด, ลบ tag |
| **MKT** | ดูลูกค้าทั้งหมด, ดู tags + segments, export (ไม่มี phone/email), สร้าง segment |
| **ACC** | ดูลูกค้า + ประวัติ payment เท่านั้น (read-only) |
| **STF, PD, PUR, HR** | ดูอย่างเดียว — ไม่แก้ไข |
| **TEC, DEV** | Full access (dev/support) |
| **OWNER** | Full access |

Permission ใช้ `can(roles, 'crm', action)` จาก `src/lib/permissionMatrix.js`

---

## 6. NFR

| ID | Requirement |
|---|---|
| **NFR-CRM-1** | Customer list load < 500ms (Redis cache + pagination) |
| **NFR-CRM-2** | Customer detail + timeline load < 800ms |
| **NFR-CRM-3** | Search response < 300ms สำหรับ dataset ≤ 50,000 customers |
| **NFR-CRM-4** | Import 10,000 rows เสร็จภายใน 5 นาที (QStash background job) |
| **NFR-CRM-5** | Export 50,000 rows เสร็จภายใน 2 นาที |
| **NFR-CRM-6** | Identity merge ต้องใช้ `prisma.$transaction` — ห้าม partial merge (NFR5) |
| **NFR-CRM-7** | Soft delete เท่านั้น — ไม่มี hard delete customer record |
| **NFR-CRM-8** | Audit log ทุก create/update/merge/delete action |

---

## 7. Known Gotchas

- **Phone Normalization:** phone ต้อง normalize เป็น E.164 (`+66XXXXXXXXX`) ก่อน save และก่อน matching เสมอ — ไม่เช่นนั้นจะเกิด duplicate record จากรูปแบบเบอร์ที่ต่างกัน (เช่น `0812345678` vs `+66812345678`)
- **Identity Merge Race Condition:** ถ้า 2 webhook มาพร้อมกันและ phone ตรงกัน อาจสร้าง customer 2 record ก่อน merge — ต้องใช้ `prisma.$transaction` + unique index บน `(tenant_id, phone)` เพื่อ catch `P2002`
- **Segment Performance:** Segment ที่ใช้ `total_spend` ต้อง join กับ orders table — อาจช้าถ้า customer มาก → cache segment result 5 นาที
- **Soft Delete Cascade:** customer ที่ soft delete แล้วยังมี conversations/orders อยู่ — ต้องกรอง `deletedAt IS NULL` ใน customerRepo ทุก query (ห้ามกรองใน middleware เพราะจะกระทบ admin restore)
- **CSV Import Encoding:** ไฟล์ CSV จาก Excel มักเป็น TIS-620 หรือ UTF-8 with BOM — ต้อง detect + convert ก่อน parse
- **Merge หลัง Import:** ถ้า import CSV แล้วมี phone ซ้ำกับ customer เดิม — ระบบต้องสร้างเป็น merge suggestion (ไม่ใช่ error) เพื่อให้ staff ตัดสินใจ ห้าม auto-overwrite
- **Timeline Pagination:** `customer_stage_history` + conversations + orders อยู่คนละ table — ต้อง UNION query หรือ denormalize ลง `customer_activities` table เพื่อ performance timeline

---

## 8. Implementation Phases

| Phase ID | Task | Priority |
|---|---|---|
| CRM-P0-01 | Database schema: `customers`, `customer_identities`, `customer_tags`, `customer_stage_history`, `customer_segments`, `customer_activities` | P0 |
| CRM-P0-02 | `customerRepo.js` — `list`, `getById`, `create`, `update`, `softDelete` พร้อม tenant isolation | P0 |
| CRM-P0-03 | Customer List Page — search, filter (stage + tag), sort, pagination | P0 |
| CRM-P0-04 | Customer Detail Page — profile fields + lifecycle stage dropdown | P0 |
| CRM-P0-05 | Stage transition API + `customer_stage_history` + audit log | P0 |
| CRM-P0-06 | Tags CRUD — add/remove tags บน customer, tag management page | P0 |
| CRM-P1-01 | Identity Resolution — phone matching auto-merge, `customer_identities` table | P1 |
| CRM-P1-02 | Manual Merge UI — เปรียบเทียบ 2 customer + confirm merge | P1 |
| CRM-P1-03 | Activity Timeline — conversations + orders + enrollments + stage changes | P1 |
| CRM-P1-04 | Customer Create / Edit form พร้อม validation | P1 |
| CRM-P1-05 | Bulk Operations — bulk stage change, bulk tag, bulk assign agent | P1 |
| CRM-P1-06 | CSV Import — validate, preview, background QStash job | P1 |
| CRM-P1-07 | CSV Export — filtered export + large dataset background job | P1 |
| CRM-P1-08 | Deep link: คลิก conversation ใน timeline → เปิด Inbox | P1 |
| CRM-P2-01 | Segment Builder — dynamic rule-based smart lists | P2 |
| CRM-P2-02 | Segment sidebar ใน CRM list + apply as filter | P2 |
| CRM-P2-03 | Assigned Agent filter + agent workload summary | P2 |
| CRM-P2-04 | Customer Notes — staff บันทึก free-text note ต่อ customer | P2 |
| CRM-P2-05 | Duplicate Detection — แสดง warning ถ้า phone/email ซ้ำขณะ create | P2 |

---

## 9. Related

**Feature Specs:**
- FEAT-PROFILE.md — Customer Profile panel ใน Inbox sidebar (identity resolution detail, ads attribution)
- FEAT-INBOX.md — Unified Inbox: conversations link กลับมา customer record ใน CRM
- FEAT-DSB.md — Daily Sales Brief ใช้ lifecycle stage + conversion data จาก CRM
- FEAT-BILLING.md — Payment history per customer แสดงใน Activity Timeline
- FEAT-POS.md — Order history per customer แสดงใน Activity Timeline
- FEAT-AI-ASSISTANT.md — NL2SQL query อาจ query `customers` table โดยตรง

**Architecture Decision Records:**
- ADR-025: Cross-Platform Identity Resolution (phone matching + merge algorithm)
- ADR-039: Chat-First Revenue Attribution (ad attribution → customer record)
- ADR-045: RBAC Permission Matrix (role definitions)
- ADR-056: Multi-Tenant Isolation (tenant_id on every table)

**Code References:**
- `src/lib/repositories/customerRepo.js` — DB access layer
- `src/app/api/customers/` — API routes
- `src/app/api/workers/customer-import.js` — QStash import worker
- `prisma/schema.prisma` — `Customer`, `CustomerIdentity`, `CustomerTag`, `CustomerStageHistory`
