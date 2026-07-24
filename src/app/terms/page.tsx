import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Terms — ProofPing",
  description: "Simple terms for using ProofPing.",
};

export default function TermsPage() {
  return (
    <SiteShell width="narrow">
      <div className="grid gap-3">
        <p className="text-sm font-medium text-accent-strong">Terms</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms of use
        </h1>
        <p className="text-sm leading-7 text-muted">
          Last updated: July 24, 2026. Use ProofPing to get real help — not to
          harm anyone.
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Using ProofPing</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          Ask for genuine local checks: queues, open/closed, printers, campus
          spaces, listings, shops, and similar. Don’t harass, stalk, doxx, or
          ask for anything illegal. Helper links are for people you invite.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Your content</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          You’re responsible for what you ask and what you reply.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Proof is human</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          Helpers share what they see. Use your judgment before you pay, go,
          wait, or commit. Optional donate/boost support the product — they
          don’t guarantee a reply.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Updates</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          We may update these terms as ProofPing grows. Feedback:{" "}
          <Link
            className="font-semibold text-accent-strong hover:underline"
            href="/feedback"
          >
            here
          </Link>
          . Also{" "}
          <Link
            className="font-semibold text-accent-strong hover:underline"
            href="/privacy"
          >
            Privacy
          </Link>
          .
        </p>
      </section>
    </SiteShell>
  );
}
