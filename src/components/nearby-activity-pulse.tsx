type NearbyActivityPulseProps = {
  openAsks: number;
  lookingNow: number;
  proofsLastHour: number;
  watchers: number;
  placeLabel: string | null;
};

function formatCount(value: number) {
  if (value >= 1000) {
    return `${Math.floor(value / 100) / 10}k`;
  }
  return String(value);
}

export function NearbyActivityPulse({
  openAsks,
  lookingNow,
  proofsLastHour,
  watchers,
  placeLabel,
}: NearbyActivityPulseProps) {
  const placeBit = placeLabel ? ` near ${placeLabel}` : " nearby";

  return (
    <section
      aria-label="Nearby activity"
      className="grid gap-3 rounded-md border border-line bg-surface px-4 py-3"
    >
      <div>
        <p className="text-sm font-semibold">Right now{placeBit}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted">
          Open asks · people looking · proofs landing. Density you can feel.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Open asks
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-accent-strong">
            {formatCount(openAsks)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Looking now
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight">
            {formatCount(lookingNow)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Proofs / hour
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight">
            {formatCount(proofsLastHour)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Watching
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight">
            {formatCount(watchers)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
