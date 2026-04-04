# CHANGELOG

**LATEST:** CL-20260405-001 | v2.2.1 | 2026-04-05

---

## 📋 Index (older entries)

| ID | Name | Version | Date | Severity | Tags |
|---|---|---|---|---|---|
| CL-20260404-008 | Finalized Phase A documentation | v0.9.3 | 2026-04-04 | PATCH | #docs #handoff #complete |

---

## 📝 Recent (last 5 — full content)

### [CL-20260405-001] v2.2.1 — core-auth: wire NextAuth login, RBAC helpers, legacy role mapping, improved middleware

# [CL-20260405-001] — core-auth: wire NextAuth login, RBAC helpers, legacy role mapping, improved middleware

**Version:** v2.2.1
**Date:** 2026-04-05
**Severity:** MINOR
**Tags:** auth,rbac,middleware
**Commits:** (pending)
**Author:** Claude

---

## Summary
core-auth: wire NextAuth login, RBAC helpers, legacy role mapping, improved middleware

## Changes
Wire login form to signIn() with error handling and loading state|Add requireRole() and withAuth() RBAC HOC to src/lib/auth.js|Add normalizeRole() to map legacy 12 roles to 6 persona roles per ADR-068|Fix middleware: PUBLIC_PATHS guard, callbackUrl redirect, default tenantId injection|NextAuth authorize() normalizes employee roles before JWT storage


## Files Modified
- src/app/(auth)/login/page.jsx|src/lib/auth.js|src/app/api/auth/[...nextauth]/route.js|src/middleware.js

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests

### [CL-20260404-013] v0.12.0 — Plan UI Phase 1 to 6 Implementation based on SITEMAP & Mockups

# [CL-20260404-013] — Plan UI Phase 1 to 6 Implementation based on SITEMAP & Mockups

**Version:** v0.12.0
**Date:** 2026-04-05
**Severity:** MINOR
**Tags:** #ui #design #planning
**Commits:** (pending)
**Author:** Antigravity

---

## Summary
Created an implementation plan to map out the UI defined in `SITEMAP.md` using the Royal Ayutthaya "Modern Sovereign" Premium Design System.

## Changes
- Created `implementation_plan.md` to phase out the UI work (Phases 1 through 6).
- Awaiting user approval to proceed with Phase 1 (Foundation).

## Verification
- Reviewed design resources and `SITEMAP.md`.

### [CL-20260404-012] v0.11.0 — Start Phase C — API Tool Calling for Tier 1 Agents (CODEV-CTX)

# [CL-20260404-012] — Start Phase C — API Tool Calling for Tier 1 Agents (CODEV-CTX)

**Version:** v0.11.0
**Date:** 2026-04-04
**Severity:** MINOR
**Tags:** #tooling #tools #sdk #architecture
**Commits:** (pending)
**Author:** Claude

---

## Summary
Start Phase C — API Tool Calling for Tier 1 Agents (CODEV-CTX)

## Changes
Initiated Phase C of the co-dev context injection system. Transitioning CTO and Tech Lead agents to official SDKs (Gemini/Anthropic) to support structured tool-calling. Defining read-only discovery tools for schema and documentation.


## Files Modified
- docs/handoff/IMP-20260404-codev-context-injection.md core/llm.py core/pipeline.py core/tools.py

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests

### [CL-20260404-011] v0.10.2 — Phase B Refinement & Schema Stubs (CODEV-CTX)

# [CL-20260404-011] — Phase B Refinement & Schema Stubs (CODEV-CTX)

**Version:** v0.10.2
**Date:** 2026-04-04
**Severity:** PATCH
**Tags:** #tooling #rag #schema #optimization
**Commits:** (pending)
**Author:** Claude

---

## Summary
Phase B Refinement & Schema Stubs (CODEV-CTX)

## Changes
Implemented Hybrid Search (FTS5 + Vector) and domain filtering in ContextRetriever. Updated Indexer to support domain mapping. Added missing reference stubs to pos.md, enrollment.md, and marketing.md for cross-domain visibility. Fixed DailyBrief model truncation.


## Files Modified
- core/retriever.py core/indexer.py docs/schema-slices/*.md

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests

### [CL-20260404-010] v0.10.1 — Complete Phase B — Pre-call RAG (CODEV-CTX)

# [CL-20260404-010] — Complete Phase B — Pre-call RAG (CODEV-CTX)

**Version:** v0.10.1
**Date:** 2026-04-04
**Severity:** MINOR
**Tags:** #tooling #rag #embeddings #optimization #complete
**Commits:** (pending)
**Author:** Claude

---

## Summary
Complete Phase B — Pre-call RAG (CODEV-CTX)

## Changes
Implemented semantic retrieval system using SQLite + sqlite-vec and Gemini Embeddings API. Built indexing engine with domain-specific chunking for schema slices, gotchas, and specs. Integrated RAG lookup in pipeline.py to automatically inject relevant context chunks into agent prompts.


## Files Modified
- core/retriever.py core/indexer.py cli.py pipeline.py docs/handoff/IMP-20260404-codev-context-injection.md

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests

### [CL-20260404-009] v0.10.0 — Start Phase B — Pre-call RAG (CODEV-CTX)

# [CL-20260404-009] — Start Phase B — Pre-call RAG (CODEV-CTX)

**Version:** v0.10.0
**Date:** 2026-04-04
**Severity:** MINOR
**Tags:** #tooling #context #rag #embeddings
**Commits:** (pending)
**Author:** Claude

---

## Summary
Start Phase B — Pre-call RAG (CODEV-CTX)

## Changes
Initiated Phase B of the co-dev context injection system. Implementing semantic retrieval with sqlite-vec and sentence-transformers to replace fixed context_files with relevant document chunks.


## Files Modified
- docs/handoff/IMP-20260404-codev-context-injection.md .dev/co-dev/core/retriever.py .dev/co-dev/core/indexer.py

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests
