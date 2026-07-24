import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Privacy — ProofPing",
  description: "How ProofPing handles your data — simply.",
};

export default function PrivacyPage() {
  return (
    <SiteShell width="narrow">
      <div className="grid gap-3">
        <p className="text-sm font-medium text-accent-strong">Privacy</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your privacy, simply
        </h1>
        <p className="text-sm leading-7 text-muted">
          Last updated: July 24, 2026. We collect only what we need to run
          ProofPing.
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">What we use</h2>
        <ul className="grid gap-2 text-sm leading-7 text-muted sm:text-base">
          <li>
            <span className="font-medium text-foreground">Email</span> — for
            your sign-in link, and to notify you when a proof arrives. Not
            sold, not shown on public asks.
          </li>
          <li>
            <span className="font-medium text-foreground">Your asks & proofs</span>{" "}
            — so helpers can reply and you can see the result.
          </li>
          <li>
            <span className="font-medium text-foreground">Place labels</span> —
            text you choose (campus, market, city). Not GPS tracking.
          </li>
          <li>
            <span className="font-medium text-foreground">Alerts (optional)</span>{" "}
            — if you turn them on in Settings. Can stay on your device only.
          </li>
          <li>
            <span className="font-medium text-foreground">Payments (optional)</span>{" "}
            — donate or boost via Stripe. We don’t store your card number.
          </li>
          <li>
            <span className="font-medium text-foreground">Feedback (optional)</span>{" "}
            — if you send a note on{" "}
            <Link
              className="font-semibold text-accent-strong hover:underline"
              href="/feedback"
            >
              Feedback
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">What we don’t do</h2>
        <ul className="grid gap-2 text-sm leading-7 text-muted sm:text-base">
          <li>Sell your data.</li>
          <li>Show your email on requests.</li>
          <li>Run ad trackers on your inbox.</li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Cookies</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          Small cookies keep you signed in. No advertising trackers.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          Questions or ideas →{" "}
          <Link
            className="font-semibold text-accent-strong hover:underline"
            href="/feedback"
          >
            Feedback
          </Link>
          . Also{" "}
          <Link
            className="font-semibold text-accent-strong hover:underline"
            href="/terms"
          >
            Terms
          </Link>
          .
        </p>
      </section>
    </SiteShell>
  );
}
