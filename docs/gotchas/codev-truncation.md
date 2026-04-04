# G-TRUNC-01 — Antigravity File Truncation

**Level:** L1 (Gotcha — technical trap ในโค้ด)
**Discovered:** 2026-04-04 (Session: co-dev Phase A/B/C)
**Files affected:** `.dev/co-dev/core/pipeline.py`, `.dev/co-dev/core/llm.py`

---

## ปัญหา

Antigravity truncate ไฟล์ซ้ำ **4 ครั้ง** ในโปรเจกต์ co-dev context injection
ทุกครั้งเกิดที่ **ตำแหน่งเดิม**: ช่วง LLM call / subprocess.run ใน `pipeline.py` และ `llm.py`

**Symptoms:**
- ไฟล์จบกะทันหันกลางบรรทัด เช่น `duration_ms = int((tim` หรือ `subprocess.run([`
- `py_compile` ผ่านได้ถ้า truncate หลัง valid statement แต่ logic หาย
- `wc -l` น้อยกว่าที่คาด (~160–240 บรรทัด แทนที่จะ 280+)

**สิ่งที่หายทุกครั้ง:**
```python
# ส่วนที่ truncate — ต้องมี 5 บรรทัดนี้ท้าย _run_agent():
duration_ms = int((time.time() - start) * 1000)
self.state_mgr.log_history(agent_name, "done", actual_model, duration_ms=duration_ms)
self.state_mgr.mark_step(state, agent_name, "done")
print(f"done ({duration_ms}ms)")
return response

# และ class นี้ที่ท้ายไฟล์:
class GateBlockedError(Exception):
    def __init__(self, gate_id: str, message: str):
        super().__init__(message)
        self.gate_id = gate_id
```

---

## สาเหตุ

Context window exhaustion ระหว่างที่ Antigravity กำลังเขียนไฟล์ — LLM cut output กลางไฟล์
แต่ report ว่า "done" ทำให้ไม่รู้ว่า truncate

---

## Prevention Rule

**ทุกครั้งที่ Antigravity เขียน `pipeline.py` หรือ `llm.py` ต้อง:**

```bash
# 1. ตรวจความยาว
wc -l .dev/co-dev/core/pipeline.py   # ควร >= 320 บรรทัด
wc -l .dev/co-dev/core/llm.py        # ควร >= 230 บรรทัด

# 2. ตรวจ tail
tail -20 .dev/co-dev/core/pipeline.py  # ต้องเห็น GateBlockedError class
tail -20 .dev/co-dev/core/llm.py       # ต้องเห็น _tool_call_gemini หรือ return

# 3. Syntax check
python -m py_compile .dev/co-dev/core/pipeline.py
python -m py_compile .dev/co-dev/core/llm.py
```

---

## วิธีแก้เมื่อเกิด truncation

1. อ่าน file จริงทั้งหมด (`Read` tool) — หา boundary ที่ไฟล์ cut
2. restore ส่วนที่หาย:
   - `duration_ms` calculation
   - `log_history` + `mark_step` calls
   - `return response`
   - `GateBlockedError` class (ถ้าหาย)
3. ใช้ `Edit` tool แทนที่ fragment ที่ถูก cut — **ห้าม rewrite ทั้งไฟล์** เพราะเสี่ยง truncate ซ้ำ

---

## call_with_tools Signature (Phase C)

Signature contract ที่ถูกต้อง — Antigravity มักใช้ผิด keyword args:

```python
# ✅ ถูก
call_with_tools(
    model=model,
    prompt=full_prompt,
    tools=tools_schema,
    tool_executor=executor.execute,  # callable (name, args) → str
    max_rounds=10,
)

# ❌ ผิด (Antigravity เคยส่ง)
call_with_tools(
    model_name=model,
    system_prompt=...,
    user_prompt=...,
    tools_schema=...,
    executor=executor,  # ผิด — ต้องส่ง executor.execute ไม่ใช่ executor object
)
```
