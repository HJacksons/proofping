import Link from "next/link";
import { redirect } from "next/navigation";

import { ExpandableList } from "@/components/expandable-list";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { requireAdminUser } from "@/lib/server/admin";
import { getSiteVisitStats } from "@/lib/server/site-visits";

export const dynamic = "force-dynamic";

export default async function AdminVisitsPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const stats = await getSiteVisitStats(14).catch(() => null);

  return (
    <SiteShell>
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-muted">
          <Link className="hover:text-foreground" href="/admin">
            Admin
          </Link>
          {" / Visits"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Site visits
        </h1>
        <p className="text-sm leading-6 text-muted">
          Anonymous page views only. No IPs or emails are stored.
        </p>
      </div>

      {!stats ? (
        <FeedCard>
          <FeedCardBody>
            <p className="text-sm text-muted">Unable to load visit stats.</p>
          </FeedCardBody>
        </FeedCard>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Views (14d)" value={String(stats.totalViews)} />
            <StatCard
              label="Unique visitors"
              value={String(stats.uniqueVisitors)}
            />
            <StatCard label="Human views" value={String(stats.humanViews)} />
            <StatCard label="Bot views" value={String(stats.botViews)} />
          </div>

          <FeedCard>
            <FeedCardBody>
              <h2 className="text-lg font-semibold">Top paths</h2>
              {stats.topPaths.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No visits yet.</p>
              ) : (
                <div className="mt-3">
                  <ExpandableList initialCount={8}>
                    {stats.topPaths.map((item) => (
                      <li
                        className="flex items-center justify-between gap-3 text-sm"
                        key={item.path}
                      >
                        <span className="truncate font-medium">{item.path}</span>
                        <span className="shrink-0 text-muted">{item.views}</span>
                      </li>
                    ))}
                  </ExpandableList>
                </div>
              )}
            </FeedCardBody>
          </FeedCard>

          <FeedCard>
            <FeedCardBody>
              <h2 className="text-lg font-semibold">By day</h2>
              <ul className="mt-3 grid gap-2">
                {[...stats.viewsByDay].reverse().map((day) => (
                  <li
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    key={day.date}
                  >
                    <span className="font-medium">{day.date}</span>
                    <span className="text-muted">
                      {day.views} views · {day.uniqueVisitors} unique
                    </span>
                  </li>
                ))}
              </ul>
            </FeedCardBody>
          </FeedCard>

          <FeedCard>
            <FeedCardBody>
              <h2 className="text-lg font-semibold">Recent</h2>
              {stats.recent.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No recent visits.</p>
              ) : (
                <div className="mt-3">
                  <ExpandableList initialCount={10}>
                    {stats.recent.map((visit) => (
                      <li className="text-sm" key={visit.id}>
                        <p className="font-medium">{visit.path}</p>
                        <p className="mt-1 text-xs text-muted">
                          <ProofTimestamp value={visit.createdAt} />
                          {visit.referrerHost
                            ? ` · from ${visit.referrerHost}`
                            : ""}
                          {visit.isBot ? " · bot" : ""}
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
