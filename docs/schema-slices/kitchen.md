# Schema: KITCHEN

## Models
```prisma
model Ingredient {
  id           String  @id @default(uuid())
  ingredientId String  @unique @map("ingredient_id")
  name         String
  unit         String  @default("g")
  currentStock Float   @default(0) @map("current_stock")
  minStock     Float   @default(0) @map("min_stock")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  lots IngredientLot[]

  @@map("ingredients")
}
```

```prisma
model IngredientLot {
  id           String   @id @default(uuid())
  lotId        String   @unique @map("lot_id")
  ingredientId String   @map("ingredient_id")
  initialQty   Float    @map("initial_qty")
  remainingQty Float    @map("remaining_qty")
  expiresAt    DateTime @map("expires_at")
  status       String   @default("ACTIVE")
  createdAt    DateTime @default(now()) @map("created_at")

  ingredient Ingredient @relation(fields: [ingredientId], references: [id])

  @@index([ingredientId, expiresAt])
  @@map("ingredient_lots")
}
```

```prisma
model Warehouse {
  id          String   @id @default(uuid())
  warehouseId String   @unique @map("warehouse_id")
  tenantId    String   @map("tenant_id")
  name        String
  location    String?
  type        String   @default("MAIN")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  stocks      WarehouseStock[]
  movements   StockMovement[]
  stockCounts StockCount[]

  @@index([tenantId])
  @@map("warehouses")
}
```

```prisma
model WarehouseStock {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  warehouseId String   @map("warehouse_id")
  productId   String   @map("product_id")
  productType String   @map("product_type")
  qty         Float    @default(0)
  unit        String   @default("unit")
  reorderPoint Float?  @map("reorder_point")
  lastMovedAt DateTime? @map("last_moved_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  warehouse   Warehouse @relation(fields: [warehouseId], references: [id])

  @@unique([tenantId, warehouseId, productId, productType])
  @@index([tenantId])
  @@index([warehouseId])
  @@map("warehouse_stocks")
}
```

```prisma
model StockMovement {
  id            String   @id @default(uuid())
  movementId    String   @unique @map("movement_id")
  tenantId      String   @map("tenant_id")
  warehouseId   String   @map("warehouse_id")
  productId     String   @map("product_id")
  productType   String   @map("product_type")
  type          String
  qty           Float
  unitCost      Float?   @map("unit_cost")
  referenceId   String?  @map("reference_id")
  referenceType String?  @map("reference_type")
  performedById String?  @map("performed_by_id")
  note          String?  @db.Text
  createdAt     DateTime @default(now()) @map("created_at")

  warehouse     Warehouse @relation(fields: [warehouseId], references: [id])

  @@index([tenantId])
  @@index([warehouseId])
  @@index([productId])
  @@index([referenceId])
  @@map("stock_movements")
}
```

```prisma
model StockCount {
  id           String    @id @default(uuid())
  countId      String    @unique @map("count_id")
  tenantId     String    @map("tenant_id")
  warehouseId  String    @map("warehouse_id")
  status       String    @default("DRAFT")
  scheduledDate DateTime? @map("scheduled_date")
  completedAt  DateTime? @map("completed_at")
  completedById String?  @map("completed_by_id")
  note         String?   @db.Text
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  items        StockCountItem[]
  warehouse    Warehouse @relation(fields: [warehouseId], references: [id])

  @@index([tenantId])
  @@map("stock_counts")
}
```

```prisma
model StockCountItem {
  id          String  @id @default(uuid())
  countId     String  @map("count_id")
  productId   String  @map("product_id")
  productType String  @map("product_type")
  expectedQty Float   @map("expected_qty")
  countedQty  Float?  @map("counted_qty")
  varianceQty Float?  @map("variance_qty")
  note        String?

  stockCount  StockCount @relation(fields: [countId], references: [id], onDelete: Cascade)

  @@unique([countId, productId, productType])
  @@map("stock_count_items")
}
```

## Cross-domain FKs
- IngredientLot.ingredientId -> Ingredient (kitchen)
- WarehouseStock.warehouseId -> Warehouse (kitchen)
- StockMovement.warehouseId -> Warehouse (kitchen)
- StockCount.warehouseId -> Warehouse (kitchen)
