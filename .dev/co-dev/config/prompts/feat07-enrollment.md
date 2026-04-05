# FEAT07-ENROLLMENT — Implementation Prompt
# ใช้ paste ใน Claude Code session ใหม่

---

## Context

คุณคือ **Senior Full-Stack Engineer** กำลัง implement **FEAT07-ENROLLMENT** บน Zuri Platform — Next.js 14 App Router, PostgreSQL/Prisma, Upstash Redis, QStash, Pusher, deployed on Vercel serverless.

### Project Rules (อ่านก่อนทุกครั้ง)
- อ่าน `CLAUDE.md` → rules ทั้งหมด
- อ่าน `prisma/schema.prisma` → schema ปัจจุบัน
- อ่าน `docs/product/specs/FEAT07-ENROLLMENT.md` → spec เต็ม
- อ่าน `id_standards.yaml` → ID format

---

## Current State (สิ่งที่มีแล้ว — ห้าม overwrite)

```
✅ prisma/schema.prisma
   - Enrollment model (basic — ต้องเพิ่ม fields + relations)
   - CourseSchedule model (basic — ต้องเพิ่ม fields)
   - Package model (มี tenantId หายไป)
   - PackageCourse model (มีแล้ว)

✅ src/lib/repositories/enrollmentRepo.js  ← REWRITE ทั้งหมด
✅ src/lib/repositories/scheduleRepo.js    ← มีแล้วบางส่วน
✅ src/app/(dashboard)/courses/            ← มี page อยู่แล้ว
✅ src/app/api/culinary/schedules/         ← มีบางส่วน
```

---

## What To Build — P0 (ทำก่อน) + P1 (ทำต่อ)

### ─── PHASE P0: Schema + Backend Core ───

#### P0-01: Schema Migration (prisma/schema.prisma)

เพิ่ม/แก้ models ต่อไปนี้ใน schema:

