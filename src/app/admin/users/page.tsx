import Link from "next/link";
import { redirect } from "next/navigation";

import { ExpandableList } from "@/components/expandable-list";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { requireAdminUser } from "@/lib/server/admin";
import { getAdminUserPlaceOverview } from "@/lib/server/admin-users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const overview = await getAdminUserPlaceOverview().catch(() => null);

  return (
    <SiteShell>
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-muted">
          <Link className="hover:text-foreground" href="/admin">
            Admin
          </Link>
          {" / Users & places"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Users & places
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted">
          Signed-in accounts, alert watch places, and ask location labels.
          Device-only alerts (no account) stay on-device and do not appear here.
          Places are free-text — not GPS or verified countries.
        </p>
      </div>

      {!overview ? (
        <FeedCard>
          <FeedCardBody>
            <p className="text-sm text-muted">Unable to load users and places.</p>
          </FeedCardBody>
        </FeedCard>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users shown" value={String(overview.totals.users)} />
            <StatCard
              label="Alerts on"
              value={String(overview.totals.alertsEnabled)}
            />
            <StatCard label="Places" value={String(overview.totals.places)} />
            <StatCard
              label="Asks with place"
              value={String(overview.totals.asksWithPlace)}
            />
          </div>

          <FeedCard>
            <FeedCardBody>
              <h2 className="text-lg font-semibold">Places</h2>
              <p className="mt-1 text-sm text-muted">{overview.note}</p>
              {overview.places.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No places yet.</p>
              ) : (
                <div className="mt-3">
                  <ExpandableList initialCount={12}>
                    {overview.places.map((place) => (
                      <li
                        className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                        key={place.place}
                      >
                        <span className="font-medium">{place.place}</span>
                        <span className="text-xs text-muted">
                          {place.usersWatching} watching · {place.nearbyAsks}{" "}
                          nearby asks · {place.asks} asks
                        </span>
                      </li>
                    ))}
                  </ExpandableList>
                </div>
              )}
            </FeedCardBody>
          </FeedCard>

          <FeedCard>
            <FeedCardBody>
              <h2 className="text-lg font-semibold">Users</h2>
              {overview.totals.usersTruncated ? (
                <p className="mt-1 text-xs text-muted">
                  Showing the newest {overview.totals.users} accounts.
                </p>
              ) : null}
              {overview.users.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No users yet.</p>
              ) : (
                <div className="mt-3">
                  <ExpandableList initialCount={15}>
                    {overview.users.map((user) => (
                      <li className="grid gap-1 text-sm" key={user.id}>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-xs text-muted">
                          Joined <ProofTimestamp value={user.createdAt} />
                          {" · "}
                          {user.askCount} ask{user.askCount === 1 ? "" : "s"}
                          {" · "}
                          {user.nearbyAlertsEnabled
                            ? `Alerts on · ${user.nearbyAlertsLocation ?? "no place set"}`
                            : "Alerts off"}
                        </p>
                      </li>
                    ))}
                  </ExpandableList>
                </div>
              )}
            </FeedCardBody>
          </FeedCard>
        </>
      )}
    </SiteShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <FeedCard>
      <FeedCardBody>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      </FeedCardBody>
    </FeedCard>
  );
}
