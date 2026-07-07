import Link from "next/link";

import { DonateButton } from "@/components/donate-button";

type SiteFooterProps = {
  donationsEnabled?: boolean;
};

export function SiteFooter({ donationsEnabled = false }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-center text-sm text-muted sm:text-left">
          AI helps you ask. Real humans prove what AI cannot check.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link className="text-sm font-semibold text-muted hover:text-foreground" href="/requests/new">
            Ask for proof
          </Link>
          <Link className="text-sm font-semibold text-muted hover:text-foreground" href="/dashboard">
            My requests
          </Link>
          <DonateButton enabled={donationsEnabled} />
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-3 text-center text-xs text-muted sm:px-6">
          Built for help, not surveillance.
        </p>
      </div>
    </footer>
  );
}
