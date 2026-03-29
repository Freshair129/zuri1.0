# FEAT-BILLING — Invoice & Payment

**Status:** APPROVED
**Version:** 1.0.0
**Date:** 2026-03-27
**Origin:** ZURI-v1 (BUILT v2.2.0)
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview

Billing เป็นส่วนที่สองของ Tab 1 ใน Right Panel — รับข้อมูลจาก POS Panel และแปลงเป็น Invoice ที่ส่งให้ลูกค้าผ่าน Chat ได้ทันที พร้อมบันทึกประวัติการชำระเงินเข้า DB อัตโนมัติ

```
POS (cart confirmed)
    → Billing Tab เปิด
    → Invoice สร้างอัตโนมัติ
    → ส่งเข้า Chat
    → ลูกค้าชำระ
    → กดยืนยัน → บันทึกประวัติ + ล้างตะกร้า
```

---

## 2. Terminology

| คำ | นิยาม |
|---|---|
| **Invoice** | เอกสารแจ้งหนี้ที่ส่งให้ลูกค้า (มี invoice number, รายการ, ยอดรวม) |
| **Invoice Number** | รหัสใบแจ้งหนี้ — format: `INV-YYYYMMDD-NNN` |
| **Payment Slip** | ภาพสลิปโอนเงินที่ลูกค้าส่งกลับมา |
| **refNumber** | เลขอ้างอิงบนสลิป — ใช้ป้องกัน duplicate payment |
| **Transaction** | บันทึกการชำระเงินสำเร็จใน DB |

---

## 3. Feature Breakdown

### 3.1 Invoice View

- แสดงรายการสินค้าจาก cart (line items, qty, unit price)
- แสดงข้อมูลลูกค้า: ชื่อ, ช่องทาง, contact
- แสดงยอดรวม: subtotal → discount → VAT → **total**
- Invoice Number สร้างอัตโนมัติ (format `INV-YYYYMMDD-NNN`)
- วันที่ออกใบแจ้งหนี้ + วันกำหนดชำระ (default: วันเดียวกัน)

### 3.2 ส่ง Invoice เข้า Chat

- กด **"ส่งใบแจ้งหนี้"** → ระบบสร้าง text message รูปแบบ invoice
- Message วิ่งเข้า Chat อัตโนมัติในหน้า conversation ที่เปิดอยู่
- รองรับทั้ง Facebook Messenger และ LINE OA
- ลูกค้าเห็น invoice ในแอปตัวเองทันที

### 3.3 Slip OCR & Payment Verify

- ลูกค้าส่งสลิปกลับมาทาง Chat
- ระบบ OCR อ่านสลิปอัตโนมัติ (threshold 0.80)
- ถ้า confidence >= 0.80 → สร้าง Transaction อัตโนมัติ
- ถ้า < 0.80 → alert ให้ Staff ยืนยันด้วยตัวเอง
- `refNumber` unique constraint ป้องกันสลิปซ้ำ (ส่ง 2 ครั้ง → reject 409)

### 3.4 ยืนยันชำระ

- กด **"ชำระแล้ว"** (manual หรือหลัง OCR verify)
- ระบบ:
  1. สร้าง Transaction record (status: `PAID`)
  2. link กับ Order + Customer + Conversation
  3. ล้าง cart ใน POS Panel
  4. บันทึกประวัติการซื้อใน Customer Profile
  5. แสดง success toast

---

## 4. Data Flow

```
POST /api/invoices
    → สร้าง Invoice record
    → generate INV number
    → return invoice data

POST /api/conversations/[id]/reply  (ส่ง Invoice message)
    → format invoice เป็น message text
    → call FB/LINE API ส่ง message

POST /api/payments/verify-slip
    → รับ image base64
    → call OCR service (Gemini Vision)
    → ถ้า confidence >= 0.80 → POST /api/transactions
    → ถ้า < 0.80 → return { needsManualReview: true }

POST /api/transactions
    → สร้าง Transaction (PAID)
    → อัปเดต Order status → COMPLETED
    → revenue attribution trigger
```

---

## 5. Invoice Number Format

```
INV-20260327-001
    ^^^^^^^^^^  ^^^
    YYYYMMDD    sequence (reset ทุกวัน)
```

ดู `id_standards.yaml` สำหรับ format ครบถ้วน

---

## 6. Roles & Permissions

| Role | สิทธิ์ |
|---|---|
| SLS, AGT | ออก invoice, ยืนยันชำระ |
| MGR, ADM, ACC | ออก invoice, ยืนยัน, ดูประวัติทั้งหมด, void invoice |
| STF | ดูอย่างเดียว |

---

## 7. Known Gotchas

- Slip OCR threshold 0.80 — ต่ำกว่านี้ไม่สร้าง Transaction อัตโนมัติ
- `refNumber` unique constraint — ป้องกันสลิปซ้ำ (ส่ง 2 ครั้ง → 409 Conflict)
- Identity upsert ต้องอยู่ใน `prisma.$transaction` (NFR5)

---

## 8. Related

- ADR-030: Executive Revenue Channel Split
- ADR-039: Chat-First Revenue Attribution
- FEAT-POS.md (สร้าง cart ก่อน Billing)
- FEAT-PROFILE.md (ประวัติซื้อเก็บใน Customer Profile)
- `src/lib/repositories/paymentRepo.js`
