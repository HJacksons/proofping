import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Privacy — ProofPing",
  description: "How ProofPing handles your email and request data.",
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
          Last updated: July 17, 2026. We collect as little as we can.
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">What we collect</h2>
        <ul className="grid gap-2 text-sm leading-7 text-muted sm:text-base">
          <li>
            <span className="font-medium text-foreground">Email</span> — only
            to sign you in and send your magic link. Not sold, not shared, and
            never shown on requests.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Requests and replies
            </span>{" "}
            — what you choose to post so helpers can respond.
          </li>
          <li>
            <span className="font-medium text-foreground">Payments</span> — if
            you donate or boost, Stripe handles the card. We keep only what we
            need for support.
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">What we do not do</h2>
        <ul className="grid gap-2 text-sm leading-7 text-muted sm:text-base">
          <li>We do not sell your data.</li>
          <li>We do not run ads against your inbox.</li>
          <li>We do not put your email on public requests.</li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Cookies</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          We use small cookies so sign-in works. No advertising trackers. No
          cookie pop-up wall.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          Questions? Email{" "}
          <a
            className="font-semibold text-accent-strong hover:underline"
            href="mailto:info@proofping.com"
          >
            info@proofping.com
          </a>
          . Or read{" "}
          <Link
            className="font-semibold text-accent-strong hover:underline"
            href="/about"
          >
            About
          </Link>
          .
        </p>
      </section>
    </SiteShell>
  );
}
