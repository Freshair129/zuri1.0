# FEAT-DSB — AI Daily Sales Brief

**Status:** APPROVED
**Version:** 1.0.0
**Date:** 2026-03-27
**Origin:** ZURI-v1 (DRAFT)
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview

ระบบ AI วิเคราะห์ conversation ทั้งหมดในแต่ละวัน แล้วส่ง summary ให้ MANAGER/SALES ตอน 8 โมงเช้าของวันถัดไป โดยอัตโนมัติ — ไม่ต้องรอ admin ส่งยอด

```
00:00 — Admin ปิดยอดประจำวัน (cutoff)
00:05 — QStash trigger: ดึง conversations ของวันที่ผ่านมาทั้งหมด
00:05–07:55 — AI process + analyze (background)
08:00 — ส่ง Daily Brief ให้ MANAGER/SALES ทาง LINE
```

---

## 2. Terminology

| คำ | นิยาม |
|---|---|
| **Contact** | ทักมาครั้งแรก ไม่เคยมีในระบบมาก่อน |
| **Lead** | เคยทักมาแล้ว ยังไม่เคยซื้อ/ลงเรียน |
| **Customer** | เคยซื้อหรือลงเรียนแล้วอย่างน้อย 1 ครั้ง |

---

## 3. Core Capabilities

### 3.1 Per-Conversation Analysis
Gemini วิเคราะห์แต่ละ conversation และ output:

| Field | Type | ตัวอย่าง |
|---|---|---|
| `contact_type` | enum | CONTACT / LEAD / CUSTOMER |
| `source_ad_id` | string | `23851XXXXXXX` หรือ `ORGANIC` |
| `tags` | string[] | `["salmon", "beginner", "weekend"]` |
| `state` | enum | ดูหัวข้อ 3.2 |
| `cta` | enum | ดูหัวข้อ 3.3 |
| `revenue` | number | ยอดปิดได้วันนี้ (0 ถ้าไม่มี) |
| `summary` | string | สรุป 1-2 ประโยค |

### 3.2 Conversation States

| State | ความหมาย |
|---|---|
| `INQUIRY` | ถามข้อมูลทั่วไป ยังไม่แสดงความสนใจชัดเจน |
| `CONSIDERING` | สนใจแล้ว แต่ยังไม่ตัดสินใจ |
| `HOT` | แสดงความตั้งใจจะซื้อ รอแค่ปิดการขาย |
| `CLOSED_WON` | ปิดการขายได้ มีสลิปยืนยัน |
| `CLOSED_LOST` | ไม่สนใจแล้ว หรือไปหาที่อื่น |
| `IDLE` | ไม่มีการตอบโต้ (อ่านแล้วไม่ตอบ) |

### 3.3 CTA Recommendations

| CTA | ใช้เมื่อ |
|---|---|
| `EDUCATE` | Contact + INQUIRY → ให้ข้อมูลคอร์ส |
| `NURTURE` | Lead + INQUIRY → ส่ง content สร้าง trust |
| `PUSH_TO_CLOSE` | Lead/Customer + CONSIDERING → ส่งโปร + deadline |
| `CALL_NOW` | HOT → โทรหาทันที |
| `UPSELL` | Customer + CLOSED_WON → แนะนำคอร์สต่อไป |
| `RE_ENGAGE` | IDLE > 3 วัน → ส่ง follow-up |
| `NO_ACTION` | CLOSED_LOST → ไม่ต้องทำอะไร |

### 3.4 Auto-Tagging
Gemini extract tags จาก conversation text:
- ประเภทอาหาร: `salmon`, `ramen`, `sushi`, `wagyu`, `pastry`
- ระดับ: `beginner`, `intermediate`, `advanced`
- เวลา: `weekend-only`, `weekday`, `evening`
- ราคา: `price-sensitive`, `premium`
- จุดประสงค์: `hobby`, `professional`, `gift`

กฎ: lowercase, Thai romanization (salmon ไม่ใช่ ปลาแซลมอน), max 5 tags/conversation

---

## 4. Auto Customer Profiling

Gemini infer ข้อมูลโปรไฟล์ลูกค้าจากบทสนทนาอัตโนมัติ — ลูกค้าไม่ต้องกรอก form

### 4.1 Fields ที่ infer ได้

