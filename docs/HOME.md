# Zuri Platform

> **AI Business Platform for Thai service SMEs** — starting with culinary schools
> Version: v3.0 | Phase: Active Development (M1–M2) | DOC TO CODE workflow

---

## Navigation

| ต้องการ | ดูที่ |
|---|---|
| ภาพรวม codebase ทั้งหมด | [[PROJECT_MAP]] |
| URL map + roles ทุกหน้า | [[product/SITEMAP]] |
| Feature spec ก่อน implement | [[product/specs/FEAT*]] |
| Architecture decision | [[decisions/adrs/ADR-*]] |
| DB schema | `prisma/schema.prisma` |
| Incident / gotcha rules | [[gotchas/*]] |
| Milestone / roadmap | [[product/ROADMAP]] |
| วิธีทำงานข้ามแพลตฟอร์ม | [[guide/co-dev-workflow]] |

---

## Product

### Core Documents
- [[PROJECT_MAP|Project Map]] — Codebase navigation (repo structure, domain map, infra)
- [[product/PRD|PRD v2.2]] — Product Requirements Document
- [[product/ROADMAP|Roadmap v2.2.0]] — Milestones M1–M7
- [[product/SITEMAP|Sitemap v1.1.0]] — URL map + roles (45 pages, 12 domains)

### Feature Specs (19 — all APPROVED)

| # | Module | Spec | Type |
|---|---|---|---|
| 01 | Multi-Tenant | [[product/specs/FEAT01-MULTI-TENANT\|FEAT01]] | Core |
| 02 | Customer Profile | [[product/specs/FEAT02-PROFILE\|FEAT02]] | Core |
| 03 | Billing | [[product/specs/FEAT03-BILLING\|FEAT03]] | Core |
| 04 | Unified Inbox | [[product/specs/FEAT04-INBOX\|FEAT04]] | Core |
| 05 | CRM | [[product/specs/FEAT05-CRM\|FEAT05]] | Core |
| 06 | POS | [[product/specs/FEAT06-POS\|FEAT06]] | Core |
| 07 | Enrollment | [[product/specs/FEAT07-ENROLLMENT\|FEAT07]] | Core |
| 08 | Kitchen Ops | [[product/specs/FEAT08-KITCHEN\|FEAT08]] | Core |
| 09 | Marketing / Ads Analytics | [[product/specs/FEAT09-MARKETING\|FEAT09]] | Core |
| 10 | Daily Sales Brief (AI) | [[product/specs/FEAT10-DSB\|FEAT10]] | Core |
| 11 | AI Assistant (Add-on) | [[product/specs/FEAT11-AI-ASSISTANT\|FEAT11]] | Add-on |
| 12 | LINE Agent | [[product/specs/FEAT12-LINE-AGENT\|FEAT12]] | Add-on |
| 13 | AI Agent (Inbox) | [[product/specs/FEAT13-AGENT\|FEAT13]] | Core |
| 14 | CRM AI Enrichment | [[product/specs/FEAT14-CRM-AI\|FEAT14]] | Core |
| 15 | Marketing AI Optimizer | [[product/specs/FEAT15-MARKETING-AI\|FEAT15]] | Core |
| 16 | Campaign Management | [[product/specs/FEAT16-CAMPAIGN\|FEAT16]] | Core |
| 17 | Accounting Platform | [[product/specs/FEAT17-ACCOUNTING-PLATFORM\|FEAT17]] | Add-on |
| 18 | Express X-Import | [[product/specs/FEAT18-EXPRESS-INTEGRATION\|FEAT18]] | Add-on |
| 19 | Platform Admin | [[product/specs/FEAT19-PLATFORM\|FEAT19]] | Core |

---

## Architecture

### Overview
- [[architecture/tech-spec|Tech Spec]] — Stack diagram, API design, RBAC, data flows, integrations
- [[architecture/database-erd/full-schema|Database ERD]] — Full schema + ERD
- [[architecture/WEBHOOK_EVENT_CATALOG|Webhook & Event Catalog]] — Inbound webhooks, Pusher events, QStash jobs

### Data Flows (11 modules)
[[architecture/data-flows/crm|CRM]] · [[architecture/data-flows/inbox|Inbox]] · [[architecture/data-flows/pos|POS]] · [[architecture/data-flows/marketing|Marketing]] · [[architecture/data-flows/dsb|DSB]] · [[architecture/data-flows/enrollment|Enrollment]] · [[architecture/data-flows/kitchen|Kitchen]] · [[architecture/data-flows/tasks|Tasks]] · [[architecture/data-flows/auth|Auth]] · [[architecture/data-flows/ai|AI]] · [[architecture/data-flows/multi-tenant|Multi-Tenant]]

---

## Decisions

- [[decisions/log|Decision Log]] — All architecture + product decisions

### ADRs (Active)
| ADR | Title | Status |
|---|---|---|
| [[decisions/adrs/ADR-057-pos-mobile-ordering-architecture\|ADR-057]] | POS Mobile Ordering Architecture | ✅ Done |
| [[decisions/adrs/ADR-058-floor-plan-storage-model\|ADR-058]] | Floor Plan Storage Model | ✅ Done |
| [[decisions/adrs/ADR-059-loyalty-point-idempotency\|ADR-059]] | Loyalty Point Idempotency | ✅ Done |
| [[decisions/adrs/ADR-060-modular-architecture\|ADR-060]] | Modular Architecture (modules/) | ✅ Done |
| [[decisions/adrs/ADR-061-split-prisma-schema\|ADR-061]] | Split Prisma Schema | ✅ Done |
| [[decisions/adrs/ADR-062-obsidian-as-ssot\|ADR-062]] | Obsidian as Docs SSOT | ✅ Done |
| [[decisions/adrs/ADR-063-dev-tools-isolation\|ADR-063]] | Dev Tools Isolation (.dev/) | ✅ Done |
| [[decisions/adrs/ADR-064-doc-to-code-workflow\|ADR-064]] | DOC TO CODE Workflow | ✅ Done |
| [[decisions/adrs/ADR-065-industry-plugin-system\|ADR-065]] | Industry Plugin System | ✅ Done |
| [[decisions/adrs/ADR-066-component-size-limit\|ADR-066]] | Component Size Limit | ✅ Done |
| [[decisions/adrs/ADR-067-changelog-system-v2\|ADR-067]] | Changelog System v2 | ✅ Done |
| [[decisions/adrs/ADR-068-persona-based-rbac\|ADR-068]] | Persona-Based RBAC (6 roles) | ✅ Done |
| ADR-069 | NLM Notebook Architecture | 🔲 Pending |

---

## Gotchas

| Area | Doc |
|---|---|
| Meta API | [[gotchas/meta-api\|meta-api]] |
| Webhook / Serverless | [[gotchas/webhook-serverless\|webhook-serverless]] |
| Database / Identity | [[gotchas/database-identity\|database-identity]] |
| Multi-Tenant | [[gotchas/multi-tenant\|multi-tenant]] |
| AI Agent | [[gotchas/ai-agent\|ai-agent]] |
| Marketing Attribution | [[gotchas/marketing-attribution\|marketing-attribution]] |
| Dev Process | [[gotchas/dev-process\|dev-process]] |
| Next.js 14 / Vercel Build | [[gotchas/nextjs14-vercel-build-gotchas\|nextjs14-vercel-build-gotchas]] |
| Dev Workflow (G-DEV-05) | [[gotchas/G-DEV-05\|G-DEV-05]] |
| Webhook Rules (G-WH-02) | [[gotchas/G-WH-02\|G-WH-02]] |
| Build Incident 2026-04-03 | [[gotchas/INCIDENT-2026-04-03-BUILD-FAILURE\|INCIDENT-2026-04-03]] |

---

## Guides

- [[guide/DEV_SETUP|Dev Setup]] — Local dev environment
- [[CHANGELOG_SYSTEM|Changelog System]] — How to write changelogs
- [[devlog/README|DevLog]] — Session continuity log (agent เขียนท้าย session)

---

#zuri #home
