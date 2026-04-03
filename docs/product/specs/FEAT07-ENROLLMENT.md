# FEAT-ENROLLMENT — Zuri Enrollment & Class Management Module

**Status:** APPROVED
**Version:** 1.0.0
**Date:** 2026-03-30
**Author:** Boss (Product Owner)
**Reviewer:** Claude (Architect)

---

## 1. Overview

Enrollment module สำหรับโรงเรียนสอนทำอาหารและ culinary business รองรับตั้งแต่การจัดการ Course/Package catalog, การสมัครเรียน, การจัดตารางเรียน (class scheduling), ไปจนถึงการติดตาม attendance และออก certificate โดยอัตโนมัติ

**Core value:** "ลูกค้าจ่ายเงิน → ระบบดูแลทุกอย่าง — ตั้งแต่สมัครจนจบหลักสูตร"

**ขอบเขต module:**
- Course & Package Catalog (สิ่งที่ขาย)
- Enrollment Lifecycle (PENDING → COMPLETED)
- Class Schedule & Calendar (จัดตาราง, calendar view)
- Attendance Tracking (QR check-in, auto-absent)
- Certificate Generation (auto เมื่อครบชั่วโมง)
- Gift Enrollment & Group Enrollment

**Integration จำเป็น:**
- POS/Billing → สร้าง Order ก่อน Enrollment
- CRM → ข้อมูลลูกค้า (customerId)
- Kitchen Ops → CourseMenu (recipe list per course)
- Pusher → realtime update เมื่อ schedule เปลี่ยน

---

## 2. Terminology

| คำศัพท์ | คำอธิบาย |
|---|---|
| **Package** | สิ่งที่ขายให้ลูกค้า — อาจประกอบด้วยหลาย Course เช่น "Bakery Pro Package 20 hrs" |
| **Course** | รายวิชา/หลักสูตรย่อย เช่น "Croissant", "French Bread" มี recipe และตาราง schedule |
| **Enrollment** | บันทึกการสมัครเรียนของลูกค้า 1 คน ต่อ 1 Package |
| **EnrollmentItem** | ลิงก์ระหว่าง Enrollment กับ Course เฉพาะ พร้อม track ชั่วโมงที่เรียนไปแล้ว |
| **CourseSchedule** | ตารางเรียน 1 class — วันที่, เวลา, ห้อง, instructor, จำนวนที่นั่ง |
| **ClassAttendance** | บันทึก check-in ของนักเรียนต่อ 1 schedule |
| **Certificate** | ใบประกาศนียบัตร ออกอัตโนมัติเมื่อ student ครบชั่วโมงที่กำหนด |
| **PackageGift** | Package ที่ผู้ซื้อ (buyer) ≠ ผู้เรียน (student) |
| **PackageEnrollment** | Group enrollment — 1 order ครอบคลุมหลายคน |
| **Instructor** | ผู้สอน อ้างอิงจาก Employee (MANAGER module) หรือกรอก string ก็ได้ |

---

## 3. Feature Breakdown

### 3.1 Course & Package Catalog

**Package** คือหน่วยที่ขาย มีราคา จำนวนชั่วโมง และ Course ที่รวมอยู่

```
Package
  ├── name        (string)
  ├── price       (decimal, THB)
  ├── hours       (int — ชั่วโมงทั้งหมดที่ได้)
  ├── category    (string เช่น "Bakery", "Pastry", "Thai")
  ├── description (text)
  ├── imageUrl    (string)
  ├── isActive    (boolean)
  ├── tenantId
  └── courses[]   (via PackageCourse join table)

Course
  ├── name        (string)
  ├── description (text)
  ├── hours       (int — ชั่วโมงของ course นี้)
  ├── recipes[]   (via CourseMenu — link to Kitchen module)
  ├── equipment[] (via CourseEquipment)
  ├── schedules[] (CourseSchedule)
  └── tenantId
```

**Business rules:**
- Package สามารถมี Course ได้มากกว่า 1 วิชา
- Course เดียวกันสามารถอยู่ใน Package หลายอันได้
- ปิด Package (isActive = false) จะไม่แสดงใน catalog แต่ Enrollment ที่มีอยู่ยังคงใช้งานได้
- ราคา Package คือ final price — ไม่คำนวณจาก Course ย่อย

### 3.2 Enrollment Lifecycle

