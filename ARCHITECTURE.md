# APIFLOW Architecture

## System Overview

APIFLOW is an API management layer between clients and external APIs.

The gateway is responsible for authentication, rate limiting, request forwarding, and usage tracking.

```text
┌──────────────┐
│    Client    │
│ Postman/App  │
└──────┬───────┘
       │
       │ API request + API key
       ▼
┌────────────────────────┐
│       APIFLOW          │
│    Next.js Gateway     │
└───────────┬────────────┘
            │
            ▼
     ┌──────────────┐
     │ API Key      │
     │ Validation   │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │    Redis     │
     │ Rate Limiter │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │ PostgreSQL   │
     │ API Metadata │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │ Target API   │
     │ External API │
     └──────┬───────┘
            │
            ▼
        Response
```

## Request Lifecycle

### 1. Client Request

The client sends a request to:

```text
POST /api/gateway/:slug
```

The request contains an APIFLOW API key.

Example:

```text
x-api-key: ah_live_********
```

### 2. API Key Validation

APIFLOW hashes the provided API key using SHA-256.

```text
Client API Key
      ↓
SHA-256
      ↓
Database Lookup
```

The system verifies:

* Key exists
* Key belongs to the requested API
* Key is active

If validation fails:

```text
401 Unauthorized
```

### 3. Rate Limiting

The API key is used as the Redis rate-limit identifier.

```text
rate-limit:{apiKeyId}
```

Current limit:

```text
5 requests / minute
```

If the limit is exceeded:

```text
429 Too Many Requests
```

### 4. Target API Lookup

APIFLOW retrieves the API configuration from PostgreSQL.

Example:

```text
slug:
jsonplaceholder

endpoint:
https://jsonplaceholder.typicode.com/posts
```

### 5. Request Forwarding

APIFLOW forwards the incoming request to the configured external API.

```text
Client
  ↓
APIFLOW
  ↓
JSONPlaceholder
```

The external response is then returned through APIFLOW.

### 6. Usage Tracking

APIFLOW records request information in PostgreSQL.

Typical information includes:

* API
* API key
* HTTP method
* status code
* response time
* timestamp

This data powers the dashboard analytics.

## Components

### Next.js

Next.js provides:

* Web interface
* Authentication routes
* API management routes
* API key routes
* Gateway routes
* Analytics routes

### PostgreSQL

PostgreSQL stores persistent application data such as:

* Users
* APIs
* API keys
* API requests

Neon is used as the hosted PostgreSQL provider.

### Prisma

Prisma provides the database access layer between the application and PostgreSQL.

```text
Next.js
   ↓
Prisma
   ↓
PostgreSQL
```

### Redis

Redis is used for fast, temporary rate-limit state.

```text
API Request
    ↓
Redis Counter
    ↓
Allow / Reject
```

Redis is appropriate here because rate-limit counters need fast reads and writes and do not need to be the primary source of persistent application data.

## Security

### API Keys

Raw API keys are not stored in the database.

Instead:

```text
API Key
   ↓
SHA-256
   ↓
Hash stored in PostgreSQL
```

Only the key prefix is stored for identification in the dashboard.

### Authentication

User authentication uses a signed JWT stored in an HTTP-only cookie.

```text
Login
  ↓
JWT
  ↓
HTTP-only Cookie
  ↓
Authenticated API Requests
```

### Authorization

Protected API resources verify the authenticated user before allowing access.

For example, a user can only manage their own APIs and API keys.

## Data Flow

```text
                    ┌───────────────┐
                    │    Client     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Next.js       │
                    │ Gateway       │
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
          ┌─────────────┐       ┌─────────────┐
          │    Redis    │       │ PostgreSQL  │
          │ Rate Limit  │       │ API / Keys  │
          └─────────────┘       │ / Requests  │
                                └──────┬──────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │ Target API  │
                                └─────────────┘
```

## Scaling Considerations

The gateway can be scaled horizontally because request rate-limit state is stored in Redis rather than application memory.

```text
                 ┌──────────────┐
                 │    Client    │
                 └──────┬───────┘
                        │
                 ┌──────▼───────┐
                 │ Load Balancer│
                 └──────┬───────┘
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
         ┌───────┐  ┌───────┐  ┌───────┐
         │ API 1 │  │ API 2 │  │ API 3 │
         └───┬───┘  └───┬───┘  └───┬───┘
             │          │          │
             └──────────┼──────────┘
                        ▼
                   ┌─────────┐
                   │  Redis  │
                   └─────────┘
```

Because rate-limit state is shared through Redis, requests can be handled by different application instances without each instance maintaining its own independent counter.

## Design Trade-offs

APIFLOW intentionally keeps the architecture small enough for a portfolio project while demonstrating real backend concepts.

It currently avoids:

* Kafka
* Microservices
* Payment systems
* Multi-tenant organizations
* Complex background processing

These could be introduced later if the system required them.

## Future Architecture

Possible future additions:

```text
                    Client
                      │
                      ▼
                Load Balancer
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      Gateway 1   Gateway 2   Gateway 3
          │           │           │
          └───────┬───┴───────┬───┘
                  │           │
                  ▼           ▼
                Redis      PostgreSQL
                  │
                  ▼
             Queue/Worker
                  │
                  ▼
             Analytics
```

This could support higher traffic, asynchronous analytics processing, API health monitoring, and more advanced infrastructure.
