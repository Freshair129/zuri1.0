# Agent Skill: Documentation Writer

> For: Sub-agent
> Trigger: เขียน/อัปเดต docs

## Task

เขียน technical documentation ตาม Zuri standards.

## Document Types

### Feature Spec
- ใช้ template จาก .dev/orchestrator/templates/feature-spec.md
- ต้องมี: Data Flow, API Endpoints, Roles, Acceptance Criteria
- Status: DRAFT → REVIEW → APPROVED → IMPLEMENTED

### ADR
- ใช้ template จาก .dev/orchestrator/templates/adr.md
- ต้องมี: Context, Options, Decision, Consequences
- Status: DRAFT → PROPOSED → ACCEPTED

### Gotcha
- Format ตาม docs/gotchas/*.md
- ID: G-{CATEGORY}-{NN}
- Structure: เกิดอะไร → ป้องกัน → ADR อ้างอิง

### Changelog Entry
- ใช้ template จาก .dev/orchestrator/templates/changelog-entry.md
- Sliding window: Recent ≤ 5 entries

## Rules
- ภาษา: English for code/technical, Thai for explanation
- ห้ามเพิ่ม emoji (ยกเว้น Boss ขอ)
- ทุก doc ต้องมี frontmatter (gray-matter compatible)
- Cross-link ใน Obsidian format: `[[ADR-056]]`, `[[G-MT-01]]`
