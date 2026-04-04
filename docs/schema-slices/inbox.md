# Schema: INBOX

## Models
```prisma
model Conversation {
  id              String    @id @default(uuid())
  conversationId  String    @unique @map("conversation_id")
  tenantId        String    @map("tenant_id")
  customerId      String?   @map("customer_id")
  participantId   String?   @map("participant_id")
  channel         String    @default("facebook")
  firstTouchAdId  String?   @map("first_touch_ad_id")
  assigneeId      String?   @map("assignee_id")
  status          String    @default("open")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  tenant   Tenant    @relation(fields: [tenantId], references: [id])
  customer Customer? @relation(fields: [customerId], references: [id])
  messages Message[]
  analyses ConversationAnalysis[]

  @@index([tenantId])
  @@index([customerId])
  @@map("conversations")
}
```

```prisma
model Message {
  id             String   @id @default(uuid())
  messageId      String   @unique @map("message_id")
  conversationId String   @map("conversation_id")
  sender         String
  content        String?  @db.Text
  attachments    Json?
  responderId    String?  @map("responder_id")
  createdAt      DateTime @default(now()) @map("created_at")

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@map("messages")
}
```

## Cross-domain FKs
- Conversation.tenantId -> Tenant (shared)
- Conversation.customerId -> Customer (crm)
- Conversation.analyses -> ConversationAnalysis (marketing)

## Reference Stubs (fields ที่ inbox agent ใช้บ่อย)

```prisma
// Customer (crm) — stub สำหรับ JOIN/filter ใน inbox queries
model Customer {
  id             String  // FK target
  customerId     String  @unique
  tenantId       String
  status         String  // "Active" | "Inactive" | "Blocked"
  membershipTier String  // "MEMBER" | "VIP" | "PLATINUM"
  lifecycleStage String  // "LEAD" | "PROSPECT" | "CUSTOMER" | "CHURNED"
  facebookId     String? @unique
  facebookName   String?
  lineId         String?
  walletBalance  Float
  intentScore    Int
  churnScore     Int
  // ดู full model ที่ docs/schema-slices/crm.md
}
```
