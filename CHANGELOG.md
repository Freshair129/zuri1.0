# CHANGELOG

**LATEST:** CL-20260404-004 | v0.9.0 | 2026-04-04

---

## 📋 Index (older entries)

| ID | Name | Version | Date | Severity | Tags |
|---|---|---|---|---|---|


---

## 📝 Recent (last 5 — full content)

### [CL-20260404-004] v0.9.0 — Migrate JS orchestrator tools to Python, complete .dev tooling cleanup

# [CL-20260404-004] — Migrate JS orchestrator tools to Python, complete .dev tooling cleanup

**Version:** v0.9.0
**Date:** 2026-04-04
**Severity:** PATCH
**Tags:** tooling,python,cleanup
**Commits:** (pending)
**Author:** Claude

---

## Summary
Migrate JS orchestrator tools to Python, complete .dev tooling cleanup

## Changes
Migrate sync-check.js and verify-flow.py to Python scripts; move .dev/orchestrator/templates/ to .dev/templates/; delete .dev/orchestrator/ entirely; add migrator.md prompt; fix Python 3.10 f-string bug in changelog.py; update CLAUDE.md Scripts section with all 6 Python commands


## Files Modified
- scripts/sync-check.py scripts/verify-flow.py scripts/changelog.py scripts/new-adr.py scripts/new-feature.py CLAUDE.md .dev/co-dev/config/prompts/migrator.md

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests

### [CL-20260404-003] v3.0.1 — Consolidate agent tooling to Python + merge AGENT_PROTOCOL into CLAUDE.md

# [CL-20260404-003] — Consolidate agent tooling to Python + merge AGENT_PROTOCOL into CLAUDE.md

**Version:** v3.0.1
**Date:** 2026-04-04
**Severity:** PATCH
**Tags:** #tooling #docs
**Commits:** (pending)
**Author:** Claude

---

## Summary
Consolidate agent tooling to Python + merge AGENT_PROTOCOL into CLAUDE.md

## Changes
Merged AGENT_PROTOCOL.md unique sections into CLAUDE.md; Created new-adr.py, new-feature.py, pre-commit.py; Removed orchestrator changelog.js


## Files Modified
- CLAUDE.md scripts/new-adr.py scripts/new-feature.py scripts/pre-commit.py

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests

### [CL-20260404-002] v2.7.1 — Fix changelog automation logic

# [CL-20260404-002] — Fix changelog automation logic

**Version:** v2.7.1
**Date:** 2026-04-04
**Severity:** PATCH
**Tags:** #bugfix #automation
**Commits:** (pending)
**Author:** Claude

---

## Summary
Fix changelog automation logic

## Changes
Corrected Index row parsing and extra separators.

## Files Modified
- scripts/changelog.py

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests

### [CL-20260404-001] v2.7.0 — Automated changelog system

# [CL-20260404-001] — Automated changelog system

**Version:** v2.7.0
**Date:** 2026-04-04
**Severity:** MINOR
**Tags:** #devtool #automation
**Commits:** (pending)
**Author:** Claude

---

## Summary
Automated changelog system

## Changes
Implemented scripts/changelog.py and refactored CHANGELOG.md to Sliding Window v2.

## Files Modified
- scripts/changelog.py
- CHANGELOG.md

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests
