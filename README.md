# APIFLOW

A developer-focused API management platform that provides secure API keys, gateway routing, Redis-based rate limiting, usage tracking, and analytics.

## Overview

APIFLOW sits between clients and external APIs.

Instead of calling a third-party API directly, a client sends a request through APIFLOW. APIFLOW validates the API key, applies rate limiting, forwards the request to the target API, records usage, and returns the response.

```text
Client
  ↓
APIFLOW Gateway
  ↓
API Key Validation
  ↓
Redis Rate Limiting
  ↓
Target API
  ↓
Usage Logging
  ↓
Response
```

## Features

* User registration and login
* Secure session-based authentication
* API creation and management
* API key generation and revocation
* SHA-256 API key hashing
* API gateway
* Redis-based rate limiting
* Request and response tracking
* API usage analytics
* Dashboard with request statistics
* PostgreSQL database
* Neon PostgreSQL support

## Architecture

```text
                    ┌──────────────────┐
                    │      Client      │
                    │  Postman / App   │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │       APIFLOW       │
                  │    Next.js API      │
                  │      Gateway        │
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │ API Key    │ │   Redis    │ │ PostgreSQL │
       │ Validation  │ │Rate Limit  │ │   Neon     │
       └──────┬─────┘ └────────────┘ └──────┬─────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    ┌──────────────────┐
                    │    Target API    │
                    │  External API    │
                    └──────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the detailed system design.

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js App Router API Routes
* Prisma
* PostgreSQL
* Neon
* Redis
* Zod
* JOSE
* bcryptjs

### Infrastructure

* Redis for distributed rate limiting
* PostgreSQL for persistent application data
* External APIs accessed through the APIFLOW gateway

## API Flow

A gateway request follows this process:

1. Client sends a request to the APIFLOW gateway.
2. APIFLOW extracts the API key.
3. The API key is hashed and validated against the database.
4. Redis checks the request rate limit.
5. APIFLOW finds the configured target API.
6. The request is forwarded to the target API.
7. The response is returned to the client.
8. Request information is stored for analytics.
9. API key usage information is updated.

Example:

```text
POST /api/gateway/jsonplaceholder
x-api-key: ah_live_********
```

## Rate Limiting

APIFLOW uses Redis to maintain request counters.

The current configuration allows:

```text
5 requests / minute / API key
```

When the limit is exceeded, the gateway returns:

```text
429 Too Many Requests
```

Using Redis allows the rate-limit state to be shared instead of keeping counters only inside an individual application process.

## API Key Security

APIFLOW never needs to store the raw API key.

When a key is generated:

```text
Raw API Key
     ↓
SHA-256
     ↓
Stored Hash
```

The client receives the raw key once when it is created.

The database stores:

* Key name
* Key prefix
* SHA-256 hash
* Status
* User
* API
* Creation time
* Last usage time

Revoked keys cannot be used through the gateway.

## Main API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### APIs

```text
GET  /api/apis
POST /api/apis
```

### API Keys

```text
GET    /api/keys
POST   /api/apis/:id/keys
GET    /api/apis/:id/keys
DELETE /api/keys/:id
```

### Gateway

```text
POST /api/gateway/:slug
```

### Analytics

```text
GET /api/analytics
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/apiflow.git
cd apiflow
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL="your-neon-postgresql-url"
JWT_SECRET="your-secure-jwt-secret"
REDIS_URL="your-redis-url"
```

### 4. Generate Prisma Client

```bash
bunx prisma generate
```

### 5. Start the development server

```bash
bun dev
```

Open:

```text
http://localhost:3000
```

## Testing

The main APIFLOW flow can be tested with Postman:

```text
Register
   ↓
Login
   ↓
Create API
   ↓
Create API Key
   ↓
Call Gateway
   ↓
Check Rate Limit
   ↓
Check Dashboard Analytics
```

Example gateway request:

```text
POST http://localhost:3000/api/gateway/jsonplaceholder
```

Headers:

```text
x-api-key: YOUR_API_KEY
Content-Type: application/json
```

## Project Structure

```text
app/
├── api/
│   ├── analytics/
│   ├── apis/
│   ├── auth/
│   ├── gateway/
│   └── keys/
├── api-keys/
├── apis/
├── dashboard/
├── login/
├── register/
├── layout.tsx
└── page.tsx

lib/
├── api-key.ts
├── auth.ts
├── db.ts
├── rate-limit.ts
├── redis.ts
└── require-user.ts

prisma/
└── schema.prisma

public/
└── favicon.svg
```

## Why I Built APIFLOW

APIFLOW was built as a backend-focused portfolio project to explore real-world API infrastructure concepts such as:

* API authentication
* API key management
* Gateway architecture
* Rate limiting
* Redis
* PostgreSQL
* Request logging
* Usage analytics
* Backend security

The goal was to build something closer to a small developer infrastructure product rather than a simple CRUD application.

## Future Improvements

Possible future improvements include:

* Per-API configurable rate limits
* API request caching
* API versioning
* Webhook support
* Team/workspace support
* Advanced analytics
* Background request processing
* API health monitoring
* OpenAPI documentation generation

## License

This project is built for portfolio and educational purposes.
