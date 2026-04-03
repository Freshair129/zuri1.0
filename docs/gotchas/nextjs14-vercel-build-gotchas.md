# Next.js 14 + Vercel Build Gotchas

> เก็บบทเรียนจาก INC-2026-04-03-001 — Production deployment blocked 6 ครั้งติดต่อกัน

---

## GOTCHA-001: API Route ต้องมี `force-dynamic` เมื่อใช้ `request.headers`

**อาการ:** Build ล้มเหลวด้วย `DYNAMIC_SERVER_USAGE` error ตอน static page generation

**สาเหตุ:** Next.js 14 App Router พยายาม pre-render ทุก route แบบ static by default ถ้า route เรียก `request.headers` (เช่น อ่าน `x-tenant-id` ที่ middleware inject มา) → crash ตอน build time

**Fix:**
```js
// เพิ่มบรรทัดนี้ที่ top ของทุก route.js ที่ใช้ request.headers / cookies / dynamic data
export const dynamic = 'force-dynamic'
```

**Rule:** ทุก route ที่เรียก `getTenantId(request)` จาก `src/lib/getTenantId.js` **ต้องมี** บรรทัดนี้เสมอ

---

## GOTCHA-002: Route Group + Pure Server Component → ENOENT build trace บน Vercel

**อาการ:** Build ผ่าน (✓ Compiled, ✓ Generating static pages) แต่ deployment ยัง ERROR ด้วย:
```
Error: ENOENT: no such file or directory,
  lstat '/vercel/path0/.next/server/app/(dashboard)/page_client-reference-manifest.js'
```
เกิดในขั้นตอน **"Collecting build traces"**

**สาเหตุ:** Route group เช่น `src/app/(dashboard)/page.jsx` ที่เป็น pure Server Component (ไม่มี client imports เลย) — Next.js 14 จะ**ไม่ generate** `page_client-reference-manifest.js` สำหรับ page นั้น แต่ Vercel's build tracer ไปหาไฟล์นี้และ fail

**Fix:**
```jsx
// src/app/(dashboard)/page.jsx
'use client'  // ← เพิ่มบรรทัดนี้ เพื่อ force generate manifest

export default function DashboardHome() {
  return (...)
}
```

**หมายเหตุ:** ถ้าไม่อยากทำเป็น Client Component จริงๆ ให้แก้ `next.config.js` แทน:
```js
experimental: {
  outputFileTracingIncludes: {
    '/(dashboard)/**': ['./src/**/*'],
  },
}
```
แต่วิธี `'use client'` ง่ายกว่าสำหรับ placeholder pages

---

## GOTCHA-003: Repository Export หายหลัง Refactor

**อาการ:** `⚠ Compiled with warnings: Attempted import error: 'X' is not exported from './Y'`

**สาเหตุ:** Refactor เปลี่ยนชื่อหรือลบ function exports ใน `src/lib/repositories/` โดยไม่ update callers ใน API routes

**Fix Process:**
```bash
# ก่อน rename หรือ ลบ export ใดๆ ใน repositories/ → ตรวจ callers ก่อนเสมอ
grep -rn "ชื่อฟังก์ชันที่จะแก้" src/app/api/
```

**Rule:** ทุกครั้งที่ touch `src/lib/repositories/*.js` → ต้องรัน `grep` หา all imports ก่อน commit

---

## GOTCHA-004: `.git/index.lock` บน Windows + Linux Container

**อาการ:** `fatal: Unable to create '.git/index.lock': File exists` เมื่อพยายาม commit จาก Linux sandbox

**สาเหตุ:** Git process ก่อนหน้า crash ทิ้ง lock file ไว้ และ Linux sandbox ไม่มีสิทธิ์ลบไฟล์ใน Windows filesystem mount

**Fix:** ใช้ Desktop Commander รัน command บน Windows โดยตรง:
```cmd
del /f /q E:\zuri\.git\index.lock
```

---

## GOTCHA-005: `git commit -m "..."` บน Windows cmd — Multi-word message ต้องระวัง

**อาการ:** `error: pathspec 'word' did not match any file(s) known to git` สำหรับทุกคำใน commit message

**สาเหตุ:** Windows cmd parse `-m "message with spaces"` ผิดพลาดเมื่อ message มีบาง special characters หรือ quotes ซ้อนกัน

**Fix:** ใช้ commit message file แทน:
```cmd
echo your commit message > commitmsg.txt
git commit -F commitmsg.txt
del commitmsg.txt
```

---

## Checklist ก่อน Push ทุกครั้ง

- [ ] `npm run build` ผ่านบน local
- [ ] Route ใหม่ที่ใช้ `request.headers` มี `export const dynamic = 'force-dynamic'`
- [ ] Function ที่ import จาก repositories/ มีอยู่จริง (`grep -n "export"`)
- [ ] Route group pages มี client imports หรือ `'use client'` (ถ้าเป็น placeholder)