```prisma
// แก้ Package — เพิ่ม tenantId + hours + fields ตาม spec
model Package {
  id          String   @id @default(uuid())
  packageId   String   @unique @map("package_id")
  tenantId    String   @map("tenant_id")        // ← เพิ่ม
  name        String
  description String?  @db.Text
  price       Decimal  @default(0) @db.Decimal(10,2)
  hours       Int      @default(0)              // ← เพิ่ม (สำหรับ certificate trigger)
  category    String?                            // ← เพิ่ม (Bakery, Pastry, Thai)
  imageUrl    String?  @map("image_url")         // ← เพิ่ม
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  courses     PackageCourse[]
  enrollments Enrollment[]
  tenant      Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([tenantId, isActive])
  @@map("packages")
}

// แก้ Enrollment — lifecycle + orderId + hours tracking
model Enrollment {
  id              String    @id @default(uuid())
  enrollmentId    String    @unique @map("enrollment_id")  // ENR-20260405-001
  tenantId        String    @map("tenant_id")
  customerId      String    @map("customer_id")
  packageId       String    @map("package_id")             // ← เปลี่ยนจาก productId
  orderId         String?   @map("order_id")               // ← เพิ่ม (link POS)
  soldById        String?   @map("sold_by_id")
  status          String    @default("PENDING")            // PENDING/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED
  hoursCompleted  Decimal   @default(0) @map("hours_completed") @db.Decimal(5,2)
  confirmedAt     DateTime? @map("confirmed_at")
  completedAt     DateTime? @map("completed_at")
  cancelledAt     DateTime? @map("cancelled_at")
  cancelReason    String?   @map("cancel_reason")
  enrolledAt      DateTime  @default(now()) @map("enrolled_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  customer    Customer         @relation(fields: [customerId], references: [id])
  package     Package          @relation(fields: [packageId], references: [id])
  items       EnrollmentItem[]
  attendances ClassAttendance[]
  certificate Certificate?
  gift        PackageGift?

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, customerId])
  @@map("enrollments")
}

// NEW — EnrollmentItem (1 row ต่อ Course ใน Enrollment)
model EnrollmentItem {
  id             String   @id @default(uuid())
  enrollmentId   String   @map("enrollment_id")
  courseId       String   @map("course_id")    // productId ของ Course
  hoursCompleted Decimal  @default(0) @map("hours_completed") @db.Decimal(5,2)
  status         String   @default("PENDING")  // PENDING/IN_PROGRESS/COMPLETED
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id])

  @@unique([enrollmentId, courseId])
  @@index([enrollmentId])
  @@map("enrollment_items")
}

// แก้ CourseSchedule — เพิ่ม tenantId + room + full fields
model CourseSchedule {
  id                String   @id @default(uuid())
  scheduleId        String   @unique @map("schedule_id")  // SCH-20260405-001
  tenantId          String   @map("tenant_id")            // ← เพิ่ม
  courseId          String   @map("course_id")            // productId
  instructorId      String?  @map("instructor_id")
  instructorName    String?  @map("instructor_name")      // fallback string
  date              DateTime @db.Date                     // วันที่ (UTC)
  startTime         String   @map("start_time")           // "09:00"
  endTime           String   @map("end_time")             // "12:00"
  room              String?
  maxStudents       Int      @default(10) @map("max_students")
  status            String   @default("SCHEDULED")       // SCHEDULED/FULL/CANCELLED/COMPLETED
  qrToken           String?  @unique @map("qr_token")    // short-lived token สำหรับ check-in
  qrExpiresAt       DateTime? @map("qr_expires_at")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  attendances ClassAttendance[]

  @@index([tenantId])
  @@index([tenantId, date])
  @@index([tenantId, courseId])
  @@map("course_schedules")
}

// NEW — ClassAttendance
model ClassAttendance {
  id           String    @id @default(uuid())
  tenantId     String    @map("tenant_id")
  enrollmentId String    @map("enrollment_id")
  scheduleId   String    @map("schedule_id")
  status       String    @default("ABSENT")  // PRESENT/ABSENT/LATE/EXCUSED
  checkedAt    DateTime? @map("checked_at")
  note         String?
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  enrollment Enrollment    @relation(fields: [enrollmentId], references: [id])
  schedule   CourseSchedule @relation(fields: [scheduleId], references: [id])

  @@unique([enrollmentId, scheduleId])   // ← G1: ป้องกัน double check-in
  @@index([tenantId])
  @@index([scheduleId])
  @@map("class_attendances")
}

// NEW — Certificate
model Certificate {
  id                String   @id @default(uuid())
  tenantId          String   @map("tenant_id")
  enrollmentId      String   @unique @map("enrollment_id")  // G7: unique → ป้องกัน dup
  certificateNumber String   @unique @map("certificate_number")  // CERT-VSCH-2026-00001
  issuedDate        DateTime @default(now()) @map("issued_date")
  pdfUrl            String?  @map("pdf_url")
  sentAt            DateTime? @map("sent_at")
  createdAt         DateTime @default(now()) @map("created_at")

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id])

  @@index([tenantId])
  @@map("certificates")
}

// NEW — PackageGift (Gift enrollment)
model PackageGift {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  enrollmentId    String    @unique @map("enrollment_id")
  buyerCustomerId String    @map("buyer_customer_id")
  studentName     String    @map("student_name")
  studentPhone    String?   @map("student_phone")
  studentEmail    String?   @map("student_email")
  giftMessage     String?   @map("gift_message") @db.Text
  redeemCode      String    @unique @map("redeem_code")
  redeemedAt      DateTime? @map("redeemed_at")
  createdAt       DateTime  @default(now()) @map("created_at")

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id])

  @@index([tenantId])
  @@index([redeemCode])
  @@map("package_gifts")
}
```

**หลัง schema:** รัน `prisma db push` (Boss รันเอง บน local)

---

#### P0-02: enrollmentRepo.js (REWRITE ทั้งหมด)

**Path:** `src/lib/repositories/enrollmentRepo.js`

Functions ที่ต้องมี:

