"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLockup } from "@/components/brand-lockup";
import { DonateButton } from "@/components/donate-button";
import { LogoutButton } from "@/components/logout-button";

type SiteHeaderNavProps = {
  showAdminLink?: boolean;
  userEmail?: string | null;
  isDemoAuth?: boolean;
  donationsEnabled?: boolean;
};

const navLinkClass = (isActive: boolean) =>
  [
    "flex min-h-11 items-center rounded-md px-3 text-sm font-semibold transition",
    isActive
      ? "bg-accent-soft text-accent-strong"
      : "text-foreground hover:bg-foreground/5",
  ].join(" ");

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M6 18 18 6M6 6l12 12" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

export function SiteHeaderNav({
  showAdminLink = false,
  userEmail = null,
  isDemoAuth = false,
  donationsEnabled = false,
}: SiteHeaderNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const links = [
    {
      href: "/requests",
      label: "Help nearby",
      isActive: pathname === "/requests",
    },
    {
      href: "/dashboard",
      label: "My requests",
      isActive: pathname === "/dashboard",
    },
    {
      href: "/requests/new",
      label: "Ask for proof",
      isActive: pathname === "/requests/new",
    },
    ...(showAdminLink
      ? [
          {
            href: "/admin",
            label: "Admin",
            isActive: pathname.startsWith("/admin"),
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="relative z-60 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 bg-surface/95 px-4 py-2.5 sm:px-6">
        <Link
          aria-label="ProofPing home"
          className="text-foreground"
          href="/"
        >
          <BrandLockup compact />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 sm:flex"
        >
          {links.map((link) => (
            <Link
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                link.isActive
                  ? "text-accent-strong"
                  : "text-muted hover:bg-foreground/5 hover:text-foreground"
              }`}
              href={link.href}
              key={link.href}
            >
              {link.label === "Ask for proof" ? "Ask" : link.label}
            </Link>
          ))}

          {userEmail ? (
            <div className="flex items-center gap-1">
              <span className="hidden max-w-36 truncate px-2 text-sm text-muted md:inline">
                {userEmail}
              </span>
              {isDemoAuth ? (
                <span className="hidden px-2 text-xs font-medium text-muted lg:inline">
                  Demo
                </span>
              ) : (
                <LogoutButton />
              )}
            </div>
          ) : (
            <Link
              className="rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-foreground/5 hover:text-foreground"
              href="/login"
            >
              Sign in
            </Link>
          )}
        </nav>

        <button
          aria-controls="mobile-nav"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="relative z-60 inline-flex size-11 items-center justify-center rounded-md text-foreground transition hover:bg-foreground/5 sm:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen ? (
        <div className="sm:hidden" id="mobile-nav">
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-foreground/20"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-surface px-4 py-4 shadow-lg">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {links.map((link) => (
                <Link
                  className={navLinkClass(link.isActive)}
                  href={link.href}
                  key={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-line" />

              {userEmail ? (
                <div className="grid gap-1">
                  <p className="px-3 py-2 text-sm text-muted">{userEmail}</p>
                  {isDemoAuth ? (
                    <p className="px-3 text-xs font-medium text-muted">Demo mode</p>
                  ) : (
                    <div className="px-1 [&_button]:flex [&_button]:min-h-11 [&_button]:w-full [&_button]:items-center [&_button]:px-3 [&_button]:text-left">
                      <LogoutButton />
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  className={navLinkClass(pathname === "/login")}
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}

              {donationsEnabled ? (
                <>
                  <div className="my-2 border-t border-line" />
                  <div className="px-1 [&_button]:flex [&_button]:min-h-11 [&_button]:w-full [&_button]:items-center [&_button]:justify-center">
                    <DonateButton enabled={donationsEnabled} />
                  </div>
                </>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
