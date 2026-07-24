# ProofPing Roadmap

Build one vertical slice at a time. Each sprint should end with lint, typecheck, tests, a risk note, and a short manual test path.

## Sprint 0 - Foundation

Set up the self-hostable Next.js foundation, project rules, env validation, Prisma configuration, placeholder auth boundary, basic landing page, and test setup.

Do not build payments, uploads, AI helpers, forwarding, admin, moderation, or the real proof-request flow yet.

## Sprint 1 - Core Proof Request Flow

Add the first real product path:

- ProofRequest Prisma model.
- Create proof request page.
- Requester dashboard.
- Public share page.
- Route handlers for creating and reading requests.
- Zod validation and access-control tests.

Do not build replies, uploads, payments, forwarding, AI, or admin yet.

## Sprint 2 - Public Replies

Add reply-without-account using signed capability tokens, basic reply lifecycle, and requester review states.

## Sprint 3 - Evidence Uploads

Add private-by-default evidence uploads, file validation, media storage integration, and deterministic redaction hooks.

## Sprint 4 - Forwarding And Notifications

Add opt-in one-degree forwarding, notification delivery, abuse controls, and no contact scraping.

## Sprint 5 - Payments And AI Helpers

Add Stripe Checkout for donations, unlocks, or urgent boosts. Add backend-only OpenAI helpers for request improvement, translation, and moderation triage.

## Sprint 6 - Moderation And Launch Hardening

Add admin/moderation queues, rate limiting, audit trails, privacy review, observability, CSP, and self-hosting deployment polish.

## Sprint 7 - NowProof Campus Wedge (copy + proof cards)

Reposition around “what’s true right now” for dense places (campus first), keep verify-before-you-pay, and polish proof cards with clear timestamps. No credits wallet yet.

See `docs/NOWPROOF_SPRINT_PLAN.md`.

## Sprint 8 - Freshness And Nearby Density

Helpfulness signals on answers (not people ratings), stronger Help nearby browse, and share loops for unanswered asks.

## Sprint 9 - Credits Wallet (after real reuse)

Internal unlock credits via Stripe packs (not 1¢ card micropayments). Split value between contributor and platform for history/alerts/priority.

## Sprint 10 - SnapBounty Create Mode

Photo-first “take a picture of what you need done” create path on the same proof-request engine. Not a separate product.
