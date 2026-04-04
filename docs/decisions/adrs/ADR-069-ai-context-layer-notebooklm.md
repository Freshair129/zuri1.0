# ADR-069 — AI Context Layer (NotebookLM)

**Status:** APPROVED
**Date:** 2026-04-05
**Author:** Claude (Architect)
**Reviewer:** Boss (Product Owner)
**Related:** ROADMAP M3–M6 · FEAT10-DSB · FEAT11-AI-ASSISTANT · FEAT13-AGENT

---

## 1. Context

Zuri ใช้ Gemini Flash/Pro เป็น AI engine สำหรับ feature ต่าง ๆ ตั้งแต่ M3 เป็นต้นไป:
- A1: AI Compose Reply — ตอบแชทในสไตล์ admin
- A4: Auto Tag/Intent (PDAD) — classify ทุก message
- B1: Daily Sales Brief v2 — สรุปยอดขาย + insights
- A2: AI Agent Mode — ตอบแทน admin per-style
- B2: Sales KPI Analytics — วัด performance จากแชท

**ปัญหาของ Direct Injection:**

| ปัญหา | ผลกระทบ |
|---|---|
| Context window จำกัด (Gemini Flash ~1M tokens แต่ rate limited) | ส่งข้อมูลทั้งหมดในทุก call → ช้า + แพง |
| Tenant มีข้อมูลเฉพาะตัว (product catalog, admin style, brand voice) | ต้อง inject ทุกครั้ง แม้ข้อมูลเหมือนเดิม |
| Context ไม่อัปเดตแบบ real-time | ถ้า dump ครั้งเดียว → stale |
| Multi-tenant isolation | ห้าม cross-contaminate context ข้าม tenant |

**NotebookLM คืออะไร:**
Google NotebookLM เป็น AI-powered research tool ที่สร้าง "notebook" จากชุดเอกสาร → ตอบคำถามจากเอกสารเหล่านั้นด้วยความแม่นยำสูง + อ้างอิงแหล่งที่มาได้ (grounding)

---

## 2. Decision

**ใช้ NotebookLM เป็น AI Context Layer สำหรับ Zuri**

แต่ละ tenant มีชุด notebooks แยกกันโดยสมบูรณ์ → tenant isolation by design

Agent pipeline:
```
User Request → Agent Prompt
                    ↓
              Query NLM notebook  ← domain-specific context
                    ↓
              Gemini LLM call    ← prompt + NLM context + live DB data
                    ↓
              Response
```

---

## 3. Notebook Architecture

### 3.1 Notebook ต่อ Tenant (6 notebooks)

| Notebook ID | สร้างเมื่อ | ใช้โดย Feature | เนื้อหา |
|---|---|---|---|
| `{tenantId}-chat-intelligence` | M3 onboard | A1, A2, A3 | Admin conversation samples (50+ ต่อคน), product FAQ, brand voice examples, objection handling |
| `{tenantId}-pdad-framework` | M3 onboard | A4, B1 | PDAD framework rules, tag taxonomy ของ tenant, DSB format template, scoring thresholds |
| `{tenantId}-sales-kpi` | M4 activate | B2, B3 | KPI definitions, benchmark targets, CTA rules (HOT/WARM/COLD), SLA thresholds |
| `{tenantId}-ads-intelligence` | M4 activate | C1, C2 | Meta Ads policy, campaign history summary, ROAS benchmarks, creative guidelines |
| `{tenantId}-brand-content` | M6 activate | D1 | Brand guidelines, past content examples, tone of voice, color/logo refs |
| `{tenantId}-product-catalog` | M3 onboard | A1, A3 | Course list, package details, pricing, enrollment conditions, instructor info |

### 3.2 Platform-Wide Notebook (1 notebook — shared, read-only)

| Notebook ID | ใช้โดย | เนื้อหา |
|---|---|---|
| `zuri-platform` | co-dev agents (PM, CTO, Doc Writer) | PRD, ERD, ADRs, gotchas, CLAUDE.md, SITEMAP, ROADMAP |

---

## 4. Data Sources ต่อ Notebook

### `{tenantId}-chat-intelligence`

**Sources:**
- Export: top 200 conversations per admin (last 90 days) จาก `Conversation + Message` table
- Export: `Employee` profile + role + style notes
- Manual: Product FAQ document (Boss upload ครั้งแรก)

**Update cadence:** Weekly re-export อัตโนมัติ (QStash cron, Sunday 02:00 ICT)

### `{tenantId}-pdad-framework`

**Sources:**
- Static: PDAD framework document (Zuri internal)
- Per-tenant: Tag taxonomy CSV export จาก `ConversationAnalysis.tags`
- Per-tenant: DSB output samples (last 30 days)

**Update cadence:** Monthly (หรือเมื่อ Boss เพิ่ม tag ใหม่)

### `{tenantId}-product-catalog`

**Sources:**
- Export: `Product + Course + Package` tables → structured markdown
- Export: Pricing tables + enrollment conditions

**Update cadence:** On-change trigger (เมื่อ Boss แก้ไข course/price ใน POS)

