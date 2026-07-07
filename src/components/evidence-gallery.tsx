import type { RequestEvidenceDTO } from "@/lib/evidence/types";

type EvidenceGalleryProps = {
  evidence: RequestEvidenceDTO[];
  title?: string;
};

export function EvidenceGallery({
  evidence,
  title = "Photos",
}: EvidenceGalleryProps) {
  if (evidence.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {evidence.map((item) => (
          <a
            className="block overflow-hidden rounded-lg border border-line"
            href={item.url}
            key={item.id}
            rel="noreferrer"
            target="_blank"
          >
            {/* Evidence is served from a private API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={item.originalName}
              className="h-24 w-24 object-cover sm:h-28 sm:w-28"
              height={112}
              src={item.url}
              width={112}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
