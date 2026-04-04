# Schema: POS

## Models
```prisma
model Order {
  id             String   @id @default(uuid())
  orderId        String   @unique @map("order_id")
  customerId     String   @map("customer_id")
  closedById     String?  @map("closed_by_id")
  conversationId String?  @map("conversation_id")
  status         String   @default("PENDING")
  orderType      String   @default("ONLINE") @map("order_type")
  totalAmount    Float    @default(0) @map("total_amount")
  paidAmount     Float    @default(0) @map("paid_amount")
  discountAmount Float    @default(0) @map("discount_amount")
  paymentMethod  String?  @map("payment_method")
  items          Json     @default("[]")
  notes          String?  @db.Text
  date           DateTime @default(now())
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  customer     Customer      @relation(fields: [customerId], references: [id])
  transactions Transaction[]

  @@map("orders")
}
```

```prisma
model Transaction {
  id            String   @id @default(uuid())
  transactionId String   @unique @map("transaction_id")
  orderId       String   @map("order_id")
  amount        Float
  type          String   @default("PAYMENT")
  method        String   @default("Transfer")
  slipStatus    String   @default("PENDING") @map("slip_status")
  slipData      Json?    @map("slip_data")
  slipUrl       String?  @map("slip_url")
  refNumber     String?  @unique @map("ref_number")
  date          DateTime @default(now())
  createdAt     DateTime @default(now()) @map("created_at")

  order Order @relation(fields: [orderId], references: [id])

  @@map("transactions")
}
```

```prisma
model Product {
  id                  String  @id @default(uuid())
  productId           String  @unique @map("product_id")
  name                String
  category            String
  fallbackSubCategory String? @map("fallback_sub_category")
  basePrice           Float   @default(0) @map("base_price")
  hours               Float?
  sessionType         String? @map("session_type")
  isActive            Boolean @default(true) @map("is_active")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  enrollments Enrollment[]
  schedules   CourseSchedule[]

  @@map("products")
}
```

## Cross-domain FKs
- Order.customerId -> Customer (crm)
- Transaction.orderId -> Order (pos)

## Reference Stubs (fields ที่ pos agent ใช้บ่อย)

```prisma
// Customer (crm) — stub สำหรับ JOIN/filter ใน pos queries (loyalty, discount, wallet)
model Customer {
  id             String  // FK target ใน Order.customerId
  customerId     String  @unique
  tenantId       String
  status         String  // "Active" | "Inactive" | "Blocked"
  membershipTier String  // "MEMBER" | "VIP" | "PLATINUM" — ใช้คำนวณ discount tier
  walletBalance  Float   // ยอดเงินใน wallet สำหรับ payment method "Wallet"
  walletPoints   Int     // loyalty points สะสม
  // ดู full model ที่ docs/schema-slices/crm.md
}
```