```javascript
// ID Generation
generateEnrollmentId()      // ENR-20260405-001
generateCertificateNumber(tenantId, year)  // CERT-VSCH-2026-00001

// Package Catalog
listPackages(tenantId, { search, category, isActive })  // Redis cache 10 min
getPackageById(tenantId, packageId)                      // includes courses
createPackage(tenantId, data)
updatePackage(tenantId, packageId, data)                 // whitelist fields

// Enrollment Lifecycle
createEnrollment(tenantId, { customerId, packageId, orderId, soldById })
  // prisma.$transaction: create Enrollment PENDING + EnrollmentItem per course

listEnrollments(tenantId, { status, customerId, page, limit })  // Redis cache 60s
getEnrollmentById(tenantId, enrollmentId)
  // includes: customer, package.courses, items, attendances, certificate

confirmEnrollment(tenantId, enrollmentId)     // PENDING → CONFIRMED
cancelEnrollment(tenantId, enrollmentId, { reason })  // → CANCELLED

// Attendance
checkIn(tenantId, { enrollmentId, scheduleId, qrToken })
  // 1. verify qrToken valid + not expired
  // 2. upsert ClassAttendance @@unique(enrollmentId, scheduleId) → status PRESENT
  // 3. update EnrollmentItem.hoursCompleted += duration
  // 4. update Enrollment.hoursCompleted += duration
  // 5. if hoursCompleted >= package.hours → queue completion check
  // ALL in prisma.$transaction (NFR-ENR-06: no double-count)

markAttendanceManual(tenantId, { enrollmentId, scheduleId, status, note })
  // Staff override: ABSENT / EXCUSED

getAttendanceSheet(tenantId, scheduleId)
  // list enrollments + attendance status for a class

// Workers (called by QStash)
markAbsentForExpiredSchedules(tenantId)
  // find schedules where endTime < now() && no attendance record → create ABSENT

checkAndCompleteEnrollments(tenantId)
  // find IN_PROGRESS where hoursCompleted >= package.hours
  // prisma.$transaction: status → COMPLETED + create Certificate (G7: check unique first)

// Schedule
createSchedule(tenantId, data)
  // conflict detection: instructor/room overlap in same time window (G3)

listSchedules(tenantId, { month, courseId, instructorId })  // Redis cache 5 min
generateQrToken(scheduleId)  // crypto.randomUUID, expiry 30 min (G1)

// Stats
getEnrollmentStats(tenantId)  // total, by status, completion rate — Redis 60s
```

**Gotchas ที่ต้องระวัง:**
- **G1 Double Check-in:** @@unique([enrollmentId, scheduleId]) + upsert pattern
- **G2 Timezone:** เก็บ DB เป็น UTC, display เป็น Asia/Bangkok — ใช้ `new Date().toISOString()` ใน server
- **G3 Conflict Detection:** query overlap ก่อน save schedule + `prisma.$transaction`
- **G6 Package.hours:** ใช้ `package.hours` สำหรับ certificate trigger — ไม่ใช่ผลรวม course.hours
- **G7 Certificate Idempotency:** check `Certificate.enrollmentId` unique ก่อน insert

---

#### P0-03: API Routes

```
POST   /api/enrollments                    → createEnrollment
GET    /api/enrollments                    → listEnrollments (withAuth enrollment:R)
GET    /api/enrollments/[id]               → getEnrollmentById
PATCH  /api/enrollments/[id]/confirm       → confirmEnrollment (MANAGER+)
PATCH  /api/enrollments/[id]/cancel        → cancelEnrollment (MANAGER+)
POST   /api/enrollments/attendance/checkin → checkIn (< 1s NFR-ENR-01)
PATCH  /api/enrollments/attendance/manual  → markAttendanceManual
GET    /api/enrollments/attendance/[scheduleId] → getAttendanceSheet

GET    /api/packages                       → listPackages + Redis cache
POST   /api/packages                       → createPackage (MANAGER+)
PATCH  /api/packages/[id]                  → updatePackage (MANAGER+)

GET    /api/schedules                      → listSchedules + Redis cache (NFR-ENR-02)
POST   /api/schedules                      → createSchedule + conflict check
GET    /api/schedules/[id]/qr             → generateQrToken
```

