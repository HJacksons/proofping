import Link from "next/link";

import { AnonymousDisplayName } from "@/components/anonymous-display-name";
import { ProofResultCard } from "@/components/proof-result-card";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";

export function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="text-center">
        <p className="text-sm font-medium text-accent-strong">
          ProofPing — what’s true right now
        </p>

        <h1 className="mt-3 text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-5xl sm:leading-[1.08]">
          Ask someone who’s actually there.
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted sm:text-lg">
          Before you pay. Before you waste a trip. Before you
          miss a better option. Get a human proof card from the place itself.
        </p>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
          Schools, markets, busy offices, beaches, events, concerts, queues,
          shops — anywhere people gather and things change by the minute.
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white sm:w-auto"
            href="/requests/new"
          >
            Ask for proof
          </Link>
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-line bg-surface px-6 text-base font-semibold text-foreground transition-colors hover:border-accent hover:text-accent-strong sm:w-auto"
            href="/requests"
          >
            Help nearby
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-muted hover:text-foreground"
            href="/dashboard"
          >
            My requests
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted">
          Free to ask · 30-sec proofs · Help nearby
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:mt-14">
        <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-muted">
          How it works
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-line bg-surface px-4 py-3 text-left">
            <p className="text-sm font-semibold">Ask</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              One clear question. Private link or Help nearby.
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface px-4 py-3 text-left">
            <p className="text-sm font-semibold">Get a proof</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Someone there replies. Timestamped. No guessing.
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface px-4 py-3 text-left">
            <p className="text-sm font-semibold">Decide</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Go, wait, pay — or pick another option. With signal.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 sm:mt-16">
        <div>
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.12em] text-muted">
            Busy place · right now
          </p>
          <FeedCard className="shadow-sm">
            <FeedCardBody>
              <h2 className="text-lg font-semibold leading-snug">
                How long is the queue at the west gate?
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AnonymousDisplayName name="AskingScout42" />
                <span className="text-sm text-muted">Concert venue</span>
              </div>
              <p className="mt-4 text-sm leading-7">
                Deciding whether to leave now or wait 20 minutes. Can someone at
                the gate say how bad it is?
              </p>
            </FeedCardBody>

            <div className="border-t border-line bg-background px-4 py-3 sm:px-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Proof card
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AnonymousDisplayName name="HelpfulLocal17" />
                <span className="text-sm font-semibold text-accent-strong">
                  Confirmed
                </span>
                <span className="text-xs text-muted">· Proven 2 min ago</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                Moving. About 8 minutes from where I’m standing.
              </p>
            </div>
          </FeedCard>
        </div>

        <div>
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.12em] text-muted">
            Before you pay · before you go
          </p>
          <FeedCard className="shadow-sm">
            <FeedCardBody>
              <h2 className="text-lg font-semibold leading-snug">
                Is this Marketplace phone deal real?
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AnonymousDisplayName name="AskingScout42" />
                <span className="text-sm text-muted">City market</span>
              </div>
              <p className="mt-4 text-sm leading-7">
                Seller wants a deposit before I cross town. Can someone nearby
                check the stall looks legit — or should I pick another option?
              </p>
            </FeedCardBody>

            <div className="border-t border-line bg-background px-4 py-3 sm:px-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Proof card
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AnonymousDisplayName name="HelpfulLocal17" />
                <span className="text-sm font-semibold text-accent-strong">
                  Confirmed
                </span>
                <span className="text-xs text-muted">· Proven 12 min ago</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                Same sign as the photos. Stall is open and looks normal.
              </p>
            </div>

            <div className="px-4 pb-4 sm:px-5">
              <ProofResultCard
                intent="right_now"
                summary={{
                  total: 2,
                  confirmed: 2,
                  suspicious: 0,
                  unsure: 0,
                  resultLabel: "2 people confirmed",
                }}
              />
            </div>
          </FeedCard>
        </div>
      </section>
    </div>
  );
}