```
Customer ชำระเงินผ่าน POS/Billing
  → Order สร้างขึ้น (orderId ผูกกับ Enrollment)
  → POST /api/enrollment/create
  → Enrollment สร้างพร้อม status = PENDING
  → Staff confirm → status = CONFIRMED
  → นักเรียนเริ่มเรียน class แรก → status = IN_PROGRESS (auto)
  → ชั่วโมงครบตามที่กำหนด → status = COMPLETED (auto)
  → Certificate ออกอัตโนมัติ
  → ยกเลิก (refund/cancel) → status = CANCELLED
```

**Enrollment Statuses:**

| Status | ความหมาย | Trigger |
|---|---|---|
| `PENDING` | รอ confirm จาก staff | สร้างใหม่หลังจ่ายเงิน |
| `CONFIRMED` | Staff ยืนยันแล้ว พร้อมจัดตาราง | Staff action |
| `IN_PROGRESS` | นักเรียน attend class ครั้งแรก | Auto เมื่อมี attendance แรก |
| `COMPLETED` | เรียนครบชั่วโมงที่กำหนด | Auto เมื่อ hoursCompleted >= package.hours |
| `CANCELLED` | ยกเลิก | Staff / refund flow |

**EnrollmentItem** — 1 row ต่อ Course ใน Enrollment:
```
EnrollmentItem
  ├── enrollmentId
  ├── courseId
  ├── hoursCompleted  (decimal — อัพเดทหลัง attendance แต่ละ class)
  └── status          (PENDING / IN_PROGRESS / COMPLETED)
```

### 3.3 Class Schedule & Calendar

**CourseSchedule** คือ class 1 ครั้ง:
```
CourseSchedule
  ├── courseId
  ├── date          (date)
  ├── startTime     (time)
  ├── endTime       (time)
  ├── instructor    (string หรือ employeeId)
  ├── maxStudents   (int)
  ├── room          (string)
  ├── tenantId
  └── enrolledCount (computed — จาก ClassAttendance)
```

**Calendar View:**
- แสดงแบบ monthly / weekly view
- Drag-and-drop ย้าย schedule (เฉพาะ MANAGER, KITCHEN)
- สีตาม status: ว่าง (เขียว), เกือบเต็ม (เหลือง), เต็ม (แดง)
- Filter ตาม instructor, room, course
- รองรับ conflict detection — ห้ามจอง instructor/room ซ้ำช่วงเวลาเดียวกัน

**Capacity management:**
- เมื่อ enrolled students = maxStudents → ปิดรับอัตโนมัติ (status = FULL)
- Waitlist: optional — เปิดปิดได้ระดับ tenant
- Staff ขยาย maxStudents ได้ด้วยตนเอง

### 3.4 Attendance Tracking

**QR Code Check-in Flow:**
```
Staff พิมพ์/แสดง QR code ต่อ class schedule
  → นักเรียน scan ด้วย phone (LINE Mini App หรือ browser)
  → POST /api/enrollment/attendance/checkin
      { enrollmentId, scheduleId, qrToken }
  → ระบบบันทึก ClassAttendance
      { status: PRESENT, checkedAt: now() }
  → hoursCompleted ใน EnrollmentItem อัพเดทอัตโนมัติ
  → Pusher event → calendar/dashboard realtime update
```

**Auto-absent Job (QStash):**
```
QStash cron ทุก 15 นาที → /api/workers/mark-absent
  → หา ClassAttendance ที่ schedule.endTime ผ่านไปแล้ว
    และยังไม่มี attendance record
  → สร้าง record ด้วย status = ABSENT
  → ไม่บวก hoursCompleted
```

**Attendance Statuses:**

| Status | ความหมาย |
|---|---|
| `PRESENT` | เข้าเรียน (QR scan สำเร็จ) |
| `ABSENT` | ไม่มา (auto-mark หลัง class จบ) |
| `LATE` | เข้าเรียนหลัง grace period (configurable เช่น 15 นาที) |
| `EXCUSED` | ขาดโดยมีเหตุผล (staff mark) |

**ClassAttendance:**
```
ClassAttendance
  ├── enrollmentId
  ├── scheduleId
  ├── checkedAt     (timestamp, null ถ้า ABSENT)
  ├── status        (PRESENT / ABSENT / LATE / EXCUSED)
  ├── note          (string — หมายเหตุจาก staff)
  └── tenantId
```

