# Zuri Platform — API Reference

**Version:** 1.0
**Date:** 2026-04-02
**Base URL:** `/api`
**Auth:** All routes require NextAuth session (JWT) unless noted. Tenant resolved from `x-tenant-id` header via middleware.

---

## Conventions

| Convention | Detail |
|---|---|
| `[id]` | Route param (UUID) |
| `[date]` | Route param (YYYY-MM-DD) |
| Body | JSON unless noted as `multipart/form-data` |
| Response | `{ data: ... }` for success, `{ error: string }` for failure |
| Status 201 | Created |
| Status 400 | Bad request / missing required field |
| Status 403 | Insufficient role |
| Status 500 | Server error |

---

## Customers

### `GET /api/customers`
List customers for the tenant.

| Param | Type | Required | Default |
|---|---|---|---|
| page | query | no | 1 |
| limit | query | no | 20 |
| search | query | no | — |

**Response:** `{ data: Customer[], page, limit }`

---

### `POST /api/customers`
Create a new customer.

| Field | Type | Required |
|---|---|---|
| name | string | yes |
| phone | string | no |
| email | string | no |
| lineId | string | no |
| tags | string[] | no |
| notes | string | no |

**Response:** `{ data: Customer }` — 201

---

### `GET /api/customers/[id]`
Get customer detail.

**Response:** `{ data: Customer }`

---

### `PATCH /api/customers/[id]`
Update customer fields.

| Field | Type | Required |
|---|---|---|
| name | string | no |
| phone | string | no |
| email | string | no |
| lineId | string | no |
| tags | string[] | no |
| notes | string | no |
| stage | string | no |

**Response:** `{ data: Customer }`

---

### `GET /api/customers/[id]/profile`
Get inferred customer profile (behaviour + order history).

**Response:**
```json
{
  "data": {
    "customerId": "...",
    "orderCount": 4,
    "ltv": 12500,
    "averageOrderValue": 3125,
    "lastOrderDate": "2026-03-15",
    "segment": "loyal",
    "aiSummary": "..."
  }
}
```

---

## Conversations (Inbox)

### `GET /api/conversations`
List conversations.

| Param | Type | Required | Default | Values |
|---|---|---|---|---|
| page | query | no | 1 | — |
| limit | query | no | 20 | — |
| status | query | no | — | `open` \| `closed` \| `pending` |

**Response:** `{ data: Conversation[], page, limit }`
> Note: Each conversation includes `dbId` and `customerId` — required by Quick Sale (ChatPOS).

---

### `POST /api/conversations/[id]/reply`
Send a reply via FB Messenger or LINE.

| Field | Type | Required |
|---|---|---|
| message | string | no (required if no attachments) |
| attachments | object[] | no |

**Response:** `{ success: true }`

---

## Orders

### `GET /api/orders`
List orders.

| Param | Type | Required |
|---|---|---|
| page | query | no |
| limit | query | no |
| status | query | no |
| customerId | query | no |

**Response:** `{ data: Order[], page, limit }`

---

### `POST /api/orders`
Create a new order.

| Field | Type | Required |
|---|---|---|
| customerId | string | yes |
| items | OrderItem[] | yes |
| note | string | no |
| discountCode | string | no |
| shippingAddress | string | no |

**Response:** `{ data: Order }` — 201

---

## Products & Catalog

### `GET /api/products`
List products.

| Param | Type | Required |
|---|---|---|
| page | query | no |
| limit | query | no |
| category | query | no |

**Response:** `{ data: Product[], page, limit }`

---

### `POST /api/products`
Create a product.

| Field | Type | Required |
|---|---|---|
| name | string | yes |
| price | number | yes |
| sku | string | no |
| unit | string | no |
| category | string | no |
| description | string | no |
| imageUrl | string | no |

**Response:** `{ data: Product }` — 201

---

### `GET /api/catalog`
Return courses + packages for the tenant (used by POS and Quick Sale).

**Response:** `{ data: { courses, packages }, page, limit }`

---

## Payments & Invoices

### `POST /api/payments/verify-slip`
OCR a payment slip image and verify the amount.

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| slip | File | yes |
| amount | number | no |
| orderId | string | no |

