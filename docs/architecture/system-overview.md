# System Overview

> Zuri Platform — Tech stack + data flow

## Tech Stack

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        Next[Next.js 14 App Router]
        TW[Tailwind CSS]
        FM[Framer Motion]
        LU[Lucide Icons]
        RC[Recharts]
        PJS[pusher-js]
    end

    subgraph Vercel["Vercel (Serverless)"]
        API[API Routes]
        MW[Middleware<br>tenant + auth]
        REPO[Repositories]
        WH[Webhooks<br>FB + LINE]
        WK[Workers<br>QStash cron]
    end

    subgraph External["External Services"]
        SB[(Supabase<br>PostgreSQL)]
        RD[(Upstash Redis<br>Cache)]
        QS[QStash<br>Queue]
        PS[Pusher<br>Realtime]
        GM[Gemini 2.0 Flash<br>AI]
        META[Meta Graph API]
        LINE[LINE Messaging API]
    end

    Next --> MW --> API --> REPO --> SB
    API --> RD
    API --> GM
    WH --> REPO
    QS --> WK --> REPO
    QS --> META
    QS --> LINE
    PS --> PJS
    API --> PS
```

## Critical Data Flow Rules

```mermaid
flowchart LR
    UI[UI/Pages] -->|reads| API[API Routes]
    API -->|calls| REPO[Repositories]
    REPO -->|queries| DB[(Database)]

    WH[Webhooks] -->|writes| DB
    WK[QStash Workers] -->|syncs| DB
    META[Meta API] -.->|NEVER from UI| UI

    style META fill:#f99,stroke:#333
```

### Rules
1. **UI reads from DB only** — never call Meta/LINE API from UI or API routes
2. **QStash workers** sync external data to DB every 1 hour
3. **Webhooks** write inbound messages, respond 200 in < 200ms
4. **Pusher** triggers realtime updates to connected clients

## Multi-Tenant Architecture

```mermaid
flowchart TD
    REQ[Request] --> MW[Middleware]
    MW --> |resolve tenant| TID[x-tenant-id header]
    TID --> API[API Route]
    API --> REPO[Repository]
    REPO --> |WHERE tenant_id = ?| DB[(Database)]

    subgraph Tenants
        T1[V School<br>10000000-...-0001]
        T2[School B<br>20000000-...-0002]
        T3[School C<br>30000000-...-0003]
    end
```

## Auth Flow

```mermaid
sequenceDiagram
    participant U as User
    participant NA as NextAuth
    participant DB as Database
    participant API as API Route

    U->>NA: Login (email + password)
    NA->>DB: Verify credentials (bcrypt)
    DB-->>NA: User + roles
    NA-->>U: JWT token (session)
    U->>API: Request + JWT
    API->>API: getServerSession()
    API->>API: can(roles, domain, action)
    API-->>U: Response
```

## NFR Summary

| NFR | Target | How |
|-----|--------|-----|
| NFR1 | Webhook < 200ms | Respond 200 first, process async via QStash |
| NFR2 | Dashboard < 500ms | Upstash Redis cache (TTL 300s) |
| NFR3 | Worker retry >= 5x | throw error, let QStash retry |
| NFR5 | No P2002 race | prisma.$transaction for identity upsert |

---

Related: [[database-erd/full-schema|Database ERD]] | [[../gotchas/README|Gotchas]] | [[../product/PRD|PRD]]

#architecture #system #overview
