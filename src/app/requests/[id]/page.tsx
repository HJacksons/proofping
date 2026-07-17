import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AnonymousDisplayName } from "@/components/anonymous-display-name";
import { CreateReplyForm } from "@/components/create-reply-form";
import { EvidenceGallery } from "@/components/evidence-gallery";
import { HelperUrgentNotice } from "@/components/helper-urgent-notice";
import { ListingLink } from "@/components/listing-link";
import { ProofResultCard } from "@/components/proof-result-card";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { RequestContextNotice } from "@/components/request-context-notice";
import { UrgentBadge } from "@/components/urgent-badge";
import { RequestReviewPanel } from "@/components/request-review-panel";
import { ShareProofButton } from "@/components/share-proof-button";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { getProofRequestCategoryLabel } from "@/lib/proof-requests/categories";
import { verifyReplyCapabilityToken } from "@/lib/proof-requests/reply-token";
import { canAcceptReplies, getProofRequestStatusLabel } from "@/lib/proof-requests/status";
import {
  canReplyThroughDiscovery,
  getProofRequestVisibilityLabel,
} from "@/lib/proof-requests/visibility";
import { ReplyList } from "@/components/reply-list";
import { UrgentBoostButton } from "@/components/urgent-boost-button";
import { getPublicProofRequest } from "@/lib/server/proof-requests";
import { getIntegrationAvailability } from "@/lib/server/integrations";
import { getCurrentUser } from "@/lib/server/auth";
import { confirmUrgentBoostFromCheckoutSession } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";

export default async function PublicProofRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reply?: string; boosted?: string; session_id?: string }>;
}) {
  const { id } = await params;
  const { reply: replyToken, boosted, session_id: sessionId } = await searchParams;
  const integrations = getIntegrationAvailability();
  const user = await getCurrentUser();

  if (user && boosted === "1" && sessionId) {
    const result = await confirmUrgentBoostFromCheckoutSession({
      sessionId,
      userId: user.id,
      requestId: id,
    }).catch(() => ({ applied: false as const }));

    if (result.applied) {
      redirect(`/requests/${id}?boosted=applied`);
    }
  }

  const request = await getPublicProofRequest(id).catch(() => undefined);

  if (request === null) {
    notFound();
  }

  if (!request) {
    return (
      <SiteShell>
        <div className="rounded-lg border border-line bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-strong">
            Database setup needed
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Connect PostgreSQL to view this request.
          </h1>
          <p className="mt-3 leading-7 text-muted">
            Update `DATABASE_URL`, run the migration, then reload this page.
          </p>
        </div>
      </SiteShell>
    );
  }

  const hasRequestEvidence = request.evidence.length > 0;
  const hasListingUrl = Boolean(request.listingUrl);
  const acceptsReplies = canAcceptReplies(request.status);
  const hasValidReplyToken = replyToken
    ? verifyReplyCapabilityToken(id, replyToken)
    : false;
  const canReplyFromDiscovery = canReplyThroughDiscovery(request);
  const canShowReplyForm =
    !request.isOwner &&
    acceptsReplies &&
    (hasValidReplyToken || canReplyFromDiscovery);
  const helperShareUrl = request.replyShareUrl ?? null;

  return (
    <SiteShell>
      <FeedCard>
        <FeedCardBody>
          <p className="text-xs font-semibold text-muted">
            {getProofRequestCategoryLabel(request.category)}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-snug sm:text-3xl">
            {request.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <AnonymousDisplayName name={request.posterDisplayName} />
            <p className="text-sm text-muted">
              {request.locationHint ? `${request.locationHint} · ` : null}
              <ProofTimestamp value={request.createdAt} />
              {` · ${getProofRequestVisibilityLabel(request.visibility)}`}
              {request.status !== "OPEN"
                ? ` · ${getProofRequestStatusLabel(request.status)}`
                : null}
            </p>
            {request.isUrgentBoosted ? <UrgentBadge /> : null}
          </div>

          {!request.isOwner && request.isUrgentBoosted ? (
            <div className="mt-3">
              <HelperUrgentNotice show />
            </div>
          ) : null}

          {boosted === "applied" ? (
            <p className="mt-3 rounded-md border border-line bg-background px-3 py-2 text-sm text-muted">
              Urgent boost is active on this request.
            </p>
          ) : boosted === "1" ? (
            <p className="mt-3 rounded-md border border-line bg-background px-3 py-2 text-sm text-muted">
              Payment received. If this does not update, keep `stripe listen` running
              or reload once.
            </p>
          ) : null}

          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-foreground">
            {request.body}
          </p>

          {request.listingUrl ? (
            <div className="mt-4">
              <ListingLink url={request.listingUrl} />
            </div>
          ) : null}

          {request.evidence.length > 0 ? (
            <div className="mt-4">
              <EvidenceGallery evidence={request.evidence} title="Photos" />
            </div>
          ) : null}

          <div className="mt-4">
            <RequestContextNotice
              audience={request.isOwner ? "requester" : "helper"}
              hasEvidence={hasRequestEvidence}
              hasListingUrl={hasListingUrl}
            />
          </div>

          <ProofResultCard summary={request.replySummary} />
        </FeedCardBody>

        {request.isOwner && helperShareUrl ? (
          <ShareProofButton
            disabled={!acceptsReplies}
            shareUrl={helperShareUrl}
            title={request.title}
            urgent={request.isUrgentBoosted}
          />
        ) : null}

        {request.isOwner ? (
          <RequestReviewPanel requestId={request.id} status={request.status} />
        ) : null}

        {request.isOwner ? (
          <UrgentBoostButton
            canBoost={acceptsReplies}
            enabled={integrations.urgentBoost}
            isBoosted={request.isUrgentBoosted}
            replyCount={request.replySummary.total}
            requestId={request.id}
          />
        ) : null}
      </FeedCard>

      {canShowReplyForm ? (
        <FeedCard>
          <FeedCardBody>
            <h2 className="text-base font-semibold">Your answer</h2>
            <p className="mt-1 text-sm text-muted">
              {canReplyFromDiscovery
                ? "If you know this place or situation, your local knowledge can protect someone."
                : "Share what you know. One tap is enough."}
            </p>
            <div className="mt-4">
              <CreateReplyForm
                hasRequestEvidence={hasRequestEvidence || hasListingUrl}
                replyToken={hasValidReplyToken ? replyToken : undefined}
                requestId={request.id}
              />
            </div>
          </FeedCardBody>
        </FeedCard>
      ) : !request.isOwner && acceptsReplies ? (
        <FeedCard>
          <FeedCardBody>
            <p className="text-sm font-semibold">Helper link required</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Ask the requester to share their ProofPing link so you can reply.
            </p>
          </FeedCardBody>
        </FeedCard>
      ) : !request.isOwner ? (
        <FeedCard>
          <FeedCardBody>
            <p className="text-sm font-semibold">Replies closed</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              This request is {getProofRequestStatusLabel(request.status).toLowerCase()}.
            </p>
          </FeedCardBody>
        </FeedCard>
      ) : null}

      <section className="grid gap-2">
        <h2 className="px-1 text-base font-semibold">Replies</h2>
        <ReplyList
          initialHasMore={request.repliesHasMore}
          initialNextCursor={request.repliesNextCursor}
          initialReplies={request.replies}
          repliesTotal={request.repliesTotal}
          requestId={request.id}
        />
      </section>

      {request.isOwner ? (
        <p className="px-1 text-sm">
          <Link className="font-semibold text-accent-strong hover:underline" href="/dashboard">
            Back to dashboard
          </Link>
        </p>
      ) : null}
    </SiteShell>
  );
}
