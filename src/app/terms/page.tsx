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
          Last updated: July 17, 2026. Keep it simple: use ProofPing to get
          real help, not to harm people.
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Using ProofPing</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          Ask for genuine local checks. Don’t use the product for harassment,
          stalking, doxxing, or anything illegal. Shared links are for people
          you invite — treat them carefully.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Your content</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          You’re responsible for what you ask and what you reply.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Proof is human, not perfect</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          Helpers share what they see. We can’t guarantee every reply is
          complete or that a deal is safe. Use your judgment before you send
          money.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Updates</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          We may update these terms as the product grows. Questions?{" "}
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
