# Current Sprint: Sprint 5 - Payments And AI Helpers

## Goal

Add optional monetization and backend-only AI assistance without exposing secrets to the browser.

## Deliverables

- Stripe Checkout for optional donations (support ProofPing).
- Stripe Checkout for per-request urgent boosts (optional, request-scoped).
- Backend-only OpenAI helper to improve proof request wording before submit.
- Clear disabled states when Stripe or OpenAI keys are not configured.

## Rules

- Never call Stripe or OpenAI from client components.
- Validate payment and AI input with Zod at route boundaries.
- Donations and boosts are optional. Core ask → share → reply flow stays free.
- AI helpers suggest copy only. They do not auto-submit requests or replies.
- No AI moderation auto-actions in this sprint. Suggestions only.

## Explicitly Out Of Scope

- Subscriptions or recurring billing.
- Payouts to helpers.
- Admin moderation dashboards.
- Production webhook hardening beyond a basic handler stub.
- Translation UI (can follow in a later sprint).

## Done When

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run prisma:validate` passes.
- Requester can start a donation checkout when Stripe is configured.
- Requester can boost an open request when urgent boost pricing is configured.
- Requester can use “Improve wording” on the create form when OpenAI is configured.
- Stripe webhook stub marks urgent boosts as paid.
- Missing keys show honest UI instead of broken buttons.

## Manual Test Path

1. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_DONATION`, `STRIPE_PRICE_URGENT_BOOST`, `STRIPE_WEBHOOK_SECRET`, and `OPENAI_API_KEY` in `.env`.
2. Create a request and try “Improve wording”.
3. Start a donation from the footer and complete Stripe test checkout.
4. Boost an open request, then send the webhook from Stripe CLI to `/api/payments/webhook`.
5. Unset keys and confirm buttons stay hidden instead of breaking.
