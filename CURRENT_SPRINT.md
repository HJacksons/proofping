# Current Sprint: Sprint 7 - NowProof Campus Wedge

## Goal

Reposition ProofPing around “what’s true right now” for dense places (campus first), while keeping verify-before-you-pay. Polish proof cards. No credits wallet and no SnapBounty camera flow yet.

## Deliverables

- Landing / About / create examples for campus “right now” asks plus marketplace verify-before-you-pay.
- Create form hints for printers, queues, open/closed, access, food, study spaces.
- Reply / share surfaces read as **proof cards** with clear relative timestamps.
- Help nearby empty and list copy that recruits helpers for unanswered asks.
- Keep privacy rules: no public people ratings; rate answers only if added later.

## Rules

- Copy and UX first. Do not add credits, payouts, or micropayments.
- Do not build SnapBounty photo-circle compose in this sprint.
- Do not add blast push notifications to all users.
- Stay privacy-first: private link default; nearby is opt-in density.
- No stalking, doxxing, or private-person hunting disguised as “lost item.”

## Explicitly Out Of Scope

- Internal credits wallet / unlock packs.
- Contributor revenue split.
- SnapBounty create mode.
- Formal patent/trademark clearance (track separately before big brand claims).
- City-wide “Google for now” marketing claims.

## Done When

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes.
- Landing and create flow clearly support both “right now” and “verify before you pay.”
- A reply looks like a proof card with an obvious time signal.
- Help nearby copy makes unanswered asks feel like an opportunity to help.

## Manual Test Path

1. Open `/` and confirm the dual story (right now + verify before you pay).
2. Create a campus-style ask (“Is the library printer working?”) with a location.
3. Reply with a verdict + note; confirm timestamp reads clearly.
4. Open Help nearby for that location and confirm empty/list copy is inviting.
5. Create a marketplace verify-before-you-pay ask and confirm that path still feels natural.

## Plan Doc

Full strategy: `docs/NOWPROOF_SPRINT_PLAN.md`
