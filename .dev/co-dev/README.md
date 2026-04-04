# co-dev v3.1

Multi-agent dev tool สำหรับ Zuri Platform — Claude Code เรียกใช้ Gemini (ฟรี) สำหรับงาน boilerplate แล้ว review เองในฐานะ CTO/Tech Lead

## วิธีทำงาน

```
Claude Code รัน cli.py → Gemini generates → บันทึกใน outputs/
Claude Code อ่าน output → review + เขียน IMP file → docs/handoff/IMP-*.md
Boss approve → Antigravity orchestrate sub-agents
```

## Commands

```bash
python .dev/co-dev/cli.py spec "AI Compose Reply"   # PM + Doc Writer via Gemini
python .dev/co-dev/cli.py code "path/to/spec.md"    # Backend + Frontend boilerplate
python .dev/co-dev/cli.py test "path/to/code.js"    # QA tests via Gemini
python .dev/co-dev/cli.py review                    # แสดง output ล่าสุด
python .dev/co-dev/cli.py status                    # task ปัจจุบัน
python .dev/co-dev/cli.py history 20                # history 20 entries ล่าสุด
```

## โครงสร้าง

```
.dev/co-dev/
├── cli.py                    ← entry point (Claude Code calls this)
├── core/
│   ├── pipeline.py           ← orchestration logic (phases: doc/code/migrate)
│   ├── llm.py                ← model routing + inject context_files → call CLI
│   ├── state.py              ← task state + history (JSON)
│   └── gates.py              ← human approval gate management
├── config/
│   ├── agents.yaml           ← agent roles + context_files + rules + model
│   ├── router.yaml           ← task_type → model routing (cost_mode)
│   ├── gates.yaml            ← gate definitions
│   ├── settings.yaml         ← global config
│   └── prompts/              ← system prompts per agent (8 roles)
│       ├── cto.md
│       ├── tech_lead.md
│       ├── backend.md
│       ├── frontend.md
│       ├── pm.md
│       ├── qa.md
│       ├── doc_writer.md
│       ├── devops.md
│       └── migrator.md
└── outputs/                  ← Gemini raw output (gitignored, temp)
```

## Model Routing

ดู `config/router.yaml` — default cost_mode: `balanced`

| Task | balanced mode |
|---|---|
| architecture / review | Claude Opus |
| coding | Claude Sonnet |
| spec / analysis | Gemini Pro (ฟรี) |
| tests / docs | Gemini Flash (ฟรี) |

Override ด้วย env var: `CODEV_COST_MODE=quality python cli.py spec ...`

## Context Injection

`core/llm.py` อ่าน `context_files` จาก `agents.yaml` → ต่อเป็น `<context>` block → ส่งเป็น system prompt ให้ sub-agent ทุกครั้ง

## Origin

ชื่อ "co-dev" มาจาก:
- **CO** = ชื่อ project เดิม (CO = Zuri รุ่นแรก) + co-development
- **dev** = development tool
- เป็น extension ที่ทำงานร่วมกับ Claude ไม่ใช่ standalone system

## Output vs Handoff

- `outputs/` — raw Gemini output (ชั่วคราว, gitignored)
- `docs/handoff/IMP-*.md` — formal implementation plan (Claude สร้าง หลัง review output)

ดู format ที่ `docs/handoff/TEMPLATE.md`
