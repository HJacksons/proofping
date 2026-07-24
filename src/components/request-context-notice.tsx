type RequestContextNoticeProps = {
  audience: "requester" | "helper";
  hasEvidence: boolean;
  hasListingUrl: boolean;
};

export function RequestContextNotice({
  audience,
  hasEvidence,
  hasListingUrl,
}: RequestContextNoticeProps) {
  if (hasEvidence || hasListingUrl) {
    return null;
  }

  if (audience === "requester") {
    return (
      <div className="rounded-lg border border-amber-200 bg-warn-soft px-4 py-3 text-sm leading-6 text-amber-950">
        <p className="font-semibold">Add what helpers need to check</p>
        <p className="mt-1">
          No photos or link yet. Add a clear place, what to look for (queue,
          door, printer, listing), and any URL or screenshots so someone there
          can verify the right thing.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-background px-4 py-3 text-sm leading-6 text-muted">
      <p className="font-semibold text-foreground">
        Limited detail from the requester
      </p>
      <p className="mt-1">
        No photos or link were attached. Share only what you can actually see
        or know — or say you can’t confirm this specific ask.
      </p>
    </div>
  );
}
