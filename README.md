# BoardFlow

A fullstack Kanban board application built with Next.js, Express, PostgreSQL, and TypeScript.

## Stack

| Layer     | Tech                                             |
|-----------|--------------------------------------------------|
| Frontend  | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, dnd-kit |
| Backend   | Express.js, TypeScript, Prisma ORM               |
| Database  | PostgreSQL 16                                    |
| Auth      | JWT (access + refresh tokens), httpOnly cookies  |
| Testing   | Vitest + Supertest (API integration tests)       |
| Container | Docker + Docker Compose                          |

## Project Structure

```
kanban-board/
├── apps/
│   ├── api/          # Express REST API
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Zod schemas shared between API and web
├── docker-compose.yml
└── package.json      # npm workspaces root
```

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 10+

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start the database

```bash
docker compose up db -d
```

### 3. Run migrations and generate Prisma client

```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
cd ../..
```

### 4. Configure environment

Copy and adjust the API env file:

```bash
cp apps/api/.env.example apps/api/.env
```

Required variables in `apps/api/.env`:

```env
DATABASE_URL=postgresql://kanban:kanban@localhost:5432/kanban
JWT_SECRET=change-me-in-production
JWT_REFRESH_SECRET=change-me-in-production
WEB_ORIGIN=http://localhost:3000
PORT=4000
```

### 5. Start the dev servers

```bash
npm run dev
```

This starts both `apps/api` (port 4000) and `apps/web` (port 3000) concurrently.

## Running with Docker Compose (production-like)

Builds and runs all services (db, api, web) in production mode:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Health check: http://localhost:4000/health

## Running Tests

Tests run against an isolated `db-test` container (port 5433). The test suite covers happy-path, tenant isolation, auth edge cases, and Zod validation boundaries.

### Option A — Docker (recommended for CI)

```bash
docker compose --profile test up --build --abort-on-container-exit test
```

### Option B — Local

Start the test database first:

```bash
docker compose --profile test up db-test -d
```

Then run from the API workspace:

```bash
cd apps/api
DATABASE_URL=postgresql://kanban:kanban@localhost:5433/kanban_test \
  npx prisma migrate deploy && \
  npx vitest run
```

## API Overview

All endpoints (except `/api/auth/*`) require `Authorization: Bearer <accessToken>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns access token + sets refresh cookie |
| POST | `/api/auth/refresh` | Refresh access token via cookie |
| POST | `/api/auth/logout` | Clear refresh cookie |
| GET | `/api/boards` | List boards for authenticated tenant |
| POST | `/api/boards` | Create a board (auto-creates 3 default lanes) |
| GET | `/api/boards/:id` | Get board with lanes and cards |
| PATCH | `/api/boards/:id` | Update board title |
| DELETE | `/api/boards/:id` | Delete board (cascades to lanes and cards) |
| POST | `/api/boards/:id/lanes` | Add a lane to a board |
| PATCH | `/api/boards/:id/lanes/reorder` | Reorder lanes |
| PATCH | `/api/lanes/:id` | Rename a lane |
| DELETE | `/api/lanes/:id` | Delete a lane (default lanes protected) |
| POST | `/api/lanes/:id/cards` | Create a card in a lane |
| PATCH | `/api/cards/:id` | Update card title/description |
| DELETE | `/api/cards/:id` | Delete a card |
| PATCH | `/api/cards/move` | Move/reorder a card across lanes |

## Key Design Decisions

- **Tenant isolation**: Every DB query is scoped by `tenantId` derived from the JWT — never from client input. Cross-tenant access returns 403.
- **Optimistic drag-and-drop**: Card moves update the Zustand store immediately; the API call confirms the change. On error, the board rolls back to its pre-drag snapshot.
- **Default lanes**: Creating a board atomically seeds "To Do", "In Progress", and "Done" lanes in a Prisma transaction. Default lanes cannot be deleted.
- **Position integrity**: Card/lane reordering uses gap-shifting transactions (no float positions) to ensure no duplicates.
- **Auth**: Short-lived (15 min) JWT access tokens; long-lived (7 day) httpOnly `SameSite=Lax` refresh tokens. The Axios client intercepts 401s and silently refreshes.
