# Marketing & Attribution Gotchas

> จาก: ADR-024, ADR-030, ADR-039, INC-20260218-ATTR

---

## G-MKT-01: Attribution ต้อง match product

**เกิดอะไร:** Shabu campaign reported ฿34K revenue แต่ลูกค้าซื้อ Ramen Course ไม่ใช่ Shabu

**กฎ:**
```
Direct Revenue   = ลูกค้าซื้อสินค้าที่โฆษณา (ad_target matches purchased_product)
Cross-Sell Revenue = ลูกค้าเข้ามาจากโฆษณา A แต่ซื้อสินค้า B
Halo Revenue     = รวมทั้ง direct + cross-sell
```
- Dashboard ต้องแยก Direct vs Cross-Sell ชัดเจน
- ROAS ที่ report ต้องระบุว่าเป็น Direct หรือ Halo

**ADR อ้างอิง:** INC-20260218-ATTR

---

## G-MKT-02: Revenue channel classification

**กฎ:**
```
Order.conversationId = null    → Store Revenue (walk-in)
Order.conversationId = UUID    → Ads Revenue (จาก chat)
```
- ระวัง: Walk-in ที่สร้าง order จาก Inbox → มี conversationId → จัดเป็น Ads Revenue (ผิด)
- ต้อง train staff: walk-in ใช้ Full POS (/pos) ไม่ใช่ Quick Sale (Inbox)

**ADR อ้างอิง:** ADR-030

---

## G-MKT-03: firstTouchAdId immutable

**กฎ:**
- `Conversation.firstTouchAdId` set ครั้งเดียวตอน create → ห้ามแก้
- ใช้สำหรับ ROAS attribution (trace: Ad → Conversation → Order → Transaction)
- ข้อมูลก่อน Phase 26 (Mar 2026) อาจไม่มี firstTouchAdId

**ADR อ้างอิง:** ADR-039

---

## G-MKT-04: Slip OCR confidence threshold

**กฎ:**
```
confidence ≥ 0.80 → auto-create PENDING Transaction
confidence < 0.80 → log warning, manual add required
```
- Gemini Vision อาจ fail กับรูปเบลอ/มืด
- Employee ต้อง verify ทุก slip (PENDING → VERIFIED)
- ROAS คำนวณจาก `slipStatus = VERIFIED` เท่านั้น

**ADR อ้างอิง:** ADR-039

---

## G-MKT-05: Meta checksum tolerance

**กฎ:**
- Sum(Ads.spend) อาจ ≠ Campaign.spend จาก Meta (rounding)
- ยอมรับ tolerance ±1%
- Log mismatch ที่เกิน 1% → review

**ADR อ้างอิง:** ADR-024