**Response:**
```json
{
  "data": {
    "verified": true,
    "extractedAmount": 3500,
    "referenceNumber": "REF20260401XXXXX"
  }
}
```

---

### `POST /api/invoices`
Create an invoice for an order.

| Field | Type | Required |
|---|---|---|
| orderId | string | yes |
| dueDate | string | no |
| notes | string | no |

**Response:** `{ data: Invoice }` — 201

---

## Marketing & Ads

### `GET /api/marketing/dashboard`
Return ads metrics from DB (synced hourly — not live Graph API).

| Param | Type | Required |
|---|---|---|
| dateFrom | query | no |
| dateTo | query | no |
| campaignId | query | no |

**Response:**
```json
{
  "data": {
    "totalSpend": 15000,
    "totalImpressions": 120000,
    "totalClicks": 3400,
    "totalLeads": 82,
    "cpl": 182.9,
    "roas": 4.2,
    "campaigns": [...]
  }
}
```

---

### `GET /api/marketing/chat/conversations`
List conversations filtered for marketing context.

| Param | Type | Required |
|---|---|---|
| dbId | query | yes |
| customerId | query | no |

**Response:** `{ data: Conversation[] }`

---

### `PATCH /api/ads/optimize`
Pause or resume an ad campaign.

| Field | Type | Required | Values |
|---|---|---|---|
| campaignId | string | yes | — |
| adId | string | no | — |
| action | string | yes | `pause` \| `resume` |

**Response:** `{ success: true, action }`

---

## Daily Brief (DSB)

### `GET /api/daily-brief`
List daily brief summaries, most recent first.

| Param | Type | Required | Default |
|---|---|---|---|
| page | query | no | 1 |
| limit | query | no | 10 |

**Response:** `{ data: DailyBrief[], page, limit }`

---

### `GET /api/daily-brief/[date]`
Get daily brief for a specific date.

**Response:** `{ data: DailyBrief }`

---

## AI

### `POST /api/ai/ask`
Ask Gemini a question. Returns Server-Sent Events stream.

| Field | Type | Required |
|---|---|---|
| question | string | yes |
| systemContext | string | no |

**Response:** SSE stream — text chunks ending with `[DONE]`

---

### `POST /api/ai/compose-reply`
Draft a reply for a conversation using Gemini.

| Field | Type | Required | Values |
|---|---|---|---|
| conversationId | string | yes | — |
| tone | string | no | `professional` \| `friendly` \| `empathetic` |
| context | string | no | — |

**Response:** `{ data: { draft: string } }`

---

### `POST /api/ai/promo-advisor`
Promotion recommendations for a customer using Gemini.

| Field | Type | Required |
|---|---|---|
| customerId | string | yes |
| currentCart | object[] | no |
| availablePromotions | object[] | no |

**Response:** `{ data: { recommendations: object[] } }`

---

## Tasks

### `GET /api/tasks`
List tasks.

| Param | Type | Required | Values |
|---|---|---|---|
| page | query | no | — |
| limit | query | no | — |
| status | query | no | `todo` \| `in_progress` \| `done` |
| assigneeId | query | no | — |

**Response:** `{ data: Task[], page, limit }`

---

### `POST /api/tasks`
Create a task.

| Field | Type | Required |
|---|---|---|
| title | string | yes |
| description | string | no |
| assigneeId | string | no |
| dueDate | string | no |
| priority | string | no |
| relatedCustomerId | string | no |

**Response:** `{ data: Task }` — 201

---

### `GET /api/tasks/[id]`
Get task detail.

**Response:** `{ data: Task }`

---

### `PATCH /api/tasks/[id]`
Update a task.

| Field | Type |
|---|---|
| title | string |
| description | string |
| assigneeId | string |
| dueDate | string |
| priority | string |
| status | string |

**Response:** `{ data: Task }`

---

### `DELETE /api/tasks/[id]`
Archive/delete a task.

**Response:** `{ success: true }`

---

## Employees

### `GET /api/employees`
List employees.

| Param | Type | Default |
|---|---|---|
| page | query | 1 |
| limit | query | 20 |

