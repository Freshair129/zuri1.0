# Schema: PROCUREMENT

## Models
```prisma
model Supplier {
  id           String   @id @default(uuid())
  supplierId   String   @unique @map("supplier_id")
  tenantId     String   @map("tenant_id")
  name         String
  contactName  String?  @map("contact_name")
  phone        String?
  email        String?
  address      String?  @db.Text
  taxId        String?  @map("tax_id")
  paymentTerms String   @default("NET_30") @map("payment_terms")
  currency     String   @default("THB")
  isActive     Boolean  @default(true) @map("is_active")
  notes        String?  @db.Text
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  purchaseOrders PurchaseOrderV2[]

  @@index([tenantId])
  @@map("suppliers")
}
```

```prisma
model PurchaseRequest {
  id            String   @id @default(uuid())
  requestId     String   @unique @map("request_id")
  tenantId      String   @map("tenant_id")
  requestedById String   @map("requested_by_id")
  status        String   @default("DRAFT")
  note          String?  @db.Text
  neededBy      DateTime? @map("needed_by")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  items         PurchaseRequestItem[]

  @@index([tenantId])
  @@map("purchase_requests")
}
```

```prisma
model PurchaseRequestItem {
  id              String  @id @default(uuid())
  requestId       String  @map("request_id")
  productId       String  @map("product_id")
  productType     String  @map("product_type")
  qtyRequested    Float   @map("qty_requested")
  unit            String  @default("unit")
  estimatedUnitCost Float? @map("estimated_unit_cost")
  note            String?

  request         PurchaseRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@unique([requestId, productId, productType])
  @@map("purchase_request_items")
}
```

```prisma
model PurchaseOrderV2 {
  id                   String    @id @default(uuid())
  poId                 String    @unique @map("po_id")
  tenantId             String    @map("tenant_id")
  supplierId           String    @map("supplier_id")
  requestId            String?   @map("request_id")
  requestedById        String    @map("requested_by_id")
  status               String    @default("DRAFT")
  warehouseId          String?   @map("warehouse_id")
  expectedDeliveryDate DateTime? @map("expected_delivery_date")
  actualDeliveryDate   DateTime? @map("actual_delivery_date")
  totalAmount          Float     @default(0) @map("total_amount")
  vatAmount            Float     @default(0) @map("vat_amount")
  grandTotal           Float     @default(0) @map("grand_total")
  currency             String    @default("THB")
  paymentMethod        String?   @map("payment_method")
  paymentRef           String?   @map("payment_ref")
  notes                String?   @db.Text
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  supplier             Supplier @relation(fields: [supplierId], references: [id])
  items                POItem[]
  approvals            POApproval[]
  grns                 GoodsReceivedNote[]
  tracking             POTracking[]

  @@index([tenantId])
  @@index([supplierId])
  @@index([status])
  @@map("purchase_orders_v2")
}
```

```prisma
model POItem {
  id          String  @id @default(uuid())
  poId        String  @map("po_id")
  productId   String  @map("product_id")
  productType String  @map("product_type")
  productName String  @map("product_name")
  unit        String  @default("unit")
  qtyOrdered  Float   @map("qty_ordered")
  unitCost    Float   @map("unit_cost")
  vatPct      Float   @default(7) @map("vat_pct")
  lineTotal   Float   @map("line_total")
  qtyReceived Float   @default(0) @map("qty_received")
  note        String?

  po          PurchaseOrderV2 @relation(fields: [poId], references: [id], onDelete: Cascade)

  @@unique([poId, productId, productType])
  @@map("po_items")
}
```

```prisma
model POApproval {
  id         String   @id @default(uuid())
  poId       String   @map("po_id")
  tenantId   String   @map("tenant_id")
  approverId String   @map("approver_id")
  action     String
  note       String?  @db.Text
  createdAt  DateTime @default(now()) @map("created_at")

  po         PurchaseOrderV2 @relation(fields: [poId], references: [id], onDelete: Cascade)

  @@index([poId])
  @@index([tenantId])
  @@map("po_approvals")
}
```

```prisma
model POAcceptance {
  id         String   @id @default(uuid())
  poId       String   @unique @map("po_id")
  tenantId   String   @map("tenant_id")
  acceptedAt DateTime @map("accepted_at")
  acceptedBy String   @map("accepted_by")
  note       String?  @db.Text
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("po_acceptances")
}
```

```prisma
model POTracking {
  id               String    @id @default(uuid())
  poId             String    @map("po_id")
  tenantId         String    @map("tenant_id")
  carrier          String?
  trackingNumber   String?   @map("tracking_number")
  estimatedArrival DateTime? @map("estimated_arrival")
  status           String    @default("IN_TRANSIT")
  note             String?   @db.Text
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  po               PurchaseOrderV2 @relation(fields: [poId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("po_tracking")
}
```

```prisma
model GoodsReceivedNote {
  id           String   @id @default(uuid())
  grnId        String   @unique @map("grn_id")
  tenantId     String   @map("tenant_id")
  poId         String   @map("po_id")
  warehouseId  String   @map("warehouse_id")
  receivedById String   @map("received_by_id")
  receivedAt   DateTime @default(now()) @map("received_at")
  status       String   @default("DRAFT")
  note         String?  @db.Text
  createdAt    DateTime @default(now()) @map("created_at")

  items        GRNItem[]
  po           PurchaseOrderV2 @relation(fields: [poId], references: [id])

  @@index([tenantId])
  @@index([poId])
  @@map("goods_received_notes")
}
```

```prisma
model GRNItem {
  id          String    @id @default(uuid())
  grnId       String    @map("grn_id")
  productId   String    @map("product_id")
  productType String    @map("product_type")
  qtyReceived Float     @map("qty_received")
  unitCost    Float     @map("unit_cost")
  batchNumber String?   @map("batch_number")
  expiresAt   DateTime? @map("expires_at")
  note        String?

  grn         GoodsReceivedNote @relation(fields: [grnId], references: [id], onDelete: Cascade)

  @@unique([grnId, productId])
  @@map("grn_items")
}
```

## Cross-domain FKs
- PurchaseRequestItem.requestId -> PurchaseRequest (procurement)
- PurchaseOrderV2.supplierId -> Supplier (procurement)
- POItem.poId -> PurchaseOrderV2 (procurement)
- POApproval.poId -> PurchaseOrderV2 (procurement)
- POTracking.poId -> PurchaseOrderV2 (procurement)
- GoodsReceivedNote.poId -> PurchaseOrderV2 (procurement)
- GRNItem.grnId -> GoodsReceivedNote (procurement)
