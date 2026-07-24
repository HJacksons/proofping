import { redirect } from "next/navigation";

import { CreateRequestForm } from "@/components/create-request-form";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/server/auth";
import { getIntegrationAvailability } from "@/lib/server/integrations";

export const dynamic = "force-dynamic";

export default async function NewProofRequestPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/requests/new");
  }

  const integrations = getIntegrationAvailability();

  return (
    <SiteShell width="narrow">
      <div className="grid gap-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          What do you need checked before you go?
        </h1>
        <p className="text-sm leading-6 text-muted">
          Queues, open/closed, printers, markets, events — or a listing before
          you pay. Ask free. Boost when you need proof fast.
        </p>
      </div>

      <FeedCard>
        <FeedCardBody>
          <CreateRequestForm aiImproveEnabled={integrations.aiImprove} />
        </FeedCardBody>
      </FeedCard>
    </SiteShell>
  );
}