**Hours calculation:**
```
duration = (schedule.endTime - schedule.startTime) in hours
hoursCompleted += duration  // เฉพาะ PRESENT และ LATE
```

### 3.5 Certificate Generation

**Trigger:** Enrollment status เปลี่ยนเป็น `COMPLETED`

```
Worker /api/workers/check-completion (cron hourly)
  → Query Enrollment ที่ hoursCompleted >= package.hours
    และ status = IN_PROGRESS
  → Update Enrollment.status = COMPLETED
  → สร้าง Certificate record
  → Generate PDF certificate (Gemini + HTML template)
  → ส่งแจ้งนักเรียน (LINE + Email)
```

**Certificate:**
```
Certificate
  ├── enrollmentId  (unique)
  ├── issuedDate    (date)
  ├── certificateNumber  (format: CERT-{tenantCode}-{YYYY}-{seq})
  ├── pdfUrl        (Supabase Storage)
  └── tenantId
```

**Certificate Number format:**
- `CERT-VSCH-2026-00001` (V School, ปี 2026, ลำดับที่ 1)
- sequence reset ต่อปี ต่อ tenant

### 3.6 Gift Enrollment (PackageGift)

กรณีที่ผู้ซื้อ (buyer) ≠ ผู้เรียน (student) — เช่น ซื้อเป็นของขวัญ:

```
PackageGift
  ├── enrollmentId
  ├── buyerCustomerId   (ผู้ซื้อ)
  ├── studentName       (ชื่อผู้รับ — อาจไม่ใช่ customer ในระบบ)
  ├── studentPhone      (เบอร์ติดต่อผู้รับ)
  ├── studentEmail
  ├── giftMessage       (ข้อความในการ์ด)
  ├── redeemCode        (unique code สำหรับ activate)
  ├── redeemedAt        (timestamp)
  └── tenantId
```

**Flow:**
```
Buyer จ่ายเงิน → Order สร้าง → Enrollment สร้าง (status=PENDING)
  → PackageGift record สร้าง พร้อม redeemCode
  → ส่ง redeemCode ให้ buyer (SMS/LINE/Email)
  → Buyer ส่งต่อ code ให้ student
  → Student redeem code → ผูก studentId → status=CONFIRMED
```

### 3.7 Group Enrollment (PackageEnrollment)

สำหรับการสมัครหมู่ — 1 Order ครอบคลุมหลาย student:

```
PackageEnrollment
  ├── orderId
  ├── packageId
  ├── quantity          (จำนวน student)
  ├── tenantId
  └── courses[]         (via PackageEnrollmentCourse)

PackageEnrollmentCourse
  ├── packageEnrollmentId
  ├── courseId
  └── studentEnrollments[]  (Enrollment ย่อยต่อ student)
```

---

## 4. Data Flow

### 4.1 Normal Enrollment Flow

```
[POS/Billing] Order สร้าง + ชำระเงิน
       ↓
POST /api/enrollment/create
  { orderId, customerId, packageId, tenantId }
       ↓
[enrollmentRepository.create()]
  → Enrollment (PENDING)
  → EnrollmentItem per Course in Package
       ↓
Staff confirm (MANAGER)
  → PATCH /api/enrollment/{id}/confirm
  → status = CONFIRMED
       ↓
[Calendar] Staff จัด CourseSchedule
  → POST /api/enrollment/schedules
       ↓
[Attendance] นักเรียน QR scan
  → POST /api/enrollment/attendance/checkin
  → ClassAttendance สร้าง (PRESENT)
  → EnrollmentItem.hoursCompleted อัพเดท
  → Pusher push → dashboard
       ↓
[Worker] check-completion (hourly)
  → hoursCompleted >= package.hours?
  → Yes → Enrollment COMPLETED
        → Certificate สร้าง + PDF + notify
```

### 4.2 QStash Workers

| Worker | Path | Trigger | หน้าที่ |
|---|---|---|---|
| mark-absent | `/api/workers/mark-absent` | cron ทุก 15 นาที | Auto-mark ABSENT หลัง class จบ |
| check-completion | `/api/workers/check-completion` | cron hourly | ตรวจ hoursCompleted → COMPLETED + cert |
| send-reminders | `/api/workers/send-class-reminders` | cron 2x/day | แจ้งเตือนนักเรียน 1 วันก่อนเรียน |

