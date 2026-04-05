# Zuri Platform — Site Map

**Version:** 1.0
**Date:** 2026-04-02
**Status:** Draft

---

## Route Tree

```
/  (root redirect → /login or /dashboard)
│
├── (auth)
│   ├── /login                      ← credentials + NextAuth
│   └── /register                   ← new tenant signup
│
└── (dashboard)  [requires auth + tenant middleware]
    │
    ├── /                           ← Home — KPI overview, quick links
    │
    ├── /inbox                      ← Unified Inbox (FB + LINE)
    │   ├── Left panel:   Conversation list + pipeline stage tabs
    │   ├── Center panel: Chat view + reply box
    │   └── Right panel:  Customer card + Quick Sale (ChatPOS)
    │
    ├── /crm                        ← Customer list + lead funnel
    │   └── /crm/[id]               ← Customer profile (identity, orders, activity timeline)
    │
    ├── /pos                        ← Point of Sale
    │   └── (modal: cart, payment, slip OCR)
    │
    ├── /marketing                  ← Meta Ads dashboard, ROAS
    │   ├── /marketing/campaigns    ← Campaign list + performance
    │   └── /marketing/daily-brief  ← AI Daily Sales Brief (DSB)
    │
    ├── /courses                    ← Course / package catalog
    │   └── /courses/[id]           ← Course detail, enrollment list
    │
    ├── /schedule                   ← Class schedule, QR attendance
    │
    ├── /kitchen                    ← Kitchen ops overview
    │   ├── /kitchen/recipes        ← Recipe management, BOM
    │   ├── /kitchen/stock          ← Stock levels, FEFO movements
    │   └── /kitchen/procurement    ← Purchase Orders, GRN, suppliers
    │
    ├── /tasks                      ← Task board
    │
    ├── /employees                  ← Staff list + HR
    │   └── /employees/[id]         ← Employee profile, schedule
    │
    └── /settings                   ← Tenant configuration
        ├── General                 (name, timezone, VAT)
        ├── Inbox → Pipeline        (custom pipeline stages CRUD)
        ├── Roles & Permissions     (RBAC)
        ├── Integrations            (FB token, LINE token, FlowAccount)
        ├── Billing                 (subscription, invoices)
        ├── Hardware                (printer, scanner, cash drawer)
        └── AI Add-on               (Gemini key, LINE Bot config)
```

---

## Summary

| Group | Pages | Notes |
|---|---|---|
| Auth | 2 | login, register |
| Dashboard core | 9 | home, inbox, crm, pos, marketing, courses, schedule, tasks, employees |
| Kitchen sub-pages | 3 | recipes, stock, procurement |
| Marketing sub-pages | 2 | campaigns, daily-brief |
| Detail pages | 3 | crm/[id], courses/[id], employees/[id] |
| Settings | 1 | single page, section tabs |
| **Total** | **20** | |

---

## Planned (not yet scaffolded)

| Route | Feature | Trigger |
|---|---|---|
| `/enrollment/[id]` | Enrollment detail + certificate download | FEAT-ENROLLMENT |
| `/accounting` | FlowAccount sync dashboard | FEAT-ACCOUNTING-PLATFORM add-on |
| `/admin` | Tenant management (OWNER/DEV only) | FEAT-MULTI-TENANT |

---

---

## Platform Surfaces

### Surface 1 — Web Desktop ✅
URL: `https://zuri.app`
ผู้ใช้: Staff, Owner, Manager — บริหารงานหน้าจอใหญ่

### Surface 2 — Web Mobile (PWA)
URL: `https://zuri.app` (เดิม + manifest.json)
ผู้ใช้: Staff, Owner — install บนมือถือ, push notification

```
/                ← Home (stat cards vertical)
/inbox           ← full-screen chat (swipe sidebar)
/crm             ← compact customer cards
/pos             ← numpad layout + camera slip
/tasks           ← card stack
```

### Surface 3 — LINE Mini App (Customer + Staff/Owner)
URL: `https://liff.line.me/{liffId}?tenantSlug=vschool`
ผู้ใช้: **ทุกคน** — จำแนก role อัตโนมัติจาก LINE ID

**Customer view:**
```
/liff/customer/courses          ← คอร์สทั้งหมด
/liff/customer/courses/[id]     ← รายละเอียด + ปุ่มสมัคร
/liff/customer/enrollment       ← คอร์สของฉัน + ตารางเรียน
/liff/customer/enrollment/[id]  ← class detail + certificate
/liff/customer/orders           ← ประวัติ order
/liff/customer/payment/[id]     ← QR PromptPay + slip upload
/liff/customer/profile          ← ข้อมูลส่วนตัว (LINE auto-fill)
```

**Staff/Owner view (RBAC):**
```
/liff/staff/home           ← Daily Brief + quick actions
/liff/staff/inbox          ← conversation list + reply
/liff/staff/inbox/[id]     ← chat view
/liff/staff/tasks          ← task list + complete
/liff/staff/crm            ← customer search
/liff/staff/crm/[id]       ← customer profile + stage
/liff/staff/pos            ← quick POS + camera slip
/liff/staff/procurement/po/[id]  ← approve/reject PO
/liff/staff/stock          ← stock levels
```

### Surface 4 — Native App (Expo / iOS + Android)
ผู้ใช้: Staff, Owner — push notification, QR camera

```
/(auth)/login
/(tabs)/inbox      ← Inbox + reply
/(tabs)/crm        ← Customer list + profile
/(tabs)/pos        ← Quick POS + camera slip
/(tabs)/tasks      ← Task board
/(tabs)/brief      ← Daily Sales Brief
```

---

## Related

- `docs/product/specs/` — feature specs per module
- `docs/product/specs/FEAT19-PLATFORM.md` — multi-surface platform strategy
- `docs/product/module-manifests/` — pages listed per module manifest
- `src/app/(dashboard)/` — staff web routes
- `src/app/(liff)/` — LINE Mini App routes (planned)
- `zuri-mobile/` — Expo native app (planned)
