# Decision Log

> สิ่งที่ตัดสินใจแล้ว — กลับมาอ่านได้เสมอ

## 2026-03-30

### DEC-008: Zuri ไม่ทำโมดูลบัญชีเอง
- **Decision:** Zuri จะไม่มี accounting module — ส่งข้อมูลออกให้โปรแกรมบัญชีที่นักบัญชีใช้อยู่แล้ว
- **Why:** นักบัญชีไม่เปลี่ยนโปรแกรม — อย่าแข่ง ให้ integrate แทน
- **Platforms:** FlowAccount (API auto) + Express via X-import (semi-auto) + PEAK/Sage Phase 3
- **File:** `product/specs/FEAT-ACCOUNTING-PLATFORM.md`

### DEC-009: Express ไม่มี REST API — ใช้ X-import แทน
- **Decision:** Express (ESG) ไม่มี public API — ใช้ Excel export → X-import เป็น bridge
- **Why:** Validated แล้วในชุมชน Thai developer/accountant ว่าใช้งานได้จริง
- **Research:** Express = DBF/FoxPro, 32-bit ODBC only, ไม่มี developer program
- **Alternative:** FlowAccount มี REST API พร้อมใช้

### ADR-057: POS Mobile Ordering — Static HTML + PHP
- **Decision:** QR order page ใช้ Static HTML + PHP host แยก (ไม่ใช่ Next.js)
- **Why:** Cold start Vercel ช้า, ต้นทุนต่ำกว่า, load <500ms
- **File:** `decisions/adrs/ADR-057-pos-mobile-ordering-architecture.md`

### ADR-058: Floor Plan Storage — Hybrid Relational + JSON
- **Decision:** `pos_tables`/`pos_zones` = relational (status/orders), `pos_floor_layouts` = JSONB blob (visual)
- **Why:** Query operational data เร็ว + layout editor flexible ไม่ต้อง migrate schema
- **File:** `decisions/adrs/ADR-058-floor-plan-storage-model.md`

### ADR-059: Loyalty Point Idempotency — order_id unique constraint
- **Decision:** `UNIQUE(order_id, type, tenant_id)` + `prisma.$transaction` + SELECT FOR UPDATE
- **Why:** กัน double-earn/double-redeem จาก retry, crash, network ช้า
- **File:** `decisions/adrs/ADR-059-loyalty-point-idempotency.md`

### FEAT-POS: Approved
- **Decision:** FEAT-POS.md APPROVED 2026-03-30
- **Scope:** 3 order types, QR ordering, floor plan, document system, loyalty via CRM
- **ของแถม:** tier/birthday/redeem → CRM, promotions → Marketing, bundles → POS

---

## 2026-03-29

### DEC-001: ลบ CrewAI ใช้ lightweight Python orchestrator
- **Context:** CrewAI เพิ่ม dependency หนัก, ไม่ flexible, Windows มีปัญหา
- **Decision:** เขียน orchestrator เอง ~400 LOC (pipeline.py + llm.py + state.py + gates.py)
- **Result:** vibecode v3.0 → ทำงานได้, PM agent สร้าง spec 3,722 chars ผ่าน Gemini Flash

### DEC-002: Rename vibecode → co-dev
- **Context:** vibecode ออกแบบเป็น standalone CLI แต่จริงๆ ต้องรันผ่าน Claude Code
- **Decision:** Rename เป็น co-dev (CO project + dev tool), เป็น extension ของ Claude Code
- **Result:** co-dev v3.1 — Claude Code เป็น orchestrator หลัก, Gemini ทำงานฟรี

### DEC-003: Claude Code = CTO + Tech Lead + Backend + Frontend
- **Context:** spawn claude CLI subprocess ซ้ำซ้อน + เสียเงิน + ไม่มี project context
- **Decision:** Claude Code ทำงาน 4 roles เอง, Gemini ทำ PM + QA + Doc Writer (ฟรี)
- **Result:** ลดต้นทุน, เพิ่มคุณภาพ (Claude Code มี full project context)

### DEC-004: co-dev commands — spec / code / test
- **Context:** เดิมมีแค่ `run --phase` ซึ่ง user ต้องรันเอง
- **Decision:** สร้าง 3 commands ง่ายๆ ที่ Claude Code เรียกเอง
  - `spec` → PM + Doc Writer (Gemini)
  - `code` → Backend + Frontend boilerplate (Gemini, no comments)
  - `test` → QA tests (Gemini)
- **Result:** User ไม่ต้องแตะ CMD, Claude Code จัดการทุกอย่าง

### DEC-005: Folder rename plan
- **Context:** E:\CO ไม่สื่อชื่อ product, E:\ZURI คือ codebase เดิม (messy)
- **Decision:**
  - E:\ZURI → E:\ZURI-LEGACY (เก็บไว้ migrate)
  - E:\CO → E:\zuri (project ใหม่)
- **Status:** PENDING — รอปิด app ที่เปิด E:\ZURI อยู่
- **Note:** Path ใน co-dev เป็น auto-resolve แล้ว ไม่ hardcode

### DEC-006: ชื่อ Zuri — ที่มาและความหมาย
- **Context:** ตั้งชื่อยังไงดี? scope มี CRM+ERP+Ads+AI+Analytics
- **Decision:** ใช้ "Zuri" เฉยๆ ไม่ต้อง suffix (-BI, -CRM, -Platform)
  - Industry เรียก product ลักษณะนี้ว่า "Platform" (เหมือน Toast = Restaurant Platform)
  - ชื่อ product ดีเพราะจำได้ ไม่ใช่เพราะมีความหมาย
- **Origin:** ซูริ จากหนังอินดี้ไทย "Mary Is Happy, Mary Is Happy" (2013, นวพล ธำรงรัตนฤทธิ์)
  - ตัวละครที่อเนกประสงค์ คอยซัพพอร์ตแมรี่ตลอดเวลา
  - "อยากมีซูริเป็นของตัวเอง" → Zuri Platform

### DEC-007: docs/ = Obsidian vault
- **Context:** ต้องการดู docs เป็นภาพ, graph view, linked notes
- **Decision:** E:\CO\docs\ เป็น Obsidian vault โดยตรง
- **Config:** .obsidian/ with graph color groups per folder
- **Folders:** product/, architecture/, gotchas/, devtools/, decisions/

---

#decisions #log
