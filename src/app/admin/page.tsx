import Link from "next/link";
import { redirect } from "next/navigation";

import { ProofTimestamp } from "@/components/proof-timestamp";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { formatPaymentAmount } from "@/lib/payments/kinds";
import { requireAdminUser } from "@/lib/server/admin";
import {
  getAdminDashboard,
  type AdminDashboardDTO,
} from "@/lib/server/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const dashboard = await getAdminDashboard().catch(() => null);

  return (
    <SiteShell width="wide" className="gap-6 sm:gap-8">
      <header className="overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#0f6b57_0%,#0a493d_55%,#134e43_100%)] px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            ProofPing ops
          </p>
          <h1 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Live overview
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Live product metrics: users, asks, traffic, network countries, and
            payments. Ask places are free-text labels; visit countries are
            network estimates, not GPS.
          </p>
          {dashboard ? (
            <p className="text-xs text-white/55">
              Updated <ProofTimestamp value={dashboard.generatedAt} />
            </p>
          ) : null}
        </div>
      </header>

      {!dashboard ? (
        <FeedCard>
          <FeedCardBody>
            <p className="text-sm text-muted">
              Unable to load admin metrics. Check the database connection.
            </p>
          </FeedCardBody>
        </FeedCard>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricTile
              href="/admin/users"
              label="Users"
              value={String(dashboard.metrics.users)}
              hint={`+${dashboard.metrics.newUsersLast7d} this week`}
            />
            <MetricTile
              href="/admin/asks"
              label="Open asks"
              value={String(dashboard.metrics.openAsks)}
              hint={`${dashboard.metrics.nearbyOpenAsks} on Help nearby`}
            />
            <MetricTile
              label="Asks · 7d"
              value={String(dashboard.metrics.asksLast7d)}
              hint={`${dashboard.metrics.repliesLast7d} proofs`}
            />
            <MetricTile
              href="/admin/visits"
              label="Visitors · 14d"
              value={String(dashboard.metrics.uniqueVisitorsLast14d)}
              hint={`${dashboard.metrics.humanViewsLast14d} human views`}
            />
            <MetricTile
              href="/admin/users"
              label="Alerts on"
              value={String(dashboard.metrics.alertsEnabled)}
              hint="Synced signed-in prefs"
            />
            <MetricTile
              href="/admin/payments"
              label="Paid"
              value={formatPaid(
                dashboard.metrics.paidCents,
                dashboard.metrics.paidCurrency,
              )}
              hint={`${dashboard.metrics.paidCount} checkout${dashboard.metrics.paidCount === 1 ? "" : "s"}`}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <FeedCard className="border-0 shadow-[0_1px_0_rgba(17,17,17,0.04)] ring-1 ring-line">
              <FeedCardBody className="sm:py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      Traffic · 14 days
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Page views · no IPs stored.
                    </p>
                  </div>
                  <Link
                    className="text-sm font-semibold text-accent-strong hover:underline"
                    href="/admin/visits"
                  >
                    Full visits
                  </Link>
                </div>
                <div className="mt-5">
                  <VisitBars days={dashboard.visitTrend} />
                </div>
              </FeedCardBody>
            </FeedCard>

            <FeedCard className="border-0 shadow-[0_1px_0_rgba(17,17,17,0.04)] ring-1 ring-line">
              <FeedCardBody className="sm:py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      Countries
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Network country · not identity.
                    </p>
                  </div>
                  <Link
                    className="text-sm font-semibold text-accent-strong hover:underline"
                    href="/admin/visits"
                  >
                    Details
                  </Link>
                </div>
                {dashboard.topCountries.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">
                    No country on recorded visits yet. Browse a public page,
                    then refresh.
                  </p>
                ) : (
                  <ul className="mt-4 grid gap-3">
                    {dashboard.topCountries.map((row) => (
                      <li key={row.countryCode}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="font-medium">
                            {row.countryName}{" "}
                            <span className="text-muted">({row.countryCode})</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-muted">
                            {row.uniqueVisitors} unique
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent-soft">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${pathBarWidth(
                                row.uniqueVisitors,
                                dashboard.topCountries[0]?.uniqueVisitors ?? 1,
                              )}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs leading-5 text-muted">
                  {dashboard.visitsNote}
                </p>
              </FeedCardBody>
            </FeedCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <FeedCard className="border-0 shadow-[0_1px_0_rgba(17,17,17,0.04)] ring-1 ring-line">
              <FeedCardBody className="sm:py-5">
                <h2 className="text-lg font-semibold tracking-tight">
                  Top paths
                </h2>
                <p className="mt-1 text-sm text-muted">Top entry paths.</p>
                {dashboard.topPaths.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">No visits yet.</p>
                ) : (
                  <ul className="mt-4 grid gap-3">
                    {dashboard.topPaths.map((row) => (
                      <li key={row.path}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="truncate font-medium">{row.path}</span>
                          <span className="shrink-0 tabular-nums text-muted">
                            {row.views}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent-soft">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${pathBarWidth(
                                row.views,
                                dashboard.topPaths[0]?.views ?? 1,
                              )}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </FeedCardBody>
            </FeedCard>

            <FeedCard className="border-0 shadow-[0_1px_0_rgba(17,17,17,0.04)] ring-1 ring-line">
              <FeedCardBody className="sm:py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      Ask / alert places
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {dashboard.placesNote}
                    </p>
                  </div>
                  <Link
                    className="text-sm font-semibold text-accent-strong hover:underline"
                    href="/admin/users"
                  >
                    Users & places
                  </Link>
                </div>
                {dashboard.topPlaces.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">
                    No ask or alert places yet.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-line">
                    {dashboard.topPlaces.map((place) => (
                      <li
                        className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                        key={place.place}
                      >
                        <span className="font-medium">{place.place}</span>
                        <span className="text-xs text-muted">
                          {place.usersWatching} watching · {place.nearbyAsks}{" "}
                          nearby · {place.asks} asks
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </FeedCardBody>
            </FeedCard>
          </section>

          <section className="grid gap-4">
            <FeedCard className="border-0 shadow-[0_1px_0_rgba(17,17,17,0.04)] ring-1 ring-line">
              <FeedCardBody className="sm:py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      Open asks
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Newest open requests.
                    </p>
                  </div>
                  <Link
                    className="text-sm font-semibold text-accent-strong hover:underline"
                    href="/admin/asks"
                  >
                    Manage asks
                  </Link>
                </div>
                {dashboard.recentOpenAsks.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">No open asks.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-line">
                    {dashboard.recentOpenAsks.map((ask) => (
                      <li className="grid gap-1 py-3 first:pt-0 last:pb-0" key={ask.id}>
                        <Link
                          className="font-medium hover:text-accent-strong"
                          href={`/requests/${ask.id}`}
                        >
                          {ask.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {ask.locationHint ?? "No place"}
                          {" · "}
                          {ask.visibility === "LOCAL_DISCOVERY"
                            ? "Nearby"
                            : "Private"}
                          {" · "}
                          {ask.replyCount}{" "}
                          {ask.replyCount === 1 ? "proof" : "proofs"}
                          {" · "}
                          <ProofTimestamp value={ask.createdAt} />
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </FeedCardBody>
            </FeedCard>
          </section>

          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink
              href="/admin/users"
              title="Users & places"
              body="Accounts and free-text places"
            />
            <QuickLink
              href="/admin/asks"
              title="Open asks"
              body="Close junk or stale nearby asks"
            />
            <QuickLink
              href="/admin/visits"
              title="Site visits"
              body="Paths, countries, uniques"
            />
            <QuickLink
              href="/admin/payments"
              title="Payments"
              body="Donations and urgent boosts"
            />
          </nav>
        </>
      )}
    </SiteShell>
  );
}

function MetricTile({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </>
  );

  if (href) {
    return (
      <Link
        className="rounded-xl bg-surface px-4 py-4 ring-1 ring-line transition hover:ring-accent/40"
        href={href}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-xl bg-surface px-4 py-4 ring-1 ring-line">
      {inner}
    </div>
  );
}

function QuickLink({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      className="group rounded-xl bg-accent-soft/60 px-4 py-4 transition hover:bg-accent-soft"
      href={href}
    >
      <p className="font-semibold group-hover:text-accent-strong">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </Link>
  );
}

function VisitBars({
  days,
}: {
  days: AdminDashboardDTO["visitTrend"];
}) {
  const max = Math.max(1, ...days.map((day) => day.views));

  return (
    <div className="grid gap-3">
      <div
        aria-hidden="true"
        className="flex h-36 items-end gap-1 sm:gap-1.5"
      >
        {days.map((day) => {
          const height = Math.max(4, Math.round((day.views / max) * 100));
          return (
            <div
              className="group relative flex h-full flex-1 flex-col justify-end"
              key={day.date}
              title={`${day.date}: ${day.views} views, ${day.uniqueVisitors} unique`}
            >
              <div
                className="w-full rounded-t-sm bg-accent/85 transition group-hover:bg-accent-strong"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-muted">
        <span>{formatDayLabel(days[0]?.date)}</span>
        <span>{formatDayLabel(days[days.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

function formatDayLabel(date: string | undefined) {
  if (!date) {
    return "";
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function pathBarWidth(views: number, maxViews: number) {
  if (maxViews <= 0) {
    return 0;
  }
  return Math.max(8, Math.round((views / maxViews) * 100));
}

function formatPaid(amountCents: number, currency: string | null) {
  if (amountCents <= 0) {
    return "$0";
  }

  return formatPaymentAmount(amountCents, currency ?? "usd");
}