**Response:** `{ data: Employee[], page, limit }`

---

### `POST /api/employees`
Create an employee.

| Field | Type | Required |
|---|---|---|
| name | string | yes |
| email | string | yes |
| role | string | yes |
| phone | string | no |
| lineId | string | no |

**Response:** `{ data: Employee }` — 201

---

## Kitchen — Recipes

### `GET /api/recipes`
List recipes.

| Param | Type | Required |
|---|---|---|
| page | query | no |
| limit | query | no |
| productId | query | no |

**Response:** `{ data: Recipe[], page, limit }`

---

### `POST /api/recipes`
Create a recipe.

| Field | Type | Required |
|---|---|---|
| productId | string | yes |
| yieldQty | number | yes |
| yieldUnit | string | no |
| ingredients | RecipeIngredient[] | yes |
| instructions | string | no |

**Response:** `{ data: Recipe }` — 201

---

## Kitchen — Schedules

### `GET /api/schedules/[id]`
Get schedule detail.

**Response:** `{ data: Schedule }`

---

### `POST /api/schedules/[id]`
Mark a schedule as complete (triggers FEFO stock deduction).

| Field | Type | Required |
|---|---|---|
| completedAt | string | no |
| actualQty | number | no |
| notes | string | no |

**Response:** `{ success: true, scheduleId }`

---

## Inventory

### `GET /api/inventory/stock`
Get current stock levels.

| Param | Type | Required |
|---|---|---|
| warehouseId | query | no |
| productId | query | no |
| lowStockOnly | query | no |

**Response:** `{ data: WarehouseStock[] }`

---

### `POST /api/inventory/movements`
Record a stock movement.

| Field | Type | Required | Values |
|---|---|---|---|
| productId | string | yes | — |
| warehouseId | string | yes | — |
| type | string | yes | `in` \| `out` \| `transfer` \| `adjustment` \| `production_consumption` |
| qty | number | yes | — |
| unit | string | no | — |
| referenceId | string | no | — |
| referenceType | string | no | `order` \| `po` \| `schedule` \| `manual` |
| note | string | no | — |

**Response:** `{ data: StockMovement }` — 201

---

## Procurement

### `GET /api/procurement/suppliers`
List suppliers.

| Param | Type | Required | Default |
|---|---|---|---|
| isActive | query | no | — |
| limit | query | no | 50 |
| skip | query | no | 0 |

**Response:** `{ data: Supplier[] }`

---

### `POST /api/procurement/suppliers`
Create a supplier.

| Field | Type | Required |
|---|---|---|
| name | string | yes |
| contactName | string | no |
| phone | string | no |
| email | string | no |
| address | string | no |
| taxId | string | no |
| paymentTerms | string | no |
| currency | string | no |
| notes | string | no |

**Response:** `{ data: Supplier }` — 201

---

### `GET /api/procurement/suppliers/[id]`
Get supplier detail.

**Response:** `{ data: Supplier }`

---

### `PATCH /api/procurement/suppliers/[id]`
Update supplier fields (all optional).

**Response:** `{ data: Supplier }`

---

### `DELETE /api/procurement/suppliers/[id]`
Deactivate a supplier (soft delete).

**Response:** `{ success: true, id }`

---

### `GET /api/procurement/po`
List purchase orders.

| Param | Type | Values |
|---|---|---|
| page | query | — |
| limit | query | — |
| status | query | `draft` \| `pending_approval` \| `approved` \| `received` \| `cancelled` |
| supplierId | query | — |
| dateFrom | query | — |
| dateTo | query | — |

**Response:** `{ data: PurchaseOrder[], page, limit }`

---

### `POST /api/procurement/po`
Create a purchase order.

| Field | Type | Required |
|---|---|---|
| supplierId | string | yes |
| items | POItem[] | yes |
| expectedDeliveryDate | string | no |
| warehouseId | string | no |
| requestedById | string | no |
| note | string | no |

**Response:** `{ data: PurchaseOrder }` — 201

---

### `POST /api/procurement/po/[id]/approve`
Approve or reject a PO.

