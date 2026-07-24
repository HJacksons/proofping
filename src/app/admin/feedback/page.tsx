import Link from "next/link";
import { redirect } from "next/navigation";

import { ExpandableList } from "@/components/expandable-list";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { getProductFeedbackCategoryLabel } from "@/lib/feedback/categories";
import { requireAdminUser } from "@/lib/server/admin";
import { listProductFeedback } from "@/lib/server/product-feedback";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const feedback = await listProductFeedback(100).catch(() => null);

  return (
    <SiteShell>
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-muted">
          <Link className="hover:text-foreground" href="/admin">
            Admin
          </Link>
          {" / Feedback"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Product feedback
        </h1>
        <p className="text-sm leading-6 text-muted">
          Reports from the post-ask pulse. No IPs stored.
        </p>
      </div>

      <FeedCard>
        <FeedCardBody>
          {!feedback ? (
            <p className="text-sm text-muted">Unable to load feedback.</p>
          ) : feedback.length === 0 ? (
            <p className="text-sm text-muted">No feedback yet.</p>
          ) : (
            <ExpandableList initialCount={15}>
              {feedback.map((item) => (
                <li className="grid gap-1 text-sm" key={item.id}>
                  <p className="font-medium">
                    {getProductFeedbackCategoryLabel(item.category)}
                  </p>
                  <p className="text-foreground">{item.message}</p>
                  <p className="text-xs text-muted">
                    <ProofTimestamp value={item.createdAt} />
                    {item.path ? ` · ${item.path}` : ""}
                    {item.userEmail ? ` · ${item.userEmail}` : " · anonymous"}
                    {item.requestId ? (
                      <>
                        {" · "}
                        <Link
                          className="font-semibold text-accent-strong hover:underline"
                          href={`/requests/${item.requestId}`}
                        >
                          ask
                        </Link>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ExpandableList>
          )}
        </FeedCardBody>
      </FeedCard>
    </SiteShell>
  );
}
