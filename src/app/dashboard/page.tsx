import Link from "next/link";
import { redirect } from "next/navigation";

import { RequestList } from "@/components/request-list";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { getAdminNavVisible } from "@/lib/server/admin";
import { getCurrentUser, bootstrapDemoUser } from "@/lib/server/auth";
import { listOwnProofRequests } from "@/lib/server/proof-requests";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const showAdmin = await getAdminNavVisible(user);
  const result = await getDashboardRequests();

  if (!result.ok) {
    return (
      <SiteShell>
        <FeedCard>
          <FeedCardBody>
            <h1 className="text-2xl font-semibold">Connect PostgreSQL to view requests.</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Update `DATABASE_URL`, run the migration, then reload this page.
            </p>
          </FeedCardBody>
        </FeedCard>
      </SiteShell>
    );
  }

  const { requests, nextCursor, hasMore } = result;

  return (
    <SiteShell>
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My requests
        </h1>
        <p className="text-sm leading-6 text-muted">
          Replies from real people, in one place.
        </p>
      </div>

      {showAdmin ? (
        <FeedCard>
          <FeedCardBody>
            <h2 className="text-lg font-semibold">Admin</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Visits, users & places, open asks, and payments.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                className="text-sm font-semibold text-accent-strong hover:underline"
                href="/admin"
              >
                Open admin
              </Link>
              <Link
                className="text-sm font-semibold text-accent-strong hover:underline"
                href="/admin/visits"
              >
                Site visits
              </Link>
            </div>
          </FeedCardBody>
        </FeedCard>
      ) : null}

      {requests.length === 0 ? (
        <FeedCard>
          <FeedCardBody>
            <h2 className="text-lg font-semibold">No requests yet</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Create a proof request and share it with someone who can check.
            </p>
            <Link
              className="mt-3 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white"
              href="/requests/new"
            >
              Create request
            </Link>
          </FeedCardBody>
        </FeedCard>
      ) : (
        <RequestList
          initialHasMore={hasMore}
          initialNextCursor={nextCursor}
          initialRequests={requests}
        />
      )}
    </SiteShell>
  );
}

async function getDashboardRequests() {
  try {
    await bootstrapDemoUser();
    const page = await listOwnProofRequests();

    return {
      ok: true as const,
      requests: page.items,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    };
  } catch {
    return {
      ok: false as const,
    };
  }
}