### `zuri-platform`

**Sources:**
- `docs/product/PRD.md`
- `docs/product/ROADMAP.md`
- `prisma/schema.prisma`
- `docs/decisions/adrs/*.md`
- `docs/gotchas/*.md`
- `CLAUDE.md`

**Update cadence:** Manual (Boss trigger เมื่อ major doc update)

---

## 5. Integration: Agent → NLM

### 5.1 Query Pattern

```python
# co-dev/core/tools.py — query_notebook tool
def query_notebook(notebook_id: str, question: str) -> str:
    """Query NLM notebook via unofficial API or CLI wrapper"""
    # Uses nlm CLI (installed) or API if available
    result = nlm_client.query(notebook_id, question)
    return result.answer  # grounded text with citations
```

### 5.2 Agent Tool Definition

Agents ที่ใช้ NLM context จะมี tool `query_notebook` ใน tool list:

```yaml
# config/agents.yaml
cto:
  tools:
    - read_file
    - search_schema
    - query_notebook     # ← NLM tool
```

### 5.3 Notebook Naming Convention

```
{tenantId}-{domain}

ตัวอย่าง:
  10000000-chat-intelligence   (V School)
  10000000-pdad-framework
  10000000-product-catalog
  zuri-platform                (shared)
```

---

## 6. Tenant Onboarding Flow

เมื่อ tenant ใหม่ถูก provision (M5):

```
1. Create 3 core notebooks (chat-intelligence, pdad-framework, product-catalog)
2. Export initial data → upload to each notebook
3. Wait for NLM processing (~2-5 min)
4. Mark tenant.nlmReady = true
5. AI features enabled
```

**Implemented via:** QStash job `POST /api/workers/provision-nlm` triggered by tenant creation

---

## 7. Fallback Strategy

ถ้า NLM unavailable (API limit / outage):

| Scenario | Fallback |
|---|---|
| NLM query timeout (> 5s) | Direct Gemini injection — dump relevant DB data ใน prompt |
| NLM notebook not ready | Skip NLM step → use system prompt only |
| NLM API deprecated | Migrate to Gemini Grounding API (same pattern, different SDK) |

```python
# co-dev/core/llm.py
async def get_context(notebook_id: str, question: str) -> str:
    try:
        return await query_notebook(notebook_id, question)
    except (TimeoutError, NLMUnavailableError):
        # Fallback: return empty string — agent uses DB data only
        return ""
```

---

## 8. Privacy & Security

| Rule | Implementation |
|---|---|
| Tenant isolation | Notebook ID includes `tenantId` — แต่ละ tenant ไม่รู้จัก notebook ของกัน |
| No PII in platform notebook | `zuri-platform` มีเฉพาะ technical docs — ไม่มีชื่อลูกค้า |
| Data minimization | Export เฉพาะ fields ที่ AI ต้องใช้ — ไม่รวม `passwordHash`, `walletBalance` |
| NLM access | Boss account เดียว manage ทุก notebook — ไม่แชร์ credentials |

---

## 9. Trade-offs

| | NotebookLM (this ADR) | Direct Gemini Injection | Vector DB (Pinecone) |
|---|---|---|---|
| **Accuracy** | ✅ High — grounded, cites sources | ⚠️ Medium — depends on context size | ✅ High |
| **Cost** | ✅ Free (Google One) | ✅ Free (Flash) / 💰 (Pro) | 💰 Monthly fee |
| **Setup** | ✅ Manual UI / CLI | ✅ Zero setup | ❌ Infra overhead |
| **Update** | ⚠️ Manual / scheduled | ✅ Real-time from DB | ✅ Real-time |
| **Multi-tenant** | ✅ Per-notebook isolation | ⚠️ Must filter manually | ✅ Namespace per tenant |
| **Availability** | ⚠️ Unofficial API — may change | ✅ Stable | ✅ Stable |
| **Rate limits** | ⚠️ Unknown / undocumented | ✅ Known quotas | ✅ Known quotas |

**ยอมรับ trade-off:** NLM availability risk ← mitigated by Fallback (Section 7)
**Future path:** ถ้า NLM API deprecated → migrate to Gemini Grounding API หรือ Vertex AI Search โดยไม่ต้องเปลี่ยน agent interface

---

## 10. Consequences

- ✅ AI features มี domain-specific context โดยไม่ต้อง inject ทุก call
- ✅ Per-tenant isolation by design — ไม่มี cross-contamination
- ✅ ไม่เพิ่ม infra cost (ใช้ Google One ที่มีอยู่แล้ว)
- ✅ co-dev agents (PM/CTO/Doc Writer) ได้ context จาก `zuri-platform` notebook
- ⚠️ Dependency บน unofficial NLM API → ต้องมี fallback เสมอ
- ⚠️ Notebook update ไม่ real-time → AI อาจตอบตาม context ที่ lag 1-7 วัน

---

*อ้างอิง: ROADMAP M3-M6 · FEAT10-DSB · FEAT11-AI-ASSISTANT · FEAT13-AGENT · ADR-062 (Obsidian SSOT)*
