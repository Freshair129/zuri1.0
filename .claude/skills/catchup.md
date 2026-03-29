# Skill: Session Catchup

> Trigger: เริ่ม session ใหม่ หรือ /catchup
> Purpose: โหลด context ครบก่อนทำงาน

## Instructions

เมื่อเริ่ม session ใหม่ ให้ทำตามลำดับนี้:

1. **อ่าน GOAL.md** — ตรวจสอบ phase ปัจจุบันและ tasks
   ```
   Read .dev/shared-context/GOAL.md
   ```

2. **อ่าน MEMORY.md** — ดูว่า session ก่อนทำถึงไหน
   ```
   Read .dev/shared-context/MEMORY.md
   ```

3. **อ่าน CHANGELOG.md** — ดู LATEST pointer
   ```
   Read CHANGELOG.md (แค่ 50 บรรทัดแรก)
   ```

4. **อ่าน CONTEXT_INDEX.yaml** — ดูว่าต้องอ่าน domain context อะไรเพิ่ม
   ```
   Read .dev/shared-context/CONTEXT_INDEX.yaml
   ```

5. **สรุปให้ Boss** — รายงานสถานะ:
   ```
   - Phase ปัจจุบัน: X
   - Tasks ที่ค้าง: Y items
   - Session ก่อนทำ: [summary]
   - พร้อมทำอะไรต่อ: [suggestion]
   ```

## Rules
- ห้ามข้าม step — ถ้า file ไม่มีให้แจ้ง
- ถ้า MEMORY.md มี "blocking issue" → report ก่อน
- ถ้า GOAL.md มี task ที่ in_progress → ถาม Boss ว่าจะทำต่อไหม