---

## 5. Roles & Permissions

| Action | OWNER | MANAGER | SALES | KITCHEN | FINANCE | STAFF |
|---|---|---|---|---|---|---|
| ดู Package Catalog | Y | Y | Y | Y | Y | Y |
| สร้าง/แก้ไข Package | Y | Y | - | Y | - | - |
| สร้าง/แก้ไข Course | Y | Y | - | Y | - | - |
| สร้าง Enrollment | Y | Y | Y | - | - | - |
| Confirm Enrollment | Y | Y | - | - | - | - |
| Cancel Enrollment | Y | Y | - | - | - | - |
| จัด CourseSchedule | Y | Y | - | Y | - | - |
| แก้ไข Schedule (drag-drop) | Y | Y | - | Y | - | - |
| Mark Attendance (manual) | Y | Y | - | - | - | Y |
| ดู Attendance Report | Y | Y | - | Y | Y | Y |
| ดู Certificate | Y | Y | Y | Y | Y | Y |
| Re-issue Certificate | Y | Y | - | - | - | - |
| ดู Enrollment Report | Y | Y | Y | Y | Y | - |

**Permission check ใช้:** `can(session.roles, 'enrollment', action)` จาก `src/lib/permissionMatrix.js`

---

## 6. NFR

| รหัส | Requirement | Target |
|---|---|---|
| NFR-ENR-01 | QR check-in response time | < 1 วินาที (รวม DB write) |
| NFR-ENR-02 | Calendar API (load schedules) | < 500ms (Redis cache, TTL 5 min) |
| NFR-ENR-03 | Certificate PDF generation | < 10 วินาที (async worker) |
| NFR-ENR-04 | Auto-absent job | ทำงานภายใน 15 นาทีหลัง class จบ |
| NFR-ENR-05 | QStash retry | >= 5 retries (NFR3 global) |
| NFR-ENR-06 | Completion check accuracy | hoursCompleted ต้องแม่นยำ ± 0 (no double-count) |
| NFR-ENR-07 | Multi-tenant isolation | tenantId ใน where clause ทุก query |

**Redis cache keys:**
```
enrollment:schedules:{tenantId}:{month}  TTL 5 min
enrollment:summary:{tenantId}:{date}     TTL 1 min
enrollment:package-catalog:{tenantId}    TTL 10 min
```

---

## 7. Known Gotchas

### G1: Double Check-in Prevention
QR token ต้องเป็น short-lived (expiry 30 นาที) และ idempotent — check-in ซ้ำ schedule เดิมต้อง return 200 แต่ไม่สร้าง record ซ้ำ ป้องกัน hoursCompleted บวกเกิน

### G2: Timezone
ทุก date/time ต้องเก็บใน DB เป็น UTC และ display ใน Asia/Bangkok (UTC+7) ห้าม assume local time ใน server-side code

### G3: Schedule Conflict Detection
ก่อน save CourseSchedule ต้อง query ว่า instructor/room ถูก book ช่วงเวลานั้นหรือไม่ — ต้อง lock transaction ป้องกัน race condition เมื่อ staff 2 คน save พร้อมกัน

### G4: Enrollment ≠ Order Coupling
Order อาจมี line item หลายอัน (เช่น สั่ง Package 2 อัน) — 1 Order อาจสร้าง Enrollment มากกว่า 1 รายการ ต้อง map `orderId` + `packageId` ชัดเจน

### G5: Gift Enrollment — Student Identity
ผู้รับ gift อาจยังไม่มีบัญชีในระบบ ต้องรองรับ `studentName` + `studentPhone` เป็น anonymous ก่อน redeem แล้วค่อย bind กับ customerId ภายหลัง

### G6: Package Hours vs Course Hours
`Package.hours` = จำนวนชั่วโมงรวมที่นักเรียนต้องทำให้ครบ (สำหรับ certificate) ไม่จำเป็นต้องเท่ากับผลรวม `Course.hours` — เนื่องจากบาง Package อาจมี elective courses

### G7: Worker Idempotency
Worker `check-completion` ต้อง guard ไม่สร้าง Certificate ซ้ำ — check `Certificate.enrollmentId` unique constraint ก่อน insert เสมอ

---

## 8. Implementation Phases

