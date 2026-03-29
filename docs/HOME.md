# Zuri Platform

> Vertical SaaS for culinary schools and food businesses in Thailand
> Version: v2.3 | Phase 1: Feature Specs (DOC TO CODE)

---

## Product

### Core Documents
- [[product/PRD|PRD v2.2]] — Product Requirements Document
- [[product/ROADMAP|Roadmap v2.1]] — Milestones M1-M7
- [[zuri/RESTRUCTURE_PLAN|Restructure Plan]] — 8-phase modular migration

### Feature Specs (15)
| Module | Spec | Status |
|---|---|---|
| CRM | [[product/specs/FEAT-CRM\|FEAT-CRM]] | APPROVED |
| Unified Inbox | [[product/specs/FEAT-INBOX\|FEAT-INBOX]] | APPROVED |
| POS | [[product/specs/FEAT-POS\|FEAT-POS]] | APPROVED |
| Billing | [[product/specs/FEAT-BILLING\|FEAT-BILLING]] | APPROVED |
| Customer Profile | [[product/specs/FEAT-PROFILE\|FEAT-PROFILE]] | APPROVED |
| Marketing/Ads | [[product/specs/FEAT-MARKETING\|FEAT-MARKETING]] | APPROVED |
| Daily Sales Brief | [[product/specs/FEAT-DSB\|FEAT-DSB]] | APPROVED |
| Enrollment | [[product/specs/FEAT-ENROLLMENT\|FEAT-ENROLLMENT]] | APPROVED |
| Kitchen Ops | [[product/specs/FEAT-KITCHEN\|FEAT-KITCHEN]] | APPROVED |
| AI Assistant (Inbox) | [[product/specs/FEAT-AGENT\|FEAT-AGENT]] | APPROVED |
| AI Assistant (Add-on) | [[product/specs/FEAT-AI-ASSISTANT\|FEAT-AI-ASSISTANT]] | APPROVED |
| LINE Agent | [[product/specs/FEAT-LINE-AGENT\|FEAT-LINE-AGENT]] | APPROVED |
| Multi-Tenant | [[product/specs/FEAT-MULTI-TENANT\|FEAT-MULTI-TENANT]] | APPROVED |
| Accounting Platform | [[product/specs/FEAT-ACCOUNTING-PLATFORM\|FEAT-ACCOUNTING-PLATFORM]] | APPROVED |
| Express Integration | [[product/specs/FEAT-EXPRESS-INTEGRATION\|FEAT-EXPRESS-INTEGRATION]] | DRAFT |

### Module Manifests (13)
- `product/module-manifests/*.yaml` — ownership, dependencies, public API per module

---

## Architecture

### Overview
- [[architecture/system-overview|System Overview]] — Tech stack diagram
- [[architecture/tech-spec|Tech Spec]] — Stack, API design, RBAC, integrations
- [[architecture/database-erd/full-schema|Database ERD]] — Schema + migration plan

### Data Flows (11)
| Module | Flow |
|---|---|
| CRM | [[architecture/data-flows/crm\|crm]] |
| Inbox | [[architecture/data-flows/inbox\|inbox]] |
| POS | [[architecture/data-flows/pos\|pos]] |
| Marketing | [[architecture/data-flows/marketing\|marketing]] |
| DSB | [[architecture/data-flows/dsb\|dsb]] |
| Enrollment | [[architecture/data-flows/enrollment\|enrollment]] |
| Kitchen | [[architecture/data-flows/kitchen\|kitchen]] |
| Tasks | [[architecture/data-flows/tasks\|tasks]] |
| Auth | [[architecture/data-flows/auth\|auth]] |
| AI | [[architecture/data-flows/ai\|ai]] |
| Multi-Tenant | [[architecture/data-flows/multi-tenant\|multi-tenant]] |

---

## Decisions

- [[decisions/log|Decision Log]] — All architecture + product decisions
- `decisions/adrs/` — ADR-024 to ADR-056 (from ZURI-v1)

---

## Gotchas (30 rules)

| Area | Doc |
|---|---|
| Meta API | [[gotchas/meta-api\|meta-api]] |
| Webhook/Serverless | [[gotchas/webhook-serverless\|webhook-serverless]] |
| Database/Identity | [[gotchas/database-identity\|database-identity]] |
| Multi-Tenant | [[gotchas/multi-tenant\|multi-tenant]] |
| AI Agent | [[gotchas/ai-agent\|ai-agent]] |
| Marketing Attribution | [[gotchas/marketing-attribution\|marketing-attribution]] |
| Dev Process | [[gotchas/dev-process\|dev-process]] |

---

## Guides

- [[guide/getting-started|Getting Started]]
- [[guide/deployment|Deployment]]
- [[guide/mcp-guide|MCP Guide]]
- [[guide/testing|Testing]]

---

#zuri #home