| Field | ประเภท | ตัวอย่างที่ Gemini detect ได้ |
|---|---|---|
| `gender` | M / F / OTHER / UNKNOWN | คำสรรพนาม: ผม/ครับ → M, หนู/ค่ะ/คะ → F, เรา/จ้า → OTHER |
| `hasChildren` | true / false / UNKNOWN | "ลูกชอบกิน", "พาลูกมาด้วยได้ไหม" |
| `occupation` | string | "เป็นพยาบาล", "ทำธุรกิจ", "แม่บ้าน" |
| `educationLevel` | string | "เรียนจบปริญญา", "กำลังเรียนอยู่" |
| `cookingLevel` | BEGINNER / INTERMEDIATE / ADVANCED | "ไม่เคยทำอาหารเลย", "ทำบ้างอยู่แล้ว" |
| `motivation` | string[] | `["hobby", "open_restaurant", "gift", "career"]` |
| `ageRange` | string | "20-30", "30-40", UNKNOWN |
| `location` | string (เขต/จังหวัด) | "อยู่สมุทรปราการ", "แถวอโศก" |
| `budgetSignal` | LOW / MID / HIGH / UNKNOWN | "แพงไปนิด", "ราคาโอเค" |

### 4.2 หลักการ

- **Infer เท่านั้น ไม่ถาม** — AI ดูจากบทสนทนาที่มีอยู่
- **UNKNOWN ดีกว่าเดา** — ถ้าไม่แน่ใจ → set UNKNOWN
- **Accumulate ข้ามวัน** — merge กับที่มีอยู่ ไม่ overwrite ด้วย UNKNOWN
- **location = เขต/จังหวัดเท่านั้น** — ห้าม infer บ้านเลขที่

### 4.3 PDPA Rationale

| Field | Lawful Basis |
|---|---|
| `gender` | ลูกค้าเปิดเผยเองผ่านสรรพนามทุกประโยค — ในภาษาไทยสรรพนามบอกเพศโดยตรง |
| `location` | ลูกค้าบอกเองในแชท + เก็บระดับเขต/จังหวัดเท่านั้น |
| ข้อมูลอื่น | Legitimate Interest — ลูกค้าเปิดเผยเองใน commercial conversation |
| ทั้งหมด | Privacy Notice ใน LINE Welcome Message |

---

## 5. Daily Brief Output

### 5.1 LINE Message (ส่งทุกเช้า 08:00 — สรุปยอดวันก่อนหน้า)

```
📊 Zuri Daily Brief — {date}
────────────────────────────
💬 Conversations วันนี้: {total}

👤 Contact (ใหม่): {count}
🔄 Lead (เคยทักแล้ว): {count}
⭐ Customer (ซื้อแล้ว): {count}

✅ ปิดได้วันนี้: {closed_won} คน → ฿{revenue}
🔥 Hot (ติดตามด่วน): {hot_count} คน
⏳ Considering: {considering_count} คน
❄️ Lost/Idle: {lost_count} คน

📌 Top CTA วันนี้:
• {name} — {tag} → {cta_text}
• {name} — {tag} → {cta_text}
• {name} — {tag} → {cta_text}

📣 แหล่งที่มา:
• Ad {ad_id_short}: {count} คน
• Organic: {count} คน
```

### 5.2 Dashboard Card
- Daily Brief panel ใน Executive Analytics
- Filter by: date range, contact_type, tag, state
- Export CSV

---

## 6. Promotion Intelligence

Boss ถาม AI ว่า "เดือนหน้าทำโปรอะไรดี?" → AI query tags + states แล้วแนะนำ:

```
tag=salmon, state=CONSIDERING, count=34
→ ทำ Early Bird + deadline 72 ชม. (ไม่ใช่ content — พวกเขารู้แล้ว)

tag=beginner, contact_type=CONTACT, count=28
→ ทำ Trial Class ราคาพิเศษ (เป้า: convert CONTACT → LEAD)

tag=salmon, contact_type=CUSTOMER, count=12
→ Advanced Salmon Course — Upsell โดยตรง
```

---

## 7. Chat ID Reference

| ชื่อ | Field ใน DB | ตัวอย่าง | หน้าที่ |
|---|---|---|---|
| **Thread ID** | `Conversation.conversationId` | `t_12345678` | Business key จาก Facebook |
| **MID** | `Message.messageId` | `m_AbCdEfGh...` | ID ข้อความ — unique, ป้องกัน duplicate |
| **PID** | `Conversation.participantId` | `3847291xxx` | Facebook PSID = `Customer.facebookId` |

```
Conversation.id           → UUID (internal PK — ใช้ใน FK ทั้งหมด)
Conversation.conversationId → t_xxx (Facebook thread ID — business key)
```

> ⚠️ `ConversationAnalysis.conversationId` FK ชี้ไป `Conversation.id` (UUID) ไม่ใช่ `t_xxx`