| Field | Type | Required | Values |
|---|---|---|---|
| action | string | yes | `approve` \| `reject` |
| approverId | string | no | — |
| note | string | no | — |

**Response:** `{ success: true, poId, action, data: PurchaseOrder }`

---

### `POST /api/procurement/po/[id]/grn`
Record Goods Received Note — triggers stock-in movements automatically.

| Field | Type | Required |
|---|---|---|
| receivedItems | GRNItem[] | yes |
| warehouseId | string | yes |
| receivedById | string | no |
| receivedAt | string | no |
| note | string | no |

`GRNItem`: `{ productId, qtyReceived, unitCost, productType }`

**Response:** `{ success: true, poId, data: GoodsReceivedNote }`

---

## Webhooks

### `GET /api/webhooks/facebook`
Facebook webhook verification.

| Param | Required |
|---|---|
| hub.mode | yes |
| hub.verify_token | yes |
| hub.challenge | yes |

**Response:** challenge string (plain text) or `{ error: 'Forbidden' }`

---

### `POST /api/webhooks/facebook`
Receive Facebook Messenger events.

**Headers:** none (token verified via hub.verify_token setup)

**Response:** `{ status: 'ok' }` — must respond < 200ms (NFR1)

---

### `POST /api/webhooks/line`
Receive LINE OA events.

**Headers:** `X-Line-Signature` — HMAC-SHA256 (required)

**Response:** `{ status: 'ok' }` — must respond < 200ms (NFR1)

---

## Workers (QStash — internal)

> These routes are called by Upstash QStash only. Protected by QStash signature verification.

### `POST /api/workers/sync-hourly`
Sync Meta Ads data to DB (hourly cron).

**Response:** `{ ok: true }`

---

### `POST /api/workers/sync-messages`
Sync FB/LINE messages to DB.

| Field | Type | Required | Values |
|---|---|---|---|
| tenantId | string | yes | — |
| channel | string | yes | `facebook` \| `line` |
| since | string | no | — |

**Response:** `{ success: true, tenantId, channel }`

---

### `POST /api/workers/daily-brief/process`
Analyze conversations with Gemini → produce daily brief.

| Field | Type | Required |
|---|---|---|
| tenantId | string | yes |
| date | string (YYYY-MM-DD) | yes |

**Response:** `{ success: true, tenantId, date }`

---

### `POST /api/workers/daily-brief/notify`
Send daily brief via LINE notification.

| Field | Type | Required |
|---|---|---|
| tenantId | string | yes |
| date | string | yes |

**Response:** `{ success: true, tenantId, date }`

---

## Auth & Permissions

### `GET /api/permissions`
Return the full permission matrix for the tenant.

**Response:** `{ data: PermissionMatrix }`

---

### `/api/auth/[...nextauth]`
NextAuth.js handler — login, logout, session, CSRF.
See: NextAuth.js v4 documentation.

---

## Push Notifications

### `POST /api/push/subscribe`
Save web push subscription for the current user.

| Field | Type | Required |
|---|---|---|
| subscription | PushSubscription | yes |
| userId | string | no |

`PushSubscription`: `{ endpoint, keys: { p256dh, auth } }`

**Response:** `{ success: true }`

---

## MCP

### `/api/mcp`
Internal MCP endpoint for AI tool integrations. Not for external use.

---

## Route Summary

| Domain | Routes | Methods |
|---|---|---|
| Customers | 4 | GET, POST, PATCH |
| Conversations | 2 | GET, POST |
| Orders | 2 | GET, POST |
| Products / Catalog | 3 | GET, POST |
| Payments / Invoices | 2 | POST |
| Marketing / Ads | 3 | GET, PATCH |
| Daily Brief | 2 | GET |
| AI | 3 | POST |
| Tasks | 4 | GET, POST, PATCH, DELETE |
| Employees | 2 | GET, POST |
| Recipes / Schedules | 3 | GET, POST |
| Inventory | 2 | GET, POST |
| Procurement | 7 | GET, POST, PATCH, DELETE |
| Webhooks | 3 | GET, POST |
| Workers | 4 | POST |
| Auth / Permissions / Push | 3 | GET, POST |
| **Total** | **45** | |
