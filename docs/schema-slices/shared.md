# Schema: SHARED

## Models
```prisma
model Tenant {
  id         String   @id @default(uuid())
  tenantSlug String   @unique @map("tenant_slug")
  tenantName String   @map("tenant_name")
  lineOaId   String?  @map("line_oa_id")
  fbPageId   String?  @map("fb_page_id")
  plan       String   @default("STARTER")
  isActive   Boolean  @default(true) @map("is_active")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  employees     Employee[]
  customers     Customer[]
  conversations Conversation[]

  @@map("tenants")
}
```

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  tenantId  String?  @map("tenant_id")
  actor     String
  action    String
  target    String?
  details   Json?
  createdAt DateTime @default(now()) @map("created_at")

  @@index([tenantId])
  @@index([actor])
  @@index([action])
  @@map("audit_logs")
}
```

```prisma
model ApprovalWorkflow {
  id            String    @id @default(uuid())
  tenantId      String    @map("tenant_id")
  entityType    String    @map("entity_type")
  entityId      String    @map("entity_id")
  requestedById String    @map("requested_by_id")
  approverId    String?   @map("approver_id")
  status        String    @default("PENDING")
  level         Int       @default(1)
  note          String?   @db.Text
  decidedAt     DateTime? @map("decided_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@index([tenantId])
  @@index([entityType, entityId])
  @@index([approverId])
  @@map("approval_workflows")
}
```

## Cross-domain FKs
- AuditLog.tenantId -> Tenant (shared)
- ApprovalWorkflow.tenantId -> Tenant (shared)
