# Schema: ENROLLMENT

## Models
```prisma
model Enrollment {
  id           String   @id @default(uuid())
  enrollmentId String   @unique @map("enrollment_id")
  customerId   String   @map("customer_id")
  productId    String   @map("product_id")
  soldById     String?  @map("sold_by_id")
  totalPrice   Float    @default(0) @map("total_price")
  status       String   @default("ACTIVE")
  enrolledAt   DateTime @default(now()) @map("enrolled_at")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  customer Customer @relation(fields: [customerId], references: [id])
  product  Product  @relation(fields: [productId], references: [id])

  @@map("enrollments")
}
```

```prisma
model CourseSchedule {
  id                String   @id @default(uuid())
  scheduleId        String   @unique @map("schedule_id")
  productId         String   @map("product_id")
  instructorId      String?  @map("instructor_id")
  scheduledDate     DateTime @map("scheduled_date")
  startTime         String   @map("start_time")
  endTime           String   @map("end_time")
  maxStudents       Int      @default(10) @map("max_students")
  confirmedStudents Int      @default(0) @map("confirmed_students")
  status            String   @default("SCHEDULED")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  product Product @relation(fields: [productId], references: [id])

  @@map("course_schedules")
}
```

## Cross-domain FKs
- Enrollment.customerId -> Customer (crm)
- Enrollment.productId -> Product (pos)
- CourseSchedule.productId -> Product (pos)

## Reference Stubs (fields ที่ enrollment agent ใช้บ่อย)

```prisma
// Customer (crm) — stub สำหรับ JOIN/filter ใน enrollment queries
model Customer {
  id             String  // FK target ใน Enrollment.customerId
  customerId     String  @unique
  tenantId       String
  status         String  // "Active" | "Inactive" | "Blocked"
  membershipTier String  // "MEMBER" | "VIP" | "PLATINUM"
  // ดู full model ที่ docs/schema-slices/crm.md
}
```

```prisma
// Product (pos) — stub สำหรับ JOIN ใน enrollment queries (course info)
model Product {
  id          String  // FK target ใน Enrollment.productId + CourseSchedule.productId
  productId   String  @unique
  name        String
  category    String
  basePrice   Float
  hours       Float?  // จำนวนชั่วโมงคอร์ส
  sessionType String? // "GROUP" | "PRIVATE" | null
  isActive    Boolean
  // ดู full model ที่ docs/schema-slices/pos.md
}
```
