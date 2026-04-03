# FEAT-POS — Zuri POS Module

**Status:** APPROVED
**Version:** 1.0
**Date:** 2026-03-30
**Approved:** 2026-03-30
**Author:** Boss (Product Owner)
**Reviewer:** —

---

## 1. Overview

POS module สำหรับธุรกิจ F&B และโรงเรียนสอนทำอาหาร รองรับ 3 channel การขาย พร้อมระบบ floor plan, loyalty, และเอกสารครบถ้วนตามมาตรฐานสรรพากรไทย

**Core value:** "เปิดบิล รับเงิน ออกใบกำกับ — จบในจอเดียว"

---

## 2. Order Types

| Type | ช่องทาง | Device | หมายเหตุ |
|---|---|---|---|
| **Onsite** | กินที่ร้าน | Android Tablet | เลือกโต๊ะ/โซนจาก floor plan |
| **Takeaway** | รับกลับบ้าน | Android Tablet | ไม่ต้องเลือกโต๊ะ |
| **Online** | สั่งผ่าน QR/web | Mobile (ลูกค้า) → POS | auto-push เข้า POS queue |

### Device Strategy
- **Android Tablet** — POS หลัก (cashier, kitchen display)
- **iOS** — Runner app เท่านั้น (รับออเดอร์ที่โต๊ะ, ส่งครัว, เรียกเก็บเงิน)
- **Web browser** — fallback + back-office management

---

## 3. Mobile Ordering Page (QR Order)

### Tech Stack
- **Static HTML + PHP** — host แยกจาก Next.js (lightweight, เร็ว, ไม่ขึ้นกับ Vercel)
- ลูกค้าสแกน QR ที่โต๊ะ → เลือกเมนู → กด confirm → ส่ง webhook เข้า Zuri POS

### Flow
```
QR Code (per table/zone)
  → mobile-order.zuriapp.com/?t={tableId}&tenant={tenantId}
  → แสดงเมนู (ดึงจาก Zuri API)
  → ลูกค้าเลือก + ยืนยัน
  → POST /api/pos/orders (online type)
  → Pusher push → POS Android รับออเดอร์ทันที
  → Kitchen display อัพเดท
```

### หน้า Mobile Ordering
- เมนูพร้อมรูป, ราคา, หมวดหมู่
- ตะกร้าสินค้า, หมายเหตุต่อรายการ
- สรุปยอด + ยืนยันสั่ง
- ไม่มี payment ในหน้านี้ (ชำระที่แคชเชียร์)

---

## 4. Floor Plan System

### 4.1 Overview
ระบบผังสถานที่สำหรับ F&B และห้องเรียน กำหนดได้อิสระต่อ tenant

### 4.2 Elements
| Element | ตัวอย่าง | หมายเหตุ |
|---|---|---|
| **Zone** | โซน A, ระเบียง, VIP, ห้องเรียน 1 | grouping ของโต๊ะ |
| **Table** | T01–T20, โต๊ะกลม 6 ที่นั่ง | มี capacity |
| **Room** | ห้อง Pastry, ห้อง Bakery | สำหรับ culinary school |
| **Counter** | หน้าร้าน, Takeaway counter | ไม่มีที่นั่ง |

### 4.3 Table Status
- **Available** (ว่าง) — เขียว
- **Occupied** (มีลูกค้า) — แดง
- **Reserved** (จอง) — เหลือง
- **Bill Requested** (เรียกบิล) — ส้ม
- **Cleaning** (กำลังเก็บ) — เทา

### 4.4 Floor Plan Editor (Back-office)
- Drag & drop วางโต๊ะ/โซน บน canvas
- กำหนด shape (สี่เหลี่ยม, วงกลม), ขนาด, ที่นั่ง
- Save layout ต่อ tenant
- รองรับหลาย floor (ชั้น 1, ชั้น 2)

---

## 5. Document System

### 5.1 Document Types