| Phase ID | Task | Priority | Dependency |
|---|---|---|---|
| ENR-P0-01 | Prisma schema: Package, PackageCourse, Course, Enrollment, EnrollmentItem | P0 | — |
| ENR-P0-02 | Prisma schema: CourseSchedule, ClassAttendance, Certificate | P0 | ENR-P0-01 |
| ENR-P0-03 | Repository: enrollmentRepository.js (CRUD + status transitions) | P0 | ENR-P0-01 |
| ENR-P0-04 | Repository: scheduleRepository.js + attendanceRepository.js | P0 | ENR-P0-02 |
| ENR-P0-05 | API: POST /api/enrollment/create (ผูกกับ orderId) | P0 | ENR-P0-03 |
| ENR-P0-06 | API: PATCH /api/enrollment/[id]/confirm และ cancel | P0 | ENR-P0-03 |
| ENR-P0-07 | API: POST /api/enrollment/attendance/checkin (QR check-in) | P0 | ENR-P0-04 |
| ENR-P0-08 | QStash Worker: mark-absent (cron 15 min) | P0 | ENR-P0-04 |
| ENR-P0-09 | QStash Worker: check-completion + Certificate สร้าง | P0 | ENR-P0-02 |
| ENR-P1-01 | UI: Package Catalog management page (CRUD) | P1 | ENR-P0-01 |
| ENR-P1-02 | UI: Enrollment list + status dashboard | P1 | ENR-P0-05 |
| ENR-P1-03 | UI: Calendar view (monthly/weekly) สำหรับ CourseSchedule | P1 | ENR-P0-04 |
| ENR-P1-04 | UI: Drag-and-drop schedule editor | P1 | ENR-P1-03 |
| ENR-P1-05 | UI: Attendance sheet per class (manual override) | P1 | ENR-P0-07 |
| ENR-P1-06 | QR code generation per CourseSchedule | P1 | ENR-P0-07 |
| ENR-P1-07 | Certificate PDF template + generation | P1 | ENR-P0-09 |
| ENR-P1-08 | Pusher realtime: attendance event → calendar update | P1 | ENR-P0-07 |
| ENR-P1-09 | Redis cache: schedule + package catalog endpoints | P1 | ENR-P0-03 |
| ENR-P1-10 | QStash Worker: send-class-reminders (LINE + Email) | P1 | ENR-P0-08 |
| ENR-P2-01 | Gift Enrollment flow (PackageGift + redeem code) | P2 | ENR-P0-05 |
| ENR-P2-02 | Group Enrollment (PackageEnrollment + PackageEnrollmentCourse) | P2 | ENR-P0-05 |
| ENR-P2-03 | Enrollment Report (hours, completion rate, by instructor) | P2 | ENR-P1-02 |
| ENR-P2-04 | CourseEquipment management (ของใช้ในห้องเรียน) | P2 | ENR-P0-01 |
| ENR-P2-05 | Waitlist management (เมื่อ class เต็ม) | P2 | ENR-P1-03 |
| ENR-P2-06 | Re-schedule request flow (นักเรียนขอย้ายคลาส) | P2 | ENR-P1-04 |

---

## 9. Related

- `prisma/schema.prisma` — ต้องเพิ่ม models ทั้งหมดใน Section 3
- `src/lib/repositories/enrollmentRepository.js` — repository หลัก
- `src/lib/repositories/scheduleRepository.js` — calendar + schedule
- `src/lib/repositories/attendanceRepository.js` — check-in + reports
- `src/app/api/enrollment/` — API routes
- `src/app/api/workers/mark-absent/route.js` — QStash worker
- `src/app/api/workers/check-completion/route.js` — QStash worker
- `src/app/api/workers/send-class-reminders/route.js` — QStash worker
- `docs/product/specs/FEAT06-POS.md` — POS module (Order สร้างก่อน Enrollment)
- `docs/product/specs/FEAT03-BILLING.md` — Billing module
- `docs/decisions/adrs/` — ดู ADR-056 (multi-tenant), ADR-045 (RBAC)

**ADR Required ก่อน implement:**
- ADR-XXX: QR Check-in Token Strategy (JWT vs UUID vs short-code)
- ADR-XXX: Certificate PDF Generation (server-side HTML → PDF vs external service)
- ADR-XXX: Enrollment-Order Coupling (1:1 vs 1:N)

---

*Status: APPROVED 2026-03-30 by Boss*
