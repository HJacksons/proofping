import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "About — ProofPing",
  description:
    "ProofPing: human proof before you pay, go, or miss a better option.",
};

export default function AboutPage() {
  return (
    <SiteShell width="narrow">
      <div className="grid gap-3">
        <p className="text-sm font-medium text-accent-strong">About ProofPing</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Proof before you waste the trip
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Before you pay. Before you walk over for nothing. Before you
          miss a better option. ProofPing asks someone who’s actually there —
          and brings back a proof card you can trust more than{" "}
          <span className="font-medium text-foreground">
            “I’ll just risk it.”
          </span>
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Where it fits</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          Busy places where truth changes fast: schools, markets, offices,
          beaches, events, concerts, stations, shops, and queues.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Moments we help</h2>
        <ul className="grid gap-2 text-sm leading-7 text-muted sm:text-base">
          <li>
            <span className="font-medium text-foreground">Right now</span> —
            queues, open/closed, printers, rooms, access, crowd size.
          </li>
          <li>
            <span className="font-medium text-foreground">Before you pay</span>{" "}
            — listings, sellers, shops, and deals that need a human check.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Before you go
            </span>{" "}
            — next building or across the area; confirm it’s worth it, or choose
            another option.
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ul className="grid gap-2 text-sm leading-7 text-muted sm:text-base">
          <li>
            <span className="font-medium text-foreground">Free to ask</span> —
            private link or Help nearby.
          </li>
          <li>
            <span className="font-medium text-foreground">Boost for speed</span>{" "}
            — optional, when you need an answer sooner.
          </li>
          <li>
            <span className="font-medium text-foreground">Alerts</span> — turn
            on in{" "}
            <Link
              className="font-semibold text-accent-strong hover:underline"
              href="/settings"
            >
              Settings
            </Link>{" "}
            for nearby asks (while ProofPing is open). You’ll also get an email
            when a proof arrives on your ask.
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">What we are not</h2>
        <ul className="grid gap-2 text-sm leading-7 text-muted sm:text-base">
          <li>Not another social feed.</li>
          <li>Not a place to rate or expose private people.</li>
          <li>
            Not ChatGPT with a map. AI can help you ask clearly; humans send
            the proof.
          </li>
        </ul>
      </section>

      <p className="text-sm text-muted">
        Something rough?{" "}
        <Link
          className="font-semibold text-accent-strong hover:underline"
          href="/feedback"
        >
          Send feedback
        </Link>
        . Also see{" "}
        <Link
          className="font-semibold text-accent-strong hover:underline"
          href="/privacy"
        >
          Privacy
        </Link>{" "}
        and{" "}
        <Link
          className="font-semibold text-accent-strong hover:underline"
          href="/terms"
        >
          Terms
        </Link>
        .
      </p>
    </SiteShell>
  );
}
