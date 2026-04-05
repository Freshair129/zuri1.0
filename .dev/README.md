# .dev/ — Developer Tooling

> ไม่ deploy ขึ้น Vercel (.vercelignore)
> Push ขึ้น GitHub ได้ (ยกเว้น secrets)

## โครงสร้าง

```
.dev/
├── orchestrator/        # CLI สำหรับ enforce DOC TO CODE workflow
│   ├── cli.js           # Entry: npx zuri <command>
│   ├── commands/        # แต่ละ command แยกไฟล์
│   └── templates/       # Feature spec, ADR, changelog templates
│
├── agents/              # Multi-agent config (ไม่ใช่ production code)
│   ├── claude-skills/   # Claude Code custom skills
│   ├── agent-skills/    # Other agent skills (Gemini, etc.)
│   └── AGENT_PROTOCOL.md
│
├── scripts/             # One-off maintenance scripts
│   ├── backfill/        # Data backfill scripts
│   ├── migration/       # DB migration helpers
│   └── smoke-test.mjs   # Health check
│
└── shared-context/      # Agent handover (push to GitHub)
    ├── GOAL.md           # Current objectives
    ├── MEMORY.md         # Agent progress log
    └── CONTEXT_INDEX.yaml
```

## External CLI Tools

| Tool | Command | Purpose |
|---|---|---|
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
2. **ห้ามเก็บ secrets** → ใช้ .env.local เท่านั้น
3. **Orchestrator** เป็น standalone Node.js CLI → มี package.json แยก
4. **shared-context/** push ขึ้น GitHub ได้ → ใช้ย้ายเครื่อง
