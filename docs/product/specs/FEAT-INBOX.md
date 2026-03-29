# FEAT-INBOX — Omni-Channel Unified Inbox

**Status:** APPROVED
**Version:** 1.1.0
**Date:** 2026-03-28
**Origin:** ZURI-v1 (BUILT v3.3.0)
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview

Unified Inbox รวม Facebook Messenger และ LINE OA ไว้ในหน้าเดียว — ทีมขายไม่ต้องสลับแอปเพื่อตอบลูกค้า ระบบแสดง badge แยกช่องทาง, กรองบทสนทนา, และส่งข้อความพร้อม UX ระดับ native messaging app

```
FB Messenger ──┐
               ├──▶ Zuri Unified Inbox ──▶ Sales Team
LINE OA ───────┘
```

Layout แบ่งเป็น 3 ส่วน:

```
[ Left Panel ]  [ Center Panel ]  [ Right Panel ]
  Convo List      Chat View         Customer Card
                                    + Quick Sale
```

---

## 2. Terminology

| คำ | นิยาม |
|---|---|
| **Conversation** | thread สนทนากับลูกค้า 1 คน (มีได้หลาย message) |
| **Channel** | แหล่งที่มาของ message: `facebook` / `line` |
| **Badge** | ไอคอนแสดงช่องทางบนการ์ด conversation |
| **Quick Reply** | ปุ่มตอบเร็วที่ส่งคู่กับข้อความ (FB Messenger feature) |
| **Quick Sale** | mini-POS ใน right sidebar สำหรับสร้าง order ขณะแชท |
| **dbId** | UUID internal ของ conversation (ต่างจาก Facebook `t_xxx`) |
| **customerId** | UUID ของลูกค้าในระบบ — ใช้ link order กับ conversation |

---

## 3. Feature Breakdown

### 3.1 Inbox List (Left Panel)

- แสดงรายการ conversation ทั้งหมดเรียงตามเวลาล่าสุด
- แต่ละการ์ดแสดง: ชื่อลูกค้า, preview ข้อความล่าสุด, เวลา, badge ช่องทาง
- **Filter bar:** กรองตาม agent, status (open/pending/closed), unread
- unread badge แสดงจำนวนข้อความยังไม่อ่าน
- Real-time update ผ่าน Pusher เมื่อมีข้อความใหม่

### 3.2 Chat View (Center Panel)

- แสดง message history ของ conversation ที่เลือก
- แยก bubble ซ้าย (ลูกค้า) / ขวา (ทีม)
- แสดง timestamp และชื่อ agent แต่ละ message
- รองรับ text, image, attachment

### 3.3 Reply Box

- กล่องพิมพ์ข้อความพร้อม send button
- กด Enter หรือคลิก Send → ส่งข้อความผ่าน platform API ทันที

### 3.4 Customer Card (Right Panel)

แสดงข้อมูลลูกค้าของ conversation ที่เลือก:

| Section | รายละเอียด |
|---|---|
| Profile Header | ชื่อ, membership tier, lifecycle stage |
| **Quick Sale toggle** | ปุ่มเปิด/ปิด ChatPOS panel |
| Contact | เบอร์โทร, อีเมล, Facebook ID |
| Labels | tags/labels ของลูกค้า |
| Ad Attribution | campaign ที่มาของ conversation |
| Courses Owned | คอร์สที่ลูกค้าซื้อแล้ว |
| AI Detect | scan ความสนใจสินค้าจากบทสนทนา |
| Actions | View Full Profile, Open in Meta Suite |

### 3.5 Quick Sale Panel (Right Panel — toggle)

- กดปุ่ม **Quick Sale** ใต้ profile header → เปิด `ChatPOS` component
- ค้นหาและเพิ่มสินค้า (courses/packages) ลงตะกร้า
- ตั้งส่วนลด, เลือกช่องทางชำระ (โอน/เงินสด)
- กด **สร้างออเดอร์** → POST `/api/orders` พร้อม `customerId` + `conversationId`
- เปลี่ยน conversation → panel ปิดอัตโนมัติ
- ดู spec เพิ่มเติม: **FEAT-POS.md**

---

## 4. Data Flow

```
Webhook (FB/LINE) → /api/webhooks/[platform]
    → identity resolution (customerRepo)
    → upsert Conversation + Message (DB)
    → push Pusher event: new-message
    → Inbox UI updates real-time

Send Reply:
    POST /api/conversations/[id]/reply
    → call FB Graph API / LINE Messaging API
    → save Message to DB (sender: STAFF)

Load Conversations:
    GET /api/conversations
    → returns { id, dbId, customerId, customerName, ... }
    → dbId + customerId ใช้โดย ChatPOS สำหรับสร้าง order
```

---

## 5. Webhook Sources

| Platform | Webhook Path | Verify Method |
|---|---|---|
| Facebook Messenger | `/api/webhooks/facebook` | hub.challenge token verify |
| LINE OA | `/api/webhooks/line` | X-Line-Signature HMAC |

---

## 6. NFR

- **NFR1:** Webhook ตอบ Facebook < 200ms (ตอบ 200 ทันที → process async)
- **NFR2:** Inbox load < 500ms (Redis cache conversation list)
- ไม่มี message loss: QStash retry >= 5 ครั้งถ้า processing fail

---

## 7. Roles & Permissions

| Role | สิทธิ์ |
|---|---|
| SLS, AGT | อ่าน + ตอบ conversation, ใช้ Quick Sale |
| MGR, ADM | อ่าน + ตอบ ทุก conversation, ใช้ Quick Sale |
| STF | ดูอย่างเดียว |

---

## 8. Known Gotchas

- FB Webhook race condition: `findFirst→create` ไม่ atomic → ต้อง try-catch `P2002`
- Redis `_inflight` ต้องมี watchdog timeout — ป้องกัน memory leak
- Quick Replies รองรับเฉพาะ FB Messenger (LINE ใช้ flex message แทน)
- `conversations` API ต้อง expose `dbId` และ `customerId` — ถ้าขาดสองฟิลด์นี้ Quick Sale จะใช้ไม่ได้

---

## 9. Related

- ADR-028: Facebook Messaging Integration
- ADR-033: Unified Inbox Implementation
- ADR-044: Web Push Inbox Realtime
- FEAT-POS.md (Quick Sale / ChatPOS spec)
- FEAT-PROFILE.md (customer identity ที่ link กับ conversation)
- FEAT-AGENT.md (AI ช่วยร่างคำตอบ)
