# Multi-Tenant Gotchas

> จาก: ADR-056, PRD.md

---

## G-MT-01: Missing tenantId = cross-tenant data leak 🔴

**เกิดอะไร (potential):** ถ้า repo query ไม่ใส่ `WHERE tenantId = ?` → ลูกค้า tenant A เห็นข้อมูล tenant B

**ป้องกัน:**
- ทุก repo function ต้องรับ `tenantId` เป็น param แรก
- Code review: ทุก findMany/findFirst ต้องมี tenantId ใน where clause
- Test: สร้าง 2 tenants → verify ไม่เห็นข้อมูลข้าม tenant

**ADR อ้างอิง:** ADR-056

---

## G-MT-02: JWT session ไม่มี tenantId

**เกิดอะไร:** Employee ที่ login ก่อน multi-tenant migration → session ไม่มี tenantId

**ป้องกัน:**
- Middleware default: ถ้าไม่มี tenantId → ใช้ V School UUID
- Force re-login หลัง deploy multi-tenant (เปลี่ยน NEXTAUTH_SECRET)
- Session callback ต้อง inject tenantId เสมอ

**ADR อ้างอิง:** ADR-056

---

## G-MT-03: Per-tenant config ยังไม่มี

**สถานะ:** Phase MT-2 (ยังไม่ทำ)

**ต้องทำ:**
- แต่ละ tenant มี LINE OA, FB Page, QStash topic แยก
- Token storage encrypted ใน tenants table
- Per-tenant branding (logo, primary color)

**ระวัง:**
- ตอนนี้ทุก tenant ใช้ env vars เดียวกัน (V School)
- ห้าม onboard tenant ใหม่จนกว่า MT-2 เสร็จ

**ADR อ้างอิง:** ADR-056 (Follow-up)

---

## G-MT-04: Subdomain routing

**Target:** `{slug}.zuri.app` → resolve tenantId

**ยังไม่ทำ:**
- DNS wildcard `*.zuri.app` → Vercel
- Middleware parse subdomain
- ตอนนี้: default `vschool` ทุก request

**ADR อ้างอิง:** ADR-056
