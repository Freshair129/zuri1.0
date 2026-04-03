# DevLog — Development Log

> บันทึก context ของแต่ละ session เพื่อให้ agent session ถัดไปรู้ว่างานอยู่ตรงไหน

---

## Format

ไฟล์ชื่อ `YYYY-MM-DD.md` — 1 วัน 1 ไฟล์ ถ้า session เดียวกันในวันเดียวกัน append ต่อท้าย

```markdown
## HH:MM — {ชื่อ session/งาน}

**ทำไปแล้ว:** สิ่งที่ implement/แก้/ตัดสินใจ
**ค้างอยู่:** งานที่ยังไม่เสร็จหรือหยุดไว้กลางคัน
**context สำคัญ:** สิ่งที่ session ถัดไปต้องรู้ก่อนเริ่ม
**session ถัดไปทำต่อ:** งานถัดไปที่ชัดเจน
```

## กฎ

- Agent เขียนท้าย session ทุกครั้ง **ก่อน** บอก Boss ว่าเสร็จแล้ว
- ถ้า context หมดก่อน → เขียนเป็น task แรกของ session ถัดไป
- เขียนสั้นพอ แต่ครบพอให้ agent ใหม่ pickup งานได้โดยไม่ต้องถาม Boss
- **อย่า** copy เนื้อหาที่อยู่ใน git log หรือ CHANGELOG แล้ว — เน้น context และ state เท่านั้น