**ทุก route ใช้ `withAuth(handler, { domain: 'enrollment', action: 'R'/'W' })`**

---

#### P0-04: QStash Workers

**Worker 1: `/api/workers/mark-absent/route.js`**
- Trigger: QStash cron ทุก 15 นาที
- Logic: `markAbsentForExpiredSchedules` per tenant
- `throw error` → QStash retry (NFR3)

**Worker 2: `/api/workers/check-completion/route.js`**
- Trigger: QStash cron hourly
- Logic: `checkAndCompleteEnrollments` per tenant → สร้าง Certificate
- G7: ตรวจ unique ก่อน insert Certificate
- `throw error` → QStash retry

**vercel.json crons เพิ่ม:**
```json
{
  "crons": [
    { "path": "/api/workers/mark-absent",     "schedule": "*/15 * * * *" },
    { "path": "/api/workers/check-completion", "schedule": "0 * * * *"   }
  ]
}
```

---

### ─── PHASE P1: UI ───

#### P1-01: `/app/(dashboard)/enrollment/page.jsx`

**Enrollment Dashboard** — Server Component shell + Client components:

```
Layout: DashboardShell
  ├── Stats row: Total, PENDING, IN_PROGRESS, COMPLETED (this month)
  ├── Filter bar: status pills + search + date range
  ├── EnrollmentTable (Client):
  │     columns: Customer, Package, Status badge, hoursCompleted/package.hours, enrolledAt, Actions
  │     Actions: View detail, Confirm (MANAGER+), Cancel (MANAGER+)
  └── New Enrollment button → modal (SALES+)
```

**New Enrollment Modal:**
- Select Customer (search `/api/customers`)
- Select Package (dropdown from `/api/packages`)
- Link Order ID (optional)
- Submit → POST /api/enrollments

**Status Badge colors:**
- PENDING → yellow
- CONFIRMED → blue
- IN_PROGRESS → purple
- COMPLETED → green
- CANCELLED → gray

---

#### P1-02: `/app/(dashboard)/enrollment/[id]/page.jsx`

**Enrollment Detail** — แสดงข้อมูลครบ:

```
├── Header: Customer name, Package name, Status badge, hoursCompleted progress bar
├── Tabs:
│   ├── Overview: Package details, EnrollmentItems per course with hours
│   ├── Schedule: รายการ ClassAttendance (date, status, hours)
│   ├── Certificate: แสดงถ้ามี / "ยังไม่ครบชั่วโมง" ถ้ายังไม่จบ
│   └── Activity: timeline (confirm, cancel, attend events)
└── Actions: Confirm / Cancel (MANAGER+)
```

---

#### P1-03: `/app/(dashboard)/schedule/page.jsx` (REWRITE)

**Calendar View** — monthly/weekly:

```
├── View toggle: Month | Week
├── Filter: Course, Instructor
├── Calendar grid (ใช้ CSS Grid หรือ react-big-calendar ถ้าอนุมัติ)
│     - สี schedule: green (ว่าง), yellow (>70% เต็ม), red (เต็ม/FULL)
│     - click schedule → drawer: รายชื่อนักเรียน + QR button
└── New Schedule button (MANAGER+) → form modal
```

**QR Code drawer:**
- เรียก `GET /api/schedules/[id]/qr` → แสดง QR (ใช้ `qrcode` library หรือ `<img src="https://api.qrserver.com/v1/create-qr-code/?data=...">`)

---

#### P1-04: Attendance Sheet `/app/(dashboard)/schedule/[id]/attendance/page.jsx`

```
├── Schedule info: Course, date, instructor, room
├── Student list table: Name, status badge, checkedAt, note
└── Manual override: Staff click row → change status (EXCUSED/ABSENT)
```

---

## File Output Structure

