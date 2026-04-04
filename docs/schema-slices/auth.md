# Schema: AUTH

## Models
```prisma
model Employee {
  id           String    @id @default(uuid())
  employeeId   String    @unique @map("employee_id")
  tenantId     String    @map("tenant_id")
  firstName    String    @map("first_name")
  lastName     String    @map("last_name")
  nickName     String?   @map("nick_name")
  email        String    @unique
  phone        String?
  department   String?
  jobTitle     String?   @map("job_title")
  role         String    @default("STF")
  roles        String[]  @default(["STF"])
  status       String    @default("ACTIVE")
  passwordHash String    @map("password_hash")
  hiredAt      DateTime? @map("hired_at")
  lastLoginAt  DateTime? @map("last_login_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@map("employees")
}
```

## Cross-domain FKs
- Employee.tenantId -> Tenant (shared)