| เอกสาร | ใช้เมื่อ | มาตรฐาน |
|---|---|---|
| **ใบเสร็จรับเงิน** | ทุก transaction | - |
| **ใบกำกับภาษีอย่างย่อ** | ค้าปลีก VAT 7% | สรรพากร |
| **ใบกำกับภาษีเต็มรูปแบบ** | B2B, ต้องการใบกำกับ | สรรพากร |
| **ใบแจ้งหนี้** | เครดิต/จ่ายทีหลัง | - |
| **e-Receipt** | ส่ง email/LINE | - |

### 5.2 หัวบิล (Receipt Header) — Configurable ต่อ Tenant
```
[โลโก้]
ชื่อกิจการ: ___________
ที่อยู่: _______________
เลขประจำตัวผู้เสียภาษี: ___ (13 หลัก)
เบอร์โทร: _____________
เว็บไซต์/LINE OA: ______
```

### 5.3 VAT & Discount
- **VAT:** 7% (configurable จาก `system_config.yaml`, include/exclude)
- **ส่วนลด:**
  - ส่วนลดรายรายการ (item-level discount)
  - ส่วนลดท้ายบิล (bill-level discount) — บาท หรือ %
  - โค้ดส่วนลด (coupon code)
  - ส่วนลด member (ผูกกับ loyalty)
- **Service charge:** optional (% configurable)

### 5.4 e-Receipt
- ส่งทาง LINE (ถ้า customer เชื่อม LINE)
- ส่งทาง Email
- QR code สำหรับดูใบเสร็จออนไลน์
- PDF download

---

## 6. Loyalty & Member Integration

> **IMPORTANT:** POS ไม่เก็บข้อมูล member เอง — CRM module เป็น single source of truth
> POS เรียกใช้ผ่าน CRM API เท่านั้น

### 6.1 Member Lookup at Checkout

**Key:** เบอร์โทรศัพท์ (primary identifier ข้าม POS ↔ CRM ↔ LINE)

```
Cashier กรอกเบอร์โทร (หรือ scan QR member card)
  → GET /api/crm/members/lookup?phone=0812345678
  → CRM ส่งกลับ:
      - ชื่อ member, tier, แต้มคงเหลือ
      - ส่วนลดที่ได้รับสิทธิ์ (tier discount, birthday, โปรโมชัน)
      - ของแถม/free item ที่ eligible
  → POS แสดง member card popup ก่อน checkout
  → Cashier เลือก apply ส่วนลด/ของแถม
  → หลังชำระเงิน → POST /api/crm/members/earn-points
```

### 6.2 Member Card Popup (POS UI)

เมื่อเจอ member จะแสดง:
```
┌─────────────────────────────────┐
│ 👤 คุณสมชาย  [Gold Member]      │
│ แต้มคงเหลือ: 1,240 แต้ม         │
├─────────────────────────────────┤
│ ✅ ส่วนลด Gold 10% (฿45)        │
│ 🎁 [CRM] เครื่องดื่มฟรี (Gold tier) │
│ 🎂 [CRM] Dessert ฟรี (เกิดเดือนนี้) │
│ 🎁 [SALES] ซื้อครบ ฿500 แถม coffee  │
│ ⭐ วันนี้ได้ 2x points (โปรโมชัน) │
├─────────────────────────────────┤
│ [Apply ส่วนลด]  [ไม่ใช้สิทธิ์]   │
└─────────────────────────────────┘
```

### 6.3 Point Earn/Redeem Rules
- **Earn:** ทุก ฿X = 1 แต้ม (configurable ต่อ tenant ใน CRM)
- **Redeem:** แต้ม X = ส่วนลด ฿Y (cashier เลือก apply)
- **Expire:** configurable (0 = ไม่หมดอายุ)
- **Multiplier:** วันพิเศษ/โปรโมชัน 2x, 3x (set ที่ CRM/Marketing)
- **Idempotency:** earn points ผูกกับ `order_id` — double-tap ไม่บวกแต้มซ้ำ

### 6.4 ของแถม — Module Ownership

