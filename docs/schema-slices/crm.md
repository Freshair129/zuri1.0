# Schema: CRM

## Models
```prisma
model Customer {
  id              String    @id @default(uuid())
  customerId      String    @unique @map("customer_id")
  tenantId        String    @map("tenant_id")
  status          String    @default("Active")
  membershipTier  String    @default("MEMBER") @map("membership_tier")
  lifecycleStage  String    @default("LEAD") @map("lifecycle_stage")
  email           String?
  phonePrimary    String?   @map("phone_primary")
  phoneSecondary  String?   @map("phone_secondary")
  lineId          String?   @map("line_id")
  facebookId      String?   @unique @map("facebook_id")
  facebookName    String?   @map("facebook_name")
  originId        String?   @map("origin_id")
  walletBalance   Float     @default(0) @map("wallet_balance")
  walletPoints    Int       @default(0) @map("wallet_points")
  intentScore     Int       @default(0) @map("intent_score")
  churnScore      Int       @default(0) @map("churn_score")
  intelligence    Json?
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  tenant        Tenant         @relation(fields: [tenantId], references: [id])
  conversations Conversation[]
  orders        Order[]
  enrollments   Enrollment[]
  profile       CustomerProfile?
  insight       CustomerInsight?

  @@index([tenantId])
  @@index([phonePrimary])
  @@map("customers")
}
```

```prisma
model CustomerProfile {
  id             String    @id @default(uuid())
  customerId     String    @unique @map("customer_id")
  gender         String?
  ageRange       String?   @map("age_range")
  hasChildren    Boolean?  @map("has_children")
  occupation     String?
  educationLevel String?   @map("education_level")
  location       String?
  cookingLevel   String?   @map("cooking_level")
  motivation     String[]  @default([])
  budgetSignal   String?   @map("budget_signal")
  inferenceCount Int       @default(0) @map("inference_count")
  lastInferredAt DateTime? @map("last_inferred_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("customer_profiles")
}
```

```prisma
model CustomerInsight {
  id             String    @id @default(uuid())
  tenantId       String    @map("tenant_id")
  customerId     String    @unique @map("customer_id")
  interests      String[]  @default([])
  objections     String[]  @default([])
  commStyle      String?   @map("comm_style")
  keyFacts       String[]  @map("key_facts") @default([])
  summary        String?   @db.Text
  contactPref    String?   @map("contact_pref")
  manualOverride Json?     @map("manual_override") 
  enrichedAt     DateTime  @default(now()) @map("enriched_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("customer_insights")
}
```

```prisma
model TenantCRMPattern {
  id              String   @id @default(uuid())
  tenantId        String   @unique @map("tenant_id")
  topObjections   Json     @default("[]") @map("top_objections")
  topInterests    Json     @default("[]") @map("top_interests")
  conversionTips  Json     @default("[]") @map("conversion_tips")
  bestAdSegments  Json?    @map("best_ad_segments")
  computedAt      DateTime @default(now()) @map("computed_at")

  @@map("tenant_crm_patterns")
}
```

## Cross-domain FKs
- Customer.tenantId -> Tenant (shared)
- Customer.conversations -> Conversation (inbox)
- Customer.orders -> Order (pos)
- Customer.enrollments -> Enrollment (enrollment)
