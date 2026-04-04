# Zuri Module Dependencies

> Updated: 2026-04-04
> Source: สร้างจาก feature specs FEAT04–FEAT11 + CLAUDE.md

## Dependency Map

```mermaid
graph TD
    %% Shared Infrastructure
    AUTH[Auth / Multi-Tenant]
    PRISMA[Prisma + PostgreSQL]
    REDIS[Upstash Redis]
    PUSHER[Pusher Realtime]
    GEMINI[Gemini 2.0 Flash]
    QSTASH[QStash Workers]

    %% Core Modules
    INBOX[FEAT04 Unified Inbox]
    CRM[FEAT05 CRM]
    POS[FEAT06 POS]
    ENROLL[FEAT07 Enrollment]
    KITCHEN[FEAT08 Kitchen Ops]
    MKTG[FEAT09 Marketing]
    DSB[FEAT10 Daily Sales Brief]
    AI[FEAT11 AI Assistant]

    %% All modules depend on shared infra
    INBOX --> AUTH
    CRM --> AUTH
    POS --> AUTH
    ENROLL --> AUTH
    KITCHEN --> AUTH
    MKTG --> AUTH
    DSB --> AUTH
    AI --> AUTH

    AUTH --> PRISMA
    INBOX --> REDIS
    CRM --> REDIS
    POS --> REDIS
    DSB --> REDIS

    %% Cross-module dependencies
    INBOX -->|customer identity| CRM
    INBOX -->|firstTouchAdId| MKTG
    INBOX -->|AI compose reply| AI

    POS -->|customerId lookup| CRM
    POS -->|order placed trigger| KITCHEN
    POS -->|revenue data| MKTG
    POS -->|sales data| DSB

    ENROLL -->|customerId| CRM
    ENROLL -->|create order| POS
    ENROLL -->|ingredient usage| KITCHEN

    KITCHEN -->|stock deduction| PRISMA
    KITCHEN -->|purchase request| QSTASH

    MKTG -->|ad sync| QSTASH
    MKTG -->|ROAS attribution| POS

    DSB -->|NL2SQL query| PRISMA
    DSB -->|AI summary| GEMINI
    DSB -->|inbox stats| INBOX
    DSB -->|sales stats| POS

    AI -->|customer profile| CRM
    AI -->|slip OCR| GEMINI
    AI -->|LINE group| INBOX

    INBOX --> PUSHER
    CRM --> PUSHER

    %% Styling
    classDef infra fill:#374151,stroke:#6B7280,color:#F9FAFB
    classDef module fill:#065F46,stroke:#059669,color:#F9FAFB
    classDef queue fill:#1E3A5F,stroke:#3B82F6,color:#F9FAFB

    class AUTH,PRISMA,REDIS,PUSHER,GEMINI infra
    class INBOX,CRM,POS,ENROLL,KITCHEN,MKTG,DSB,AI module
    class QSTASH queue
```

## Cross-Module Dependency Summary

| Module | Depends On | Depended By |
|--------|-----------|-------------|
| **FEAT04 Inbox** | CRM, Marketing, AI | DSB, AI |
| **FEAT05 CRM** | — | Inbox, POS, Enrollment, AI, DSB |
| **FEAT06 POS** | CRM | Enrollment, Kitchen, Marketing, DSB |
| **FEAT07 Enrollment** | CRM, POS, Kitchen | — |
| **FEAT08 Kitchen** | POS | Enrollment |
| **FEAT09 Marketing** | Inbox, POS, QStash | — |
| **FEAT10 DSB** | Inbox, POS, Prisma, Gemini | — |
| **FEAT11 AI** | CRM, Inbox, Gemini | Inbox |

## Key Dependency Rules

- **CRM เป็น central hub** — ทุก module ที่เกี่ยวกับ customer ต้องผ่าน CRM
- **POS เป็น revenue source** — Marketing (ROAS) และ DSB (sales stats) ดึงข้อมูลจาก POS
- **Enrollment ต้องสร้าง POS order ก่อน** — ลูกค้าต้องชำระเงินผ่าน POS ก่อน enrollment จะ activate
- **Kitchen เป็น passive consumer** — รับ trigger จาก POS และ Enrollment เท่านั้น ไม่มีใคร depend on Kitchen
- **Shared infra (Auth, Prisma, Redis)** — ทุก module ต้องผ่าน Auth และ tenantId

## PNG Export

ไฟล์ภาพ: `module-dependencies-diagram.png` (root)