```
prisma/schema.prisma                                    ← UPDATED
src/lib/repositories/enrollmentRepo.js                  ← REWRITE
src/lib/repositories/scheduleRepo.js                    ← UPDATE
src/app/api/enrollments/route.js                        ← NEW
src/app/api/enrollments/[id]/route.js                   ← NEW
src/app/api/enrollments/[id]/confirm/route.js           ← NEW
src/app/api/enrollments/[id]/cancel/route.js            ← NEW
src/app/api/enrollments/attendance/checkin/route.js     ← NEW
src/app/api/enrollments/attendance/manual/route.js      ← NEW
src/app/api/enrollments/attendance/[scheduleId]/route.js ← NEW
src/app/api/packages/route.js                           ← NEW
src/app/api/packages/[id]/route.js                      ← NEW
src/app/api/schedules/route.js                          ← NEW/UPDATE
src/app/api/schedules/[id]/route.js                     ← NEW
src/app/api/schedules/[id]/qr/route.js                  ← NEW
src/app/api/workers/mark-absent/route.js                ← NEW
src/app/api/workers/check-completion/route.js           ← NEW
src/app/(dashboard)/enrollment/page.jsx                 ← NEW
src/app/(dashboard)/enrollment/[id]/page.jsx            ← NEW
src/app/(dashboard)/schedule/page.jsx                   ← REWRITE
src/app/(dashboard)/schedule/[id]/attendance/page.jsx   ← NEW
vercel.json                                             ← ADD crons
```

---

## Absolute Rules (ห้ามละเมิด)

1. ห้าม `getPrisma()` ใน route — ใช้ repository เท่านั้น
2. ทุก repo function รับ `tenantId` เป็น param แรก
3. `console.error('[EnrollmentRepo]', error)` — ห้าม catch silently
4. Workers: `throw error` → QStash retry
5. Redis cache bust ทุกครั้งที่ write: enrollment, schedule, package
6. ใช้ `prisma.$transaction` สำหรับ: createEnrollment, checkIn, checkAndComplete
7. ห้าม hardcode `tenantId` — ดึงจาก `request.headers.get('x-tenant-id')`
8. IDs: `ENR-[YYYYMMDD]-[SERIAL]`, `SCH-[YYYYMMDD]-[SERIAL]`, `CERT-[TENANT_CODE]-[YYYY]-[SEQ]`
9. Check-in QR token: expiry 30 min, idempotent (@@unique constraint)
10. Component max 500 LOC — ถ้าเกินให้ split

---

## Done Checklist

หลัง implement แต่ละ phase ตรวจสอบ:

**P0:**
- [ ] Schema เพิ่ม models ครบ (Package tenantId, Enrollment lifecycle, EnrollmentItem, ClassAttendance, Certificate, PackageGift)
- [ ] enrollmentRepo: createEnrollment ใช้ $transaction
- [ ] checkIn ใช้ $transaction + idempotent
- [ ] checkAndCompleteEnrollments ตรวจ Certificate unique ก่อน insert
- [ ] Workers throw error ท้ายสุด
- [ ] vercel.json มี 2 cron entries
- [ ] ทุก API route มี tenantId check

**P1:**
- [ ] Enrollment list แสดง progress bar (hoursCompleted / package.hours)
- [ ] Calendar แสดงสีตาม capacity
- [ ] QR ใช้ token ที่ expire ได้
- [ ] RBAC: New/Confirm/Cancel ตรวจ can(roles, 'enrollment', action)

---

## เริ่มต้นด้วย

1. อ่าน `CLAUDE.md` + `prisma/schema.prisma` + `docs/product/specs/FEAT07-ENROLLMENT.md`
2. เริ่มที่ **P0-01** (schema) → แจ้ง Boss รัน `prisma db push`
3. ต่อ **P0-02** (enrollmentRepo rewrite)
4. ต่อ **P0-03** (API routes)
5. ต่อ **P0-04** (workers + vercel.json)
6. ต่อ **P1** (UI pages)

**แต่ละ phase ที่เสร็จ: แจ้ง Boss ก่อน commit — อย่า commit ข้ามขั้น**
