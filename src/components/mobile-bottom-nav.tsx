"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type MobileBottomNavProps = {
  showAdminLink?: boolean;
};

const baseTabs = [
  {
    href: "/requests",
    label: "Help",
    match: (pathname: string) => pathname === "/requests",
    icon: NearbyIcon,
    showBadge: true,
  },
  {
    href: "/requests/new",
    label: "Ask",
    match: (pathname: string) => pathname === "/requests/new",
    icon: AskIcon,
    showBadge: false,
  },
  {
    href: "/dashboard",
    label: "Mine",
    match: (pathname: string) => pathname === "/dashboard",
    icon: MineIcon,
    showBadge: false,
  },
  {
    href: "/settings",
    label: "Alerts",
    match: (pathname: string) => pathname === "/settings",
    icon: SettingsIcon,
    showBadge: false,
  },
] as const;

export function MobileBottomNav({ showAdminLink = false }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [openAsks, setOpenAsks] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/requests/discover/pulse")
      .then(async (response) => {
        const payload = (await response.json()) as {
          pulse?: { openAsks?: number };
        };
        if (!cancelled && typeof payload.pulse?.openAsks === "number") {
          setOpenAsks(payload.pulse.openAsks);
        }
      })
      .catch(() => {
        // Badge stays quiet when pulse cannot load.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = showAdminLink
    ? [
        ...baseTabs,
        {
          href: "/admin",
          label: "Admin",
          match: (path: string) => path.startsWith("/admin"),
          icon: AdminIcon,
          showBadge: false as const,
        },
      ]
    : [...baseTabs];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul
        className={`mx-auto grid max-w-lg ${
          showAdminLink ? "grid-cols-5" : "grid-cols-4"
        }`}
      >
        {tabs.map((tab) => {
          const onAsk = pathname === "/requests/new";
          const active =
            tab.href === "/requests"
              ? pathname === "/requests" ||
                (pathname.startsWith("/requests/") && !onAsk)
              : tab.match(pathname);
          const Icon = tab.icon;
          const badge =
            tab.showBadge && openAsks !== null && openAsks > 0
              ? openAsks > 99
                ? "99+"
                : String(openAsks)
              : null;

          return (
            <li key={tab.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold transition",
                  active
                    ? "text-accent-strong"
                    : "text-muted active:text-foreground",
                ].join(" ")}
                href={tab.href}
              >
                <span className="relative">
                  <Icon active={Boolean(active)} />
                  {badge ? (
                    <span className="absolute -right-3 -top-1.5 min-w-4 rounded-full bg-accent px-1 text-center text-[9px] font-bold leading-4 text-white">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NearbyIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={active ? "2" : "1.6"}
      viewBox="0 0 24 24"
    >
      <path d="M12 21s-6-4.5-6-10a6 6 0 1 1 12 0c0 5.5-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.25" />
    </svg>
  );
}

function AskIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={active ? "2" : "1.6"}
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MineIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={active ? "2" : "1.6"}
      viewBox="0 0 24 24"
    >
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={active ? "2" : "1.6"}
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 16l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8l1.6-1.6" />
    </svg>
  );
}

function AdminIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={active ? "2" : "1.6"}
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}
