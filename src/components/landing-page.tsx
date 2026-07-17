import Link from "next/link";

import { AnonymousDisplayName } from "@/components/anonymous-display-name";
import { ProofResultCard } from "@/components/proof-result-card";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";

export function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="text-center">
        <p className="text-sm font-medium text-accent-strong">
          Verify before you pay
        </p>

        <h1 className="mt-3 text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-5xl sm:leading-[1.08]">
          Before you pay a stranger, get a real person to check.
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted sm:text-lg">
          Share one private helper link and collect real-world signals before a
          rental deposit, Marketplace deal, remote booking, or unknown seller.
        </p>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
          Optional AI helps you write a clear question. A real person nearby
          sends the proof.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white sm:w-auto"
            href="/requests/new"
          >
            Ask for proof
          </Link>
          <Link
            className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-md border border-line bg-surface px-6 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent-strong sm:w-auto"
            href="/requests"
          >
            Help nearby
          </Link>
          <Link
            className="text-sm font-semibold text-muted hover:text-foreground"
            href="/dashboard"
          >
            My requests
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted">
          Human proof · AI-assisted questions · Shareable result cards
        </p>
      </section>

      <section className="mt-12 sm:mt-16">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Example
        </p>

        <FeedCard className="shadow-sm">
          <FeedCardBody>
            <h2 className="text-lg font-semibold leading-snug">
              Is this Marketplace phone deal real?
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AnonymousDisplayName name="AskingScout42" />
              <span className="text-sm text-muted">Lagos</span>
            </div>
            <p className="mt-4 text-sm leading-7">
              Seller wants a deposit before I travel. Can someone nearby check
              the shop looks legit?
            </p>
          </FeedCardBody>

          <div className="border-t border-line bg-background px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <AnonymousDisplayName name="HelpfulLocal17" />
              <span className="text-sm font-semibold text-accent-strong">
                Confirmed
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Same sign as the photos. Shop looks open and normal.
            </p>
          </div>

          <div className="px-4 pb-4 sm:px-5">
            <ProofResultCard
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
      </section>
    </div>
  );
}
