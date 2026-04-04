# CHANGELOG

**LATEST:** CL-20260405-002 | v2.2.2 | 2026-04-05

---

## 📋 Index (older entries)

| ID | Name | Version | Date | Severity | Tags |
|---|---|---|---|---|---|
| CL-20260404-001 | Automated changelog system | v2.7.0 | 2026-04-04 | MINOR | #devtool #automation |

---

## 📝 Recent (last 5 — full content)

### [CL-20260405-002] v2.2.2 — ADR-069: AI Context Layer (NotebookLM)

**Version:** v2.2.2
**Date:** 2026-04-05
**Severity:** MINOR
**Tags:** adr,ai,notebooklm,architecture

## Summary
ADR-069: AI Context Layer (NotebookLM) - notebook architecture approved. 6 per-tenant notebooks + zuri-platform notebook for co-dev agents.

## Changes
- Create ADR-069: NotebookLM as AI context layer for Zuri agents
- Define 6 per-tenant notebooks: chat-intelligence, pdad-framework, product-catalog, sales-kpi, ads-intelligence, brand-content
- Define zuri-platform notebook for co-dev agents (PM/CTO/Doc Writer)
- Document data sources, update cadence, and query pattern per notebook
- Define fallback: NLM timeout → direct Gemini injection
- Update HOME.md ADR index: ADR-069 status Pending → Done

## Files Modified
- docs/decisions/adrs/ADR-069-ai-context-layer-notebooklm.md
- docs/HOME.md

---

### [CL-20260405-001] v2.2.1 — core-auth: NextAuth login, RBAC helpers, legacy role mapping

**Version:** v2.2.1
**Date:** 2026-04-05
**Severity:** MINOR
**Tags:** auth,rbac,middleware

## Summary
core-auth: wire NextAuth login form, add RBAC helpers, normalize legacy 12 roles to 6 persona roles, improve middleware.

## Changes
- Wire login form to signIn() with error handling, loading state, show/hide password
- Add requireRole() and withAuth() RBAC HOC to src/lib/auth.js
- Add normalizeRole() to map legacy 12 roles to 6 persona roles per ADR-068
- Fix middleware: PUBLIC_PATHS guard, callbackUrl redirect, default tenantId injection
- NextAuth authorize() normalizes employee roles before JWT storage

## Files Modified
- src/app/(auth)/login/page.jsx
- src/lib/auth.js
- src/app/api/auth/[...nextauth]/route.js
- src/middleware.js

---

### [CL-20260404-004] v0.9.0 — Migrate JS orchestrator tools to Python, complete .dev tooling cleanup
