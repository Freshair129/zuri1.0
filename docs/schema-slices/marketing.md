# Schema: MARKETING

## Models
```prisma
model Ad {
  id          String   @id @default(uuid())
  adId        String   @unique @map("ad_id")
  adSetId     String?  @map("ad_set_id")
  name        String
  status      String   @default("ACTIVE")
  spend       Float    @default(0)
  impressions Int      @default(0)
  clicks      Int      @default(0)
  revenue     Float    @default(0)
  roas        Float    @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  dailyMetrics AdDailyMetric[]

  @@map("ads")
}
```

```prisma
model AdDailyMetric {
  id          String   @id @default(uuid())
  adId        String   @map("ad_id")
  date        DateTime
  spend       Float    @default(0)
  impressions Int      @default(0)
  clicks      Int      @default(0)
  leads       Int      @default(0)
  purchases   Int      @default(0)
  revenue     Float    @default(0)
  roas        Float    @default(0)
  createdAt   DateTime @default(now()) @map("created_at")

  ad Ad @relation(fields: [adId], references: [adId])

  @@unique([adId, date])
  @@map("ad_daily_metrics")
}
```

```prisma
model ConversationAnalysis {
  id             String   @id @default(uuid())
  conversationId String   @map("conversation_id")
  analyzedDate   DateTime @map("analyzed_date")
  analyzedAt     DateTime @default(now()) @map("analyzed_at")
  contactType    String   @map("contact_type")
  state          String
  cta            String
  revenue        Float    @default(0)
  sourceAdId     String?  @map("source_ad_id")
  tags           String[]
  summary        String   @db.Text
  rawOutput      Json?    @map("raw_output")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@unique([conversationId, analyzedDate])
  @@index([analyzedDate])
  @@index([contactType])
  @@index([state])
  @@map("conversation_analyses")
}
```

```prisma
model DailyBrief {
  id                 String    @id @default(uuid())
  briefDate          DateTime  @unique @map("brief_date")
  totalConversations Int       @default(0) @map("total_conversations")
  totalContacts      Int       @default(0) @map("total_contacts")
  totalLeads         Int       @default(0) @map("total_leads")
  totalCustomers     Int       @default(0) @map("total_customers")
  closedWon          Int       @default(0) @map("closed_won")
  totalRevenue       Float     @default(0) @map("total_revenue")
  hotLeads           Int       @default(0) @map("hot_leads")
  considering        Int       @default(0) @map("considering")
  closedLost         Int       @default(0) @map("closed_lost")
  topCtas            Json      @default("[]") @map("top_ctas")
  adBreakdown        Json      @default("{}") @map("ad_breakdown")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@map("daily_briefs")
}
```

## Cross-domain FKs
- ConversationAnalysis.conversationId -> Conversation (inbox)
- Ad.sourceAdId (via ConversationAnalysis.sourceAdId) -> Ad (marketing)

## Reference Stubs (fields ที่ marketing agent ใช้บ่อย)

```prisma
// Customer (crm) — stub สำหรับ attribution และ lead scoring ใน marketing queries
model Customer {
  id             String  // FK target (via Conversation.customerId)
  customerId     String  @unique
  tenantId       String
  status         String  // "Active" | "Inactive" | "Blocked"
  lifecycleStage String  // "LEAD" | "PROSPECT" | "CUSTOMER" | "CHURNED" — ใช้ funnel analysis
  intentScore    Int     // 0-100 — ใช้ hot lead classification
  churnScore     Int     // 0-100 — ใช้ retention analysis
  facebookId     String? @unique  // สำหรับ match กับ Ad audience
  facebookName   String?
  // ดู full model ที่ docs/schema-slices/crm.md
}
```

```prisma
// Conversation (inbox) — stub สำหรับ revenue attribution ใน marketing queries
model Conversation {
  id              String  // FK target ใน ConversationAnalysis.conversationId
  conversationId  String  @unique
  tenantId        String
  customerId      String? // -> Customer.id
  channel         String  // "facebook" | "line"
  firstTouchAdId  String? // first ad ที่ trigger การติดต่อ — ใช้ attribution
  status          String  // "open" | "closed"
  // ดู full model ที่ docs/schema-slices/inbox.md
}
```