# co-dev v3.1

Multi-agent dev tool สำหรับ Zuri Platform
ใช้ Gemini (ฟรี) สำหรับงานหนัก → Claude Desktop / Claude Code review เป็น CTO

---

## ติดตั้ง

```bash
# 1. สร้างไฟล์ .env ใน .dev/co-dev/
echo GOOGLE_API_KEY=your_key_here > .dev/co-dev/.env

# 2. ติดตั้ง dependencies
pip install google-generativeai pyyaml --break-system-packages

# 3. ทดสอบ
python .dev/co-dev/cli.py version
```

> **GOOGLE_API_KEY** ใช้ [Google AI Studio](https://aistudio.google.com) — ฟรี ไม่มีค่าใช้จ่ายเพิ่ม

---

## วิธีรัน (5 แบบ)

### 1. Full pipeline

```bash
python .dev\co-dev\cli.py run "สร้าง feature AI Compose Reply"
```

PM → CTO (Gemini) → Doc Writer ครบ 3 agent พร้อม progress bar + ETA

### 2. Single agent

```bash
python .dev\co-dev\cli.py run "task" --agent cto
python .dev\co-dev\cli.py run "task" --agent pm
python .dev\co-dev\cli.py run "task" --agent doc_writer
```

รัน agent เดียวโดด ๆ เหมาะสำหรับทดสอบหรือ retry เฉพาะ step

### 3. Inject CTO จาก Claude Desktop

```bash
# Step 1 — รัน PM ก่อน (Gemini ฟรี)
python .dev\co-dev\cli.py run "task" --phase doc

# Step 2 — เปิด outputs/ แล้วส่ง pm_spec มาให้ Claude Desktop review

# Step 3 — บันทึก CTO review ลงไฟล์ แล้ว inject เข้า pipeline
python .dev\co-dev\cli.py run "task" --inject-agent cto --from-file cto_out.txt
```

Pipeline จะข้าม CTO LLM call แล้วรัน Doc Writer ต่อจากไฟล์ที่ inject ทันที

### 4. Shortcut commands

```bash
python .dev\co-dev\cli.py spec "AI Compose Reply"   # PM + Doc Writer (ไม่มี CTO)
python .dev\co-dev\cli.py code "path/to/spec.md"    # Backend + Frontend boilerplate
python .dev\co-dev\cli.py test "path/to/code.js"    # QA tests
```

### 5. Phase เลือก

```bash
python .dev\co-dev\cli.py run "task" --phase doc      # PM → CTO → Doc Writer
python .dev\co-dev\cli.py run "task" --phase code     # Backend + Frontend → QA → Tech Lead
python .dev\co-dev\cli.py run "task" --phase full     # doc + code ต่อกัน
```

---

## Model Routing

| Agent | Model | หมายเหตุ |
|-------|-------|----------|
| PM | Gemini Flash | ฟรี |
| CTO | Gemini Flash | ฟรี (หรือ inject จาก Claude Desktop) |
| Doc Writer | Gemini Flash | ฟรี |
| Backend | Gemini Flash | ฟรี |
| Frontend | Gemini Flash | ฟรี |
| QA | Gemini Flash | ฟรี |
| Tech Lead | Claude (CLI) | ใช้ subscription ปกติ ไม่มีค่าเพิ่ม |

หาก Claude CLI ไม่ available → fallback เป็น Gemini Flash อัตโนมัติ

---

## Output

ผลลัพธ์ทุก run ถูก save ที่ `.dev/co-dev/outputs/`

```
outputs/
  DOC-202604051430.md    # doc phase
  CODE-202604051500.md   # code phase
```

ดู output ล่าสุด:

```bash
python .dev\co-dev\cli.py review
```

---

## Commands อื่น ๆ

```bash
python .dev\co-dev\cli.py status        # ดู task ปัจจุบัน
python .dev\co-dev\cli.py history 20    # ดู 20 entries ล่าสุด
python .dev\co-dev\cli.py index         # rebuild RAG index
python .dev\co-dev\cli.py version       # แสดง version
```

---

## รัน Tests

```bash
python -m pytest .dev/co-dev/tests/ -v
# 51/51 passed
```

---

## โครงสร้างไฟล์

```
.dev/co-dev/
├── cli.py                  # entry point
├── .env                    # GOOGLE_API_KEY (ไม่ commit)
├── core/
│   ├── pipeline.py         # orchestrator (PM→CTO→Doc)
│   ├── llm.py              # model routing + fallback chain
│   ├── tools.py            # file/RAG tools สำหรับ agents
│   ├── retriever.py        # RAG context retrieval
│   ├── indexer.py          # vector index builder
│   ├── state.py            # task state management
│   └── gates.py            # approval gates
├── config/
│   ├── agents.yaml         # agent definitions + model overrides
│   ├── gates.yaml          # gate rules
│   └── prompts/            # system prompts per agent
├── outputs/                # pipeline output files (gitignored)
├── tests/
│   ├── test_llm.py                 # 12 tests — fallback chain, CLI
│   ├── test_pipeline_progress.py   # 19 tests — progress bar, ETA
│   └── test_tools.py               # 12 tests — file tools, RAG
└── scripts/
    └── benchmark.py        # เปรียบเทียบ co-dev vs plain injection
```

---

## Output vs Handoff

- `outputs/` — raw agent output (ชั่วคราว, gitignored)
- `docs/handoff/IMP-*.md` — formal implementation plan (Claude สร้างหลัง review output)

ดู format ที่ `docs/handoff/TEMPLATE.md`
