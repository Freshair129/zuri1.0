# Schema: TASKS

## Models
```prisma
model Task {
  id          String    @id @default(uuid())
  taskId      String    @unique @map("task_id")
  customerId  String?   @map("customer_id")
  assigneeId  String?   @map("assignee_id")
  createdById String?   @map("created_by_id")
  title       String
  description String?   @db.Text
  type        String    @default("FOLLOW_UP")
  status      String    @default("PENDING")
  priority    String    @default("L3")
  taskType    String    @default("SINGLE") @map("task_type")
  dueDate     DateTime? @map("due_date")
  startDate   DateTime? @map("start_date")
  timeStart   String?   @map("time_start")
  timeEnd     String?   @map("time_end")
  milestones  Json?
  completedAt DateTime? @map("completed_at")
  notionId    String?   @map("notion_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("tasks")
}
```

## Cross-domain FKs
- Task.customerId -> Customer (crm)
