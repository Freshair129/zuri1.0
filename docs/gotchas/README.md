# Gotchas — Known Issues & Prevention

> สิ่งที่เคยพลาดใน ZURI + วิธีป้องกัน → อ่านก่อน implement ทุกครั้ง

---

## สารบัญ

1. [Facebook & Meta API](./meta-api.md)
2. [Webhook & Serverless](./webhook-serverless.md)
3. [Database & Identity](./database-identity.md)
4. [Marketing & Attribution](./marketing-attribution.md)
5. [AI & Agent](./ai-agent.md)
6. [Multi-Tenant](./multi-tenant.md)
7. [Dev Process](./dev-process.md)
8. [Next.js 14 / Vercel Build](./nextjs14-vercel-build-gotchas.md)
9. [Dev Workflow Rules (G-DEV-05)](./G-DEV-05.md)
10. [Webhook Rules (G-WH-02)](./G-WH-02.md)

## Incidents

> เหตุการณ์จริงที่เกิดขึ้น — อ่านเพื่อเข้าใจ root cause และวิธีป้องกัน

- [INCIDENT-2026-04-03 — Build Failure](./incidents/INCIDENT-2026-04-03-BUILD-FAILURE.md)

## วิธีเพิ่ม Gotcha ใหม่

**Rule ใหม่ในหัวข้อที่มีอยู่แล้ว** → เปิดไฟล์นั้นแล้ว append rule เข้าไป

**หัวข้อใหม่** → สร้างไฟล์ใหม่ `{topic}.md` แล้วเพิ่ม link เข้า index นี้

**Incident ใหม่** → สร้างไฟล์ใน `incidents/INCIDENT-YYYY-MM-DD-{slug}.md`
