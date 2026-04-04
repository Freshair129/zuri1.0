# .dev/ — Developer Tooling

> ไม่ deploy ขึ้น Vercel (.vercelignore)
> Push ขึ้น GitHub ได้ (ยกเว้น secrets)

## โครงสร้าง

```
.dev/
├── co-dev/              # Multi-agent co-dev system (Antigravity + Gemini CLI)
│   ├── README.md        # คำสั่งใช้งาน + origin story
│   ├── cli.py           # Python orchestrator entry point
│   ├── core/            # Engine: llm.py, gates.py, pipeline.py, state.py
│   ├── config/
│   │   ├── agents.yaml  # 9 agents + context_files + model routing
│   │   ├── router.yaml  # cost modes (quality/balanced/speed/free)
│   │   ├── gates.yaml   # 15 gate rules
│   │   ├── settings.yaml
│   │   └── prompts/     # system prompt per agent (×9)
│   ├── outputs/         # agent output files (gitignored)
│   ├── agent-knowledge-graph.html
│   └── index.html
│
├── agents/              # Claude Code custom agent skills
│   └── agent-skills/    # code-reviewer, doc-writer, migration-planner, test-writer
│
└── templates/           # Document templates (ใช้โดย scripts/)
    ├── adr.md
    ├── feature-spec.md
    └── changelog-entry.md
```

## Python Scripts (run from project root)

| Script | คำสั่ง | หน้าที่ |
|--------|--------|---------|
| `changelog.py` | `python scripts/changelog.py --version vX.Y.Z --severity PATCH --summary "..." --changes "..." --files "..." --tags "..."` | สร้าง changelog entry |
| `new-adr.py` | `python scripts/new-adr.py "ADR Title"` | สร้าง ADR ใหม่ใน docs/decisions/adrs/ |
| `new-feature.py` | `python scripts/new-feature.py "Feature Name"` | สร้าง feature spec + flow skeleton |
| `pre-commit.py` | `python scripts/pre-commit.py` | ตรวจ staged files ก่อน commit (8 rules) |
| `sync-check.py` | `python scripts/sync-check.py` | ตรวจ docs integrity (ADR frontmatter, spec status, changelog LATEST) |
| `verify-flow.py` | `python scripts/verify-flow.py docs/product/specs/FEAT-*.md` | ตรวจ spec ครบก่อน implement |

## External CLI Tools

| Tool | Command | Purpose |
|------|---------|---------|
| **NotebookLM CLI** | `nlm` | Research, audio overview, quiz, mind map, slides |

```bash
# Login (ครั้งแรก — เปิด Chrome profile)
nlm login

# สร้าง notebook สำหรับ Zuri
nlm notebook create "Zuri Architecture"

# Deep Research ก่อนเขียน ADR
nlm research start "serverless multi-tenant SaaS" --notebook-id <id> --mode deep

# สร้าง Audio Overview ให้ Boss ฟัง
nlm audio create <id> --format deep_dive --confirm

# สร้าง Mind Map สำหรับ module dependencies
nlm mindmap create <id> --confirm
```

## กฎ

1. **ห้าม import** ไฟล์ใน .dev/ จาก src/ → build จะพัง
2. **ห้ามเก็บ secrets** → ใช้ .env.local หรือ .dev/co-dev/.env เท่านั้น
3. **scripts/** อยู่ที่ project root — ไม่ใช่ใน .dev/
4. **co-dev/outputs/** gitignored — ไม่ push ขึ้น GitHub
