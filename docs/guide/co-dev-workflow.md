---
title: "Co-Dev Workflow — ระบบสั่งงานข้ามแพลตฟอร์ม"
version: 1.0.0
updated: 2026-04-04
---

# Co-Dev Workflow

ระบบทำงานร่วมกันระหว่าง Claude (planner/reviewer) และ Antigravity (executor/orchestrator) โดยมี Boss เป็น human gate ที่ approve ก่อน execute ทุกครั้ง

---

## ภาพรวม

```
Boss
 │
 ├─── สั่ง Claude Code ───► วางแผน + แตก task → เขียน Implementation Plan
 │                                                        │
 │◄── copy IMP file ──────────────────────────────────────┘
 │
 ├─── ส่งให้ Antigravity ──► อ่านแผน → สร้าง changelog (PENDING)
 │
 ├─── [Boss approve] ──────► Antigravity spawn sub-agents (parallel)
 │                                ├── backend agent
 │                                ├── frontend agent
 │                                └── qa agent
 │                                        │
 │                            update IMP → DONE + เขียน Results
 │
 └─── สั่ง Claude ──────────► catchup → review → อัปเดต docs + changelog
```

---

## ผู้เล่นในระบบ

| ผู้เล่น | บทบาท | Platform | Model |
|---|---|---|---|
| **Boss** | สั่งงาน + approve | — | — |
| **Claude** | Planner + Reviewer | Claude Code | Sonnet/Opus |
| **Antigravity** | Orchestrator | Antigravity | Gemini |
| **Sub-agents** | Executor (parallel) | Antigravity native | ตาม router.yaml |

---

## Config Files

### `.dev/co-dev/config/agents.yaml`
กำหนด role ของแต่ละ agent: context_files ที่ต้อง inject, rules, model, dependencies

```
cto → tech_lead → backend ┐
                  frontend ┤→ qa → tech_lead → devops
                  pm ──────┘
```

### `.dev/co-dev/config/router.yaml`
กำหนด model routing ตาม cost_mode

| cost_mode | architecture | coding | spec/test/docs |
|---|---|---|---|
| quality | Opus | Sonnet | Gemini |
| **balanced** (default) | Opus | Sonnet | Gemini (ฟรี) |
| speed | Sonnet | Sonnet | Gemini Flash |
| free | Gemini Pro | Gemini Flash | Gemini Flash |

### `.dev/co-dev/config/prompts/*.md`
System prompt สำเร็จรูปสำหรับแต่ละ agent role — Antigravity inject เข้า sub-agent ก่อน execute

---

## Implementation Plan (IMP)

ไฟล์กลางที่ Claude สร้าง → Antigravity อ่านและอัปเดต → Claude อ่าน catchup

**ที่เก็บ:** `docs/handoff/IMP-{YYYYMMDD}-{slug}.md`
**Template:** `docs/handoff/TEMPLATE.md`

### Status Flow
```
DRAFT → PENDING_APPROVAL → IN_PROGRESS → DONE
  │            │                │           │
Claude       Boss             Antigravity  Antigravity
สร้าง       approve          spawn agents  update results
```

### Format
```markdown
---
id: IMP-20260404-crm-customer-list
feature: FEAT05-crm
status: PENDING_APPROVAL
---

## Plan
### Phase 1: Backend
- [ ] [backend] สร้าง customerRepo.js
- [ ] [frontend] CustomerList component

---
## Results          ← Antigravity เขียนเมื่อ task เสร็จ
## Review Notes     ← Claude เขียนตอน catchup
```

---

## การ Inject Context (ทำงานยังไง)

Antigravity ไม่ได้รู้ CLAUDE.md เอง — Orchestrator inject ผ่าน `context_files` ใน agents.yaml:

```
Antigravity รับ task
      │
      ▼
อ่าน agents.yaml → หา context_files ของ agent นั้น
      │
      ▼
อ่านไฟล์ทุกตัวใน context_files → รวมเป็น system prompt
      │
      ▼
รวมกับ prompts/{agent}.md → ส่งเป็น system prompt ให้ sub-agent
      │
      ▼
spawn sub-agent พร้อม context ครบถ้วน
```

---

## สองโหมดการสั่งงาน Antigravity

| โหมด | เมื่อไหร่ใช้ | วิธีสั่ง |
|---|---|---|
| **Native (ad-hoc)** | งานด่วน / ครั้งเดียว | บอก Antigravity ตรงๆ เป็น text |
| **Config-driven** | workflow ถาวร / ทำซ้ำ | agents.yaml + prompts/*.md |

ตัวอย่าง ad-hoc: *"รัน backend และ frontend agent สำหรับ IMP-20260404-crm พร้อมกัน"*
Antigravity spawn parallel sub-agents ได้เลยโดยไม่ต้องเขียนโค้ด

---

## Scripts ที่ใช้ในกระบวนการ

| Script | ใครรัน | ทำอะไร |
|---|---|---|
| `python scripts/new-adr.py` | Claude | สร้าง ADR ใหม่ |
| `python scripts/new-feature.py` | Claude | สร้าง feature spec + flow |
| `python scripts/pre-commit.py` | Claude / Antigravity | ตรวจ staged files ก่อน commit |
| `python scripts/changelog.py` | Claude / Antigravity | สร้าง changelog entry |

---

## Audit Trail

ทุกอย่าง track ผ่าน Git — ไม่มี output/ folder แยก:

| หลักฐาน | ที่อยู่ |
|---|---|
| Implementation plan + results | `docs/handoff/IMP-*.md` |
| Session log | `docs/devlog/YYYY-MM-DD.md` |
| Code changes | `changelog/CL-*.md` |
| Architecture decisions | `docs/decisions/adrs/` |
| Git history | `git log` |

---

## ตัวอย่าง Full Cycle

```
1. Boss: "ทำ FEAT05-CRM customer list"

2. Claude:
   - อ่าน docs/product/specs/FEAT05-crm.md
   - สร้าง docs/handoff/IMP-20260404-crm-customer-list.md (DRAFT)
   - status → PENDING_APPROVAL

3. Boss copy IMP file → Antigravity:
   "อ่านไฟล์นี้แล้วทำตามแผน"

4. Antigravity:
   - สร้าง changelog entry (PENDING)
   - รอ Boss approve

5. Boss: "approve"

6. Antigravity spawn parallel:
   - backend agent → customerRepo.js + API route
   - frontend agent → CustomerList.jsx
   - qa agent → customer.test.js
   (ทำงานพร้อมกัน)

7. Antigravity update IMP:
   - tick checkboxes ✅
   - เขียน Results section
   - status → DONE
   - changelog → DONE

8. Boss สั่ง Claude:
   "catchup IMP-20260404-crm-customer-list"

9. Claude:
   - อ่าน IMP file
   - review Results
   - เขียน Review Notes
   - อัปเดต docs ที่เกี่ยวข้อง
   - เขียน devlog
```

---

## ข้อจำกัดที่รู้อยู่

- Claude ไม่สามารถสั่ง Antigravity โดยตรง (ต่าง platform) — Boss เป็น bridge
- Antigravity bash เรียก gemini CLI ได้ แต่ไม่นับใน Antigravity quota
- Parallel sub-agents ประหยัด latency แต่ไม่ประหยัด token