| ประเภท | เก็บที่ | ตัวอย่าง |
|---|---|---|
| **Tier benefit** | CRM | Gold member ได้เครื่องดื่มฟรี 1 แก้ว/เดือน |
| **Point redemption** | CRM | แลก 500 แต้ม = ขนมฟรี 1 ชิ้น |
| **Birthday reward** | CRM | เกิดเดือนนี้ได้ dessert ฟรี |
| **Promotional gift** | Marketing | ซื้อครบ ฿500 แถม coffee (มีวันหมดอายุ) |
| **Bundle deal** | POS/Product | ซื้อ Set A แถมน้ำ 1 แก้ว |

**POS checkout engine** = query CRM + Marketing พร้อมกัน → merge ของแถมทั้งหมด → แสดงให้ cashier เลือก apply

### 6.5 Member Registration at POS
ถ้าลูกค้าไม่มี member → Cashier กด "สมัคร member"
- กรอก ชื่อ + เบอร์โทร (minimum)
- POST /api/crm/members → สร้างใน CRM ทันที
- ได้รับแต้มจาก transaction นี้เลย

> **Open question resolved:** ของแถมจาก loyalty/tier/birthday → CRM, ของแถมจากแคมเปญ → Marketing, bundle deals → POS

---

## 7. Payment Methods

- เงินสด (พร้อม change calculation)
- โอนผ่านธนาคาร (QR PromptPay)
- บัตรเครดิต/เดบิต (ผ่าน 3rd party EDC)
- Line Pay / True Money (phase 2)
- เครดิต/แท็บ (สำหรับ member)

---

## 8. Kitchen Integration

- ทุก order → kitchen display (KDS) อัตโนมัติ
- แยก station ได้ (ครัวเย็น, ครัวร้อน, เครื่องดื่ม)
- Staff กด "Done" ที่ KDS → Runner รับแจ้ง iOS app
- void/modify order ได้ก่อน kitchen confirm

---

## 9. Reports (POS-specific)

| Report | Period | ใครดูได้ |
|---|---|---|
| ยอดขายรายวัน | daily | MANAGER, OWNER, FINANCE |
| สรุปตาม order type | daily/monthly | MANAGER, OWNER |
| รายงาน VAT | monthly | FINANCE, OWNER |
| top-selling items | configurable | MANAGER, OWNER |
| loyalty/member report | monthly | MANAGER, OWNER, SALES |
| ส่วนลดที่ให้ไป | daily/monthly | MANAGER, OWNER, FINANCE |

---

## 10. DB Schema (tentative)

```sql
-- pos_orders
id, tenant_id, order_type (onsite/takeaway/online),
table_id, member_id, status, subtotal, discount_amount,
vat_amount, service_charge, total, payment_method,
created_by, created_at

-- pos_order_items
id, order_id, tenant_id, menu_item_id, qty, unit_price,
discount, note, kitchen_status, created_at

-- pos_tables
id, tenant_id, zone_id, name, capacity, shape,
position_x, position_y, floor, status

-- pos_zones
id, tenant_id, name, floor, color

-- (member data อยู่ใน CRM module — crm_customers)
-- POS reference ด้วย customer_id + phone เท่านั้น

-- pos_receipt_config
id, tenant_id, logo_url, business_name, address,
tax_id, phone, website, vat_included, vat_rate,
service_charge_rate, footer_text
```

---

## 11. Open Questions

- [ ] Floor plan editor — build custom หรือใช้ library? (Boss decide)
- [ ] iOS Runner app — Native Swift หรือ PWA?
- [ ] Mobile ordering page domain — subdomain Zuri หรือ white-label per tenant?
- [ ] Payment gateway สำหรับ online payment — OmisePay / 2C2P?
- [ ] Member card — physical card หรือ digital QR เท่านั้น?

---

## 12. Dependencies

- `prisma/schema.prisma` — ต้องเพิ่ม tables ข้างต้น
- Kitchen Ops module (recipe, ingredient)
- CRM module (customer → member link)
- Pusher (real-time order push to POS/KDS)
- QStash (async: e-receipt delivery, point expiry jobs)

---

## 13. ADR Required

- ADR-XXX: POS Mobile Ordering Architecture (static PHP vs Next.js)
- ADR-XXX: Floor Plan Storage Model
- ADR-XXX: Loyalty Point Consistency (idempotency on double-tap)

---

*Status: APPROVED 2026-03-30 by Boss*
