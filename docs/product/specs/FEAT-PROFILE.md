# FEAT-PROFILE — Customer Profile (CRM)

**Status:** APPROVED
**Version:** 1.0.0
**Date:** 2026-03-27
**Origin:** ZURI-v1 (BUILT v3.1.0)
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview

Customer Profile คือ Tab 2 ของ Right Panel — แสดงข้อมูลลูกค้าที่กำลังสนทนาอยู่แบบ real-time ให้ทีมขายรู้ context ทันที: มาจากโฆษณาไหน, ซื้ออะไรไปแล้ว, intent คืออะไร, status ปัจจุบันอยู่ที่ไหน

```
เปิด Conversation → Profile Tab แสดงข้อมูลลูกค้าของ conversation นั้นทันที
```

---

## 2. Terminology

| คำ | นิยาม |
|---|---|
| **Ads ID** | Meta Ad ID ที่ลูกค้า click มา (attribution) |
| **Intent** | ความสนใจที่ระบบหรือ staff tag ไว้ เช่น "คอร์สญี่ปุ่น", "ราคา" |
| **Status** | สถานะ lead: `NEW` → `CONTACTED` → `INTERESTED` → `ENROLLED` → `PAID` |
| **Tag** | label ที่ติดไว้บนลูกค้า เช่น "VIP", "คอร์สฟรี", "ส่วนลด10%" |
| **CTA** | Call-to-Action button ที่ staff กดเพื่อ update ข้อมูลลูกค้าใน profile |

---

## 3. Field Breakdown

### 3.1 Ads ID

- แสดง Meta Ad ID ที่ลูกค้า click ก่อนทักมา
- ถ้าไม่มี Attribution → แสดง "Direct" หรือ "Unknown"
- กดดู campaign/adset ที่มาได้ (link ไปหน้า Marketing)
- ใช้สำหรับวัด ROAS และ cost per lead

### 3.2 Name & Information

- ชื่อ-นามสกุล (จาก FB profile หรือที่ staff กรอก)
- เบอร์โทรศัพท์ (format E.164: `+66XXXXXXXXX`)
- Email (optional)
- ช่องทาง: Facebook / LINE พร้อม platform ID
- ปุ่ม Edit: แก้ไขข้อมูลได้ inline

### 3.3 Intent

- Tag ความสนใจของลูกค้า (staff เพิ่ม/แก้ได้)
- รูปแบบ free text หรือ predefined tags
- ใช้ประกอบการตัดสินใจ follow-up และ segment

### 3.4 Status

- Funnel stage ปัจจุบัน: `NEW → CONTACTED → INTERESTED → ENROLLED → PAID`
- เปลี่ยน status ได้จาก dropdown ใน Profile tab
- ระบบบันทึก timestamp ทุกครั้งที่ status เปลี่ยน
- ใช้สำหรับ conversion report และ KPI dashboard

### 3.5 Tag

- Multi-tag: ลูกค้า 1 คนมีได้หลาย tag
- Staff เพิ่ม/ลบ tag ได้จาก UI
- ใช้สำหรับ filter ใน Customer list และ broadcast

### 3.6 CTA (Call-to-Action)

- ปุ่ม shortcut สำหรับ action ที่ทำบ่อย:
  - **"ลงเรียน"** → เปิด Enrollment flow
  - **"ส่ง Invoice"** → switch ไป Billing Tab พร้อมข้อมูลลูกค้า
  - **"Mark Paid"** → อัปเดต status → PAID ทันที
  - **"Follow Up"** → สร้าง Task reminder (link กับ task system)

---

## 4. Identity Resolution

ลูกค้า 1 คนอาจทักมาจากหลายช่องทาง — ระบบ merge identity อัตโนมัติ:

```
FB Messenger (PSID: xxx) ──┐
                            ├──▶ Customer record เดียว (identity resolved)
LINE OA (userId: yyy) ─────┘
                            (match ด้วย phone หรือ manual merge)
```

- Auto-merge: phone number matching
- Manual merge: staff กด "Merge Customer" ใน UI
- ดู ADR-025 สำหรับ algorithm ครบถ้วน

---

## 5. Data Flow

```
GET /api/customers/[id]
    → return customer fields + latest conversation
    → Redis cache 60 วินาที

PATCH /api/customers/[id]
    → อัปเดต name/phone/intent/status/tags
    → clear Redis cache
    → audit log (logAction)

GET /api/customers/[id]/history
    → ประวัติการซื้อ + conversation summary
```

---

## 6. Roles & Permissions

| Role | สิทธิ์ |
|---|---|
| SLS, AGT | ดู + แก้ข้อมูลลูกค้าที่ตัวเองดูแล |
| MGR, ADM | ดู + แก้ ทุก customer |
| MKT | ดู ads attribution + intent |
| STF | ดูอย่างเดียว |

---

## 7. Known Gotchas

- `Customer` ไม่มี field `channel` — ใช้ `conversation.channel` แทน
- `profilePicture` เก็บ base64 — ถ้า photo ใหญ่กระทบ DB row size
- Phone ต้อง normalize เป็น E.164 ก่อน save เสมอ (ป้องกัน duplicate)

---

## 8. Related

- ADR-025: Cross-Platform Identity Resolution
- ADR-039: Chat-First Revenue Attribution
- FEAT-INBOX.md (conversation ที่ trigger Profile panel)
- FEAT-BILLING.md (ประวัติชำระเงินที่เห็นใน Profile)
- `src/lib/repositories/customerRepo.js`
