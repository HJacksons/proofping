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
          This request has no photos or listing link yet. For a listing check,
          add the listing URL, attach screenshots, and include the address or
          neighborhood so someone there can verify the right place.
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
        No listing photos or link were attached. You can only share general
        area knowledge or say you cannot confirm this specific place.
      </p>
    </div>
  );
}