LINE: Thread = `U1234...` / `C1234...` · User = `Customer.lineId` · Message = `E_xxx`

---

## 8. Data Model

### Context — Schema ที่มีอยู่แล้ว

| Model | Field | หมายเหตุ |
|---|---|---|
| `Customer` | `lifecycleStage` | ใช้เก็บ Contact/Lead/Customer — standardize values ใหม่ |
| `Customer` | `intelligence` (Json) | deprecated → ย้ายไป `CustomerProfile` |
| `Customer` | `originId` | source ad attribution มีอยู่แล้ว |
| `Conversation` | `firstTouchAdId` | ใช้เป็น sourceAdId ได้เลย |
| `ConversationIntelligence` | `summary`, `sentiment` | NotebookLM — ไม่แตะ |

### 8.1 ConversationAnalysis (ใหม่)

```prisma
model ConversationAnalysis {
  id             String   @id @default(uuid())
  conversationId String   @map("conversation_id")
  analyzedDate   DateTime @map("analyzed_date")    // 00:00:00 ของวันที่ run
  analyzedAt     DateTime @default(now()) @map("analyzed_at")

  contactType    String   @map("contact_type")     // CONTACT | LEAD | CUSTOMER
  state          String                             // INQUIRY | CONSIDERING | HOT | CLOSED_WON | CLOSED_LOST | IDLE
  cta            String                             // EDUCATE | NURTURE | PUSH_TO_CLOSE | CALL_NOW | UPSELL | RE_ENGAGE | NO_ACTION
  revenue        Float    @default(0)
  sourceAdId     String?  @map("source_ad_id")     // copy จาก Conversation.firstTouchAdId

  tags           String[]
  summary        String   @db.Text
  rawOutput      Json?    @map("raw_output")

  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@unique([conversationId, analyzedDate])  // 1 ต่อวัน, re-analyze ได้ข้ามวัน
  @@index([analyzedDate])
  @@index([contactType])
  @@index([state])
  @@index([tags])
  @@map("conversation_analyses")
}
```

### 8.2 CustomerProfile (ใหม่)

```prisma
model CustomerProfile {
  id             String   @id @default(uuid())
  customerId     String   @unique @map("customer_id")
  updatedAt      DateTime @updatedAt @map("updated_at")

  gender         String?                            // M | F | OTHER | UNKNOWN
  ageRange       String?  @map("age_range")         // "20-30" | "30-40" | UNKNOWN
  hasChildren    Boolean? @map("has_children")
  occupation     String?
  educationLevel String?  @map("education_level")
  location       String?                            // เขต/จังหวัดเท่านั้น — ห้ามบ้านเลขที่

  cookingLevel   String?  @map("cooking_level")    // BEGINNER | INTERMEDIATE | ADVANCED
  motivation     String[] @default([])             // hobby | open_restaurant | gift | career | health
  budgetSignal   String?  @map("budget_signal")    // LOW | MID | HIGH | UNKNOWN

  inferenceCount Int      @default(0) @map("inference_count")
  lastInferredAt DateTime? @map("last_inferred_at")

  customer       Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("customer_profiles")
}
```

### 8.3 DailyBrief (ใหม่)

```prisma
model DailyBrief {
  id                 String    @id @default(uuid())
  briefDate          DateTime  @unique @map("brief_date")  // 00:00:00 ICT

  totalConversations Int       @default(0) @map("total_conversations")
  totalContacts      Int       @default(0) @map("total_contacts")
  totalLeads         Int       @default(0) @map("total_leads")
  totalCustomers     Int       @default(0) @map("total_customers")

  closedWon          Int       @default(0) @map("closed_won")
  totalRevenue       Float     @default(0) @map("total_revenue")
  hotLeads           Int       @default(0) @map("hot_leads")
  considering        Int       @default(0) @map("considering")
  closedLost         Int       @default(0) @map("closed_lost")

  topCtas            Json      @default("[]") @map("top_ctas")
  // [{ customerId, name, tags, cta, state }] top 5

  adBreakdown        Json      @default("{}") @map("ad_breakdown")
  // { "adId_xxx": { count, revenue }, "ORGANIC": { count, revenue } }

  topTags            Json      @default("[]") @map("top_tags")
  // [{ tag, count, states: { CONSIDERING: 10, HOT: 3 } }] top 10

  status             String    @default("PENDING")  // PENDING | PROCESSING | DONE | FAILED
  processedAt        DateTime? @map("processed_at")
  sentAt             DateTime? @map("sent_at")

  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@index([briefDate])
  @@index([status])
  @@map("daily_briefs")
}
```

### 8.4 Relation Diagram

