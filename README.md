# Zuri — AI Business Platform

> **"The AI Business Platform built for Thailand"**
> ซูริ — ผู้ช่วย AI ที่รู้จักธุรกิจไทยดีที่สุด

Zuri รวม **Inbox, CRM, POS และ Operations** ไว้ในที่เดียว พร้อม AI ที่เข้าใจ LINE, สลิปพร้อมเพย์ และบริบทธุรกิจไทย

---

## Core Modules

| Module | ทำอะไร |
|---|---|
| **Unified Inbox** | รวม Facebook + LINE หน้าเดียว พร้อม pipeline stage และ ChatPOS |
| **CRM** | จัดการลูกค้า, lifecycle tracking, activity timeline |
| **POS** | ขายได้ใน chat หรือหน้า POS เต็มรูปแบบ, รับสลิป OCR |
| **Marketing Analytics** | ROAS จริงจาก Meta Ads, เชื่อมกับยอดขายจริง |
| **Kitchen Ops** | Recipe BOM, stock FEFO, procurement PO lifecycle |
| **Enrollment** | จัดการคอร์ส, ตารางเรียน, attendance QR |
| **Daily Sales Brief** | AI สรุปยอดขาย + อินไซต์ ส่ง LINE ทุกเช้า |
| **Tasks** | Task board พร้อม assign และ notify |

## AI Add-ons

| Add-on | ทำอะไร |
|---|---|
| **AI Assistant** | LINE Bot 24/7, NL2SQL, Slip OCR, Group Monitor |
| **Accounting** | FlowAccount auto-sync, Express X-import |

---

## Tech Stack

```
Framework:  Next.js 14 (App Router) — Vercel serverless
Language:   JavaScript (JSX)
Database:   PostgreSQL via Supabase + Prisma ORM
Cache:      Upstash Redis
Queue:      Upstash QStash (cron workers)
Realtime:   Pusher Channels
Auth:       NextAuth.js v4
AI:         Gemini 2.0 Flash (text + vision)
Styling:    Tailwind CSS + Framer Motion + Recharts
```

---

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/your-org/zuri.git
cd zuri
npm install

# 2. Environment
cp .env.example .env.local
# Fill in all values — see docs/DEV_SETUP.md

# 3. Database
npm run db:generate
npm run db:push

# 4. Run
npm run dev
# → http://localhost:3000
```

Full setup guide: [`docs/DEV_SETUP.md`](docs/DEV_SETUP.md)

---

## Documentation

| Doc | Path |
|---|---|
| Product Requirements | `docs/product/PRD.md` |
| Roadmap | `docs/product/ROADMAP.md` |
| Feature Specs | `docs/product/specs/FEAT-*.md` |
| API Reference | `docs/product/API_REFERENCE.md` |
| Site Map | `docs/product/site_map.md` |
| UI Components | `docs/product/UI_COMPONENT_INVENTORY.md` |
| Architecture ADRs | `docs/decisions/adrs/` |
| Webhook Events | `docs/architecture/WEBHOOK_EVENT_CATALOG.md` |
| Dev Setup | `docs/DEV_SETUP.md` |

---

## Project Structure

```
src/
├── app/           # Next.js App Router (pages + 45 API routes)
├── components/    # 32 UI components
├── lib/           # repositories, AI, cache, queue, auth
└── modules/       # core / shared / industry plugins
prisma/            # schema.prisma (36 models, single source of truth)
docs/              # Obsidian vault — all product & architecture docs
```

---

*Built with ❤️ for Thai SMEs*
