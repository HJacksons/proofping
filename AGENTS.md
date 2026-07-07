<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ProofPing Project Rules

- Build ProofPing incrementally. Do not implement future sprint features until the current sprint asks for them.
- Read `PROJECT_BRIEF.md`, `ROADMAP.md`, and `CURRENT_SPRINT.md` before making product changes.
- This is a privacy-first real-human proof request platform for adults, not a social feed or public people-rating system.
- No stalking, doxxing, harassment, romantic surveillance, children-related requests, medical diagnosis, or illegal services.
- Keep all secrets and privileged API calls on the server. Never call OpenAI, Stripe, email, or storage APIs directly from browser code.
- Validate external input with Zod at route and service boundaries.
- Database access must go through server-only modules under `src/lib/server`.
- Return minimal DTOs to pages and client components.
- Add focused tests for every meaningful feature.
- After each sprint, run `npm run lint`, `npm run typecheck`, and `npm run test`.
