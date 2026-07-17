import Link from "next/link";

import { BrandLockup } from "@/components/brand-lockup";
import { DonateButton } from "@/components/donate-button";

type SiteFooterProps = {
  donationsEnabled?: boolean;
};

export function SiteFooter({ donationsEnabled = false }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <BrandLockup />
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Ask a real person nearby when something needs checking.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end sm:gap-4">
            <Link
              className="text-sm font-semibold text-muted hover:text-foreground"
              href="/requests"
            >
              Help nearby
            </Link>
            <Link
              className="text-sm font-semibold text-muted hover:text-foreground"
              href="/requests/new"
            >
              Ask for proof
            </Link>
            <Link
              className="text-sm font-semibold text-muted hover:text-foreground"
              href="/dashboard"
            >
              My requests
            </Link>
            <DonateButton enabled={donationsEnabled} showWhenDisabled />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-line pt-4 sm:justify-between">
          <nav
            aria-label="About and policies"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          >
            <Link
              className="text-xs font-semibold text-muted hover:text-foreground"
              href="/about"
            >
              About
            </Link>
            <Link
              className="text-xs font-semibold text-muted hover:text-foreground"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="text-xs font-semibold text-muted hover:text-foreground"
              href="/terms"
            >
              Terms
            </Link>
          </nav>
          <p className="text-xs text-muted">Built for help, not surveillance.</p>
        </div>
      </div>
    </footer>
  );
}
