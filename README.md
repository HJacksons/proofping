# ProofPing

ProofPing is a privacy-first real-human proof request platform for adults. It helps people request real-world confirmation for things AI cannot physically verify, such as listings, sellers, shops, addresses, queues, notices, and local situations.

This repo is being built one sprint at a time. See `PROJECT_BRIEF.md`, `ROADMAP.md`, and `CURRENT_SPRINT.md` before adding product features.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- PostgreSQL
- Prisma 7
- Zod
- Vitest

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` if your local PostgreSQL credentials differ.

Generate the Prisma client:

```bash
npm run prisma:generate
```

Apply database migrations:

```bash
npm run db:migrate
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run prisma:validate
```

## Local PostgreSQL

This repo is configured for a local Homebrew PostgreSQL database by default:

```env
DATABASE_URL="postgresql://proofping:proofping@localhost:5432/proofping?schema=public"
```

If the role and database do not exist yet:

```bash
psql -d postgres -c "CREATE ROLE proofping WITH LOGIN PASSWORD 'proofping';"
psql -d postgres -c "CREATE DATABASE proofping OWNER proofping;"
npm run db:migrate
```

## Self-Hosting Notes

ProofPing is intended to be deployable on your own server instead of being Vercel-only.

A simple starting deployment can use:

- One VPS
- Node.js running the Next.js app
- PostgreSQL
- nginx or Caddy as the reverse proxy
- PM2 or Docker Compose as the process manager
- Server-side environment variables for secrets

Do not expose OpenAI, Stripe, email, storage, or database secrets to client components. Backend integrations should live behind route handlers and server-only modules.

## Current Sprint

Sprint 3 adds optional photo attachments with a 2+2 rule:

- Up to 2 photos when creating a request.
- Up to 2 photos on each reply.
- JPEG, PNG, or WebP only. 8 MB per file.
- `GET /api/evidence/[id]` serves files through the server.

Auth is still a local demo placeholder for request creators. Public replies do not require login yet. Do not build payments, AI helpers, forwarding, admin, or moderation yet.