```
Customer (1) ──── (1) CustomerProfile
    │
    └── (many) Conversation (1) ──── (many) ConversationAnalysis
                    │
                    └── (many) ConversationIntelligence  [existing — ไม่แตะ]

DailyBrief  [standalone aggregate]
```

---

## 9. Migration Plan

```sql
-- Migration 1: conversation_analyses
CREATE TABLE conversation_analyses (...);
CREATE UNIQUE INDEX ON conversation_analyses (conversation_id, analyzed_date);
CREATE INDEX idx_conv_analysis_tags ON conversation_analyses USING GIN(tags);

-- Migration 2: customer_profiles
CREATE TABLE customer_profiles (...);
-- Backfill เฉพาะปี 2026
INSERT INTO customer_profiles (id, customer_id, updated_at)
SELECT gen_random_uuid(), id, NOW()
FROM customers WHERE created_at >= '2026-01-01'
ON CONFLICT DO NOTHING;

-- Migration 3: daily_briefs
CREATE TABLE daily_briefs (...);
CREATE UNIQUE INDEX ON daily_briefs (brief_date);

-- Migration 4: standardize lifecycle_stage
-- ผลจาก DB (2026-03-27): Lead(978), InProgress(132), New Lead(2), Customer(1), Walk-in(1)
UPDATE customers SET lifecycle_stage = 'CONTACT'  WHERE lifecycle_stage = 'New Lead';
UPDATE customers SET lifecycle_stage = 'LEAD'     WHERE lifecycle_stage IN ('Lead', 'InProgress', 'Walk-in');
UPDATE customers SET lifecycle_stage = 'CUSTOMER' WHERE lifecycle_stage = 'Customer';
```

---

## 10. API Endpoints

| Method | Path | หน้าที่ |
|---|---|---|
| `POST` | `/api/workers/daily-brief/process` | QStash 00:05 — run analysis |
| `POST` | `/api/workers/daily-brief/notify` | QStash 08:00 — ส่ง LINE |
| `GET` | `/api/daily-brief` | brief list (dashboard) |
| `GET` | `/api/daily-brief/[date]` | brief ของวันที่ระบุ |
| `GET` | `/api/customers/[id]/profile` | inferred profile |
| `POST` | `/api/ai/promo-advisor` | Boss ถาม → แนะนำ promotion |

---

## 11. Technical Notes

**Cron Schedule:**
- Process: `5 17 * * *` UTC = 00:05 ICT
- Notify: `0 1 * * *` UTC = 08:00 ICT

**Gemini Strategy:**
- ส่งทีละ conversation (ไม่ batch — เพื่อความแม่นยำ)
- Output: structured JSON
- Max 500 conv/day → ถ้าเกิน prioritize HOT + CONSIDERING ก่อน
- ถ้า process ยังไม่เสร็จตอน 08:00 → notify ส่ง "กำลังประมวลผล" แล้ว retry

**Dependencies (มีอยู่แล้วทั้งหมด):**
Gemini API · QStash · LINE Messaging API · Prisma + Supabase · conversationRepo

---

## 12. Implementation Phases

| Phase | งาน | Priority |
|---|---|---|
| **DSB-P1** | DB migration (4 migrations ตาม section 9) | P0 |
| **DSB-P2** | `conversationAnalyzer.js` — Gemini prompt + parser | P0 |
| **DSB-P3** | `customerProfiler.js` — infer demographics + merge logic | P0 |
| **DSB-P4** | `/api/workers/daily-brief/process` + QStash cron 00:05 | P0 |
| **DSB-P5** | `/api/workers/daily-brief/notify` + LINE formatter 08:00 | P0 |
| **DSB-P6** | Customer card UI — inferred profile display | P1 |
| **DSB-P7** | Dashboard — daily brief panel + filter | P1 |
| **DSB-P8** | `/api/ai/promo-advisor` | P1 |
| **DSB-P9** | Export CSV + history | P2 |

---

## 13. Decision Log

| # | คำถาม | คำตอบ | วันที่ |
|---|---|---|---|
| Q1 | ConversationAnalysis — 1:1 หรือ many? | ทั้งสองแบบ → unique(conversationId, analyzedDate) | 2026-03-27 |
| Q2 | CustomerProfile backfill? | เฉพาะปี 2026 (createdAt >= 2026-01-01) | 2026-03-27 |
| Q3 | lifecycleStage values ใน DB? | Lead(978), InProgress(132), New Lead(2), Customer(1), Walk-in(1) | 2026-03-27 |
| Q4 | GIN index raw SQL? | อนุมัติ | 2026-03-27 |
