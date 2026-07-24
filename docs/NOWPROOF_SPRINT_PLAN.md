# NowProof + SnapBounty Plan

Silicon Valley framing: one wedge, one loop, one dense place. Do not ship two products.

## Thesis

ProofPing already has the engine: ask → share/nearby → human proof → review.

**NowProof** is the positioning upgrade: proof of what is true **right now**.  
**SnapBounty** is a later input mode: “take a picture of what you need done.”

Same object underneath: a structured proof request + evidence reply. Different entry UX and copy.

## Why NowProof first (not SnapBounty)

| | NowProof | SnapBounty |
|--|----------|------------|
| Cold start | Question text is enough | Needs photo + circle + task parsing |
| Campus fit | Printers, queues, food, rooms | Strong later, heavier UX |
| Viral loop | Unanswered ask → nearby helpers | Task must recruit completer |
| LLM threat | Low (physical now) | Low (physical action) |
| Build cost | Mostly copy + proof card polish | New compose flow + job states |

**Ship NowProof first.** SnapBounty becomes a “photo brief” create path once the campus loop works.

## Product rules (keep ProofPing DNA)

- Privacy-first. Private link by default. Nearby is opt-in density, not a public people feed.
- Rate the **answer quality**, never rate private individuals.
- No stalking / doxxing / romantic surveillance / children-related asks.
- Free core loop stays free. Credits wallet comes after real reuse demand.
- Do not charge per unlock with card micropayments. Later: internal credits (e.g. $1 → 100 unlocks), split contributor / platform.

## Campus wedge (first beachhead)

Start inside **one university** (or one dense building), not a whole city.

Seed question types:

- Is the school printer working?
- How crowded is the library?
- Is this shop / cafe actually open?
- What is today’s cafeteria meal?
- Is there wheelchair access here?
- How long is the bus / shuttle queue?
- Is this study room free?
- Has anyone seen this lost item? (careful: no private-person hunting)

Creative busy-community loops:

1. **Unanswered wall** — “Open near you” list for opt-in helpers.
2. **Proof card** — verdict + note + timestamp (+ photo/video when available).
3. **Freshness** — show captured time; stale proofs look stale.
4. **Reuse** — same place question can be asked again (“right now” expires).
5. **Helper ping** — later: notify nearby opted-in users of open asks.

## Sprint plan

### Sprint A — Positioning + proof card (copy / UX only)

**Goal:** Make the product feel like “what’s true right now” without new payments.

Deliverables:

- Landing + About examples: campus “right now” + verify-before-you-pay.
- Create-form category/examples for printers, queues, open/closed, access, food.
- Reply UX framed as a **proof card** (verdict, note, when submitted).
- Help nearby empty states that recruit helpers (“Be the first nearby proof”).

Out of scope: credits, ratings economy, push notify, SnapBounty camera flow.

### Sprint B — Freshness + helpfulness signal

**Goal:** Viewers can tell if a proof answered the question.

Deliverables:

- Show relative time prominently on replies (“2 min ago”).
- Optional requester mark: “This answered my question” (not a public people score).
- Optional simple “still useful?” on nearby cards (answer quality only).

Out of scope: paid unlocks, contributor payouts.

### Sprint C — Nearby density loop

**Goal:** Unanswered asks become opportunities for people already there.

Deliverables:

- Stronger Help nearby browse + filters (place / open only).
- Soft share prompts: “Send to someone in the building.”
- Prep hooks for later opt-in nearby notify (no spam blast yet).

### Sprint D — Credits wallet (only after campus reuse)

**Goal:** Monetize history / alerts / priority without card micropayments.

Deliverables:

- Internal credits pack (e.g. $1 → 100 credits via Stripe Checkout once).
- Unlock: history, alerts, or priority placement — not the first free proof card.
- Contributor credit when their proof is unlocked/reused.

Out of scope: bank-card 1¢ charges, complex multi-sided escrow.

### Sprint E — SnapBounty mode (same engine)

**Goal:** “Photograph what you need done” as an alternate create path.

Deliverables:

- Photo-first create: upload/circle note + desired result → structured micro-task.
- Same reply/evidence flow; task checklist on the proof card.
- Free: one public/nearby task card. Paid later: priority, private helpers, multi-location, evidence report.

Out of scope: separate SnapBounty brand app, automatic LLM “job marketplace.”

## Messaging

Primary:

> Proof of what’s true right now — from someone who’s actually there.

Secondary:

> Better than “I’ll just risk it.”

SnapBounty later:

> Take a picture of what you need done.

Avoid overclaiming “Google for now” until density is real.

## Success metrics (campus pilot)

- Asks created per week in the pilot place
- % asks with ≥1 proof within 30 minutes
- % requesters who mark “answered”
- Helper return rate (same person proves twice)
- Organic shares of unanswered asks

If those move, add credits. If not, fix density before SnapBounty or wallet.
