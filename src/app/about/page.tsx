import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "About — ProofPing",
  description:
    "ProofPing helps you verify before you pay — instead of hoping it works out.",
};

export default function AboutPage() {
  return (
    <SiteShell width="narrow">
      <div className="grid gap-3">
        <p className="text-sm font-medium text-accent-strong">About us</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Built for the moment you almost send the money
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Too many people end up thinking{" "}
          <span className="font-medium text-foreground">
            “I’ll just risk it.”
          </span>{" "}
          ProofPing is the other option: ask a real person nearby to check
          before you pay.
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">What we are</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          A simple way to get real-world confirmation — listings, shops,
          sellers, addresses, and local situations that AI cannot physically
          check. You share one private link. Someone there sends proof back.
        </p>
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

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">How we keep it useful</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          ProofPing is for genuine local checks — not harassment, stalking, or
          anything illegal. Built for help, not surveillance.
        </p>
      </section>

      <p className="text-sm text-muted">
        Questions?{" "}
        <a
          className="font-semibold text-accent-strong hover:underline"
          href="mailto:info@proofping.com"
        >
          info@proofping.com
        </a>
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
