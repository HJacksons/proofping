export function ListingLink({ url }: { url: string }) {
  let hostname = url;

  try {
    hostname = new URL(url).hostname;
  } catch {
    // Keep the raw URL if parsing fails.
  }

  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        Listing link
      </p>
      <a
        className="inline-flex w-fit text-sm font-semibold text-accent-strong underline underline-offset-4 break-all"
        href={url}
        rel="noreferrer noopener"
        target="_blank"
      >
        {hostname}
      </a>
    </div>
  );
}
