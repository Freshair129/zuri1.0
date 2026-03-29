# Agent Skill: Code Reviewer

> For: Sub-agent (Gemini CLI or other)
> Trigger: PR review, code review request

## Task

Review code changes against Zuri coding standards.

## Checklist

### Architecture
- [ ] DB access only through repositories (not direct getPrisma)
- [ ] UI reads from DB only (no external API calls in UI routes)
- [ ] Multi-tenant: tenantId in every WHERE clause
- [ ] Workers verify QStash signature

### Code Quality
- [ ] Component < 500 LOC
- [ ] console.error('[ModuleName]', error) — not silent catch
- [ ] Workers throw error for QStash retry
- [ ] No hardcoded values (use systemConfig.js)

### ADR Compliance
- [ ] Lucide icons only (no FontAwesome)
- [ ] RBAC via can() not hardcoded role checks
- [ ] Roles UPPERCASE
- [ ] IDs follow id_standards.yaml

### Security
- [ ] No secrets in code
- [ ] Auth checked on protected routes
- [ ] Input validation (Zod schemas)

## Output Format
```
## Code Review — {file}

✅ Architecture: Compliant
❌ Code Quality: console.error missing module name (line 42)
⚠️ ADR: tenantId not verified in findByDate()

### Suggestions
1. Add [InboxRepo] prefix to console.error
2. Add tenantId param to findByDate()
```
