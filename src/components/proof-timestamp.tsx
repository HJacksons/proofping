import { formatProofTimestamp } from "@/lib/datetime/format";

type ProofTimestampProps = {
  value: string;
  className?: string;
  /** e.g. "Proven" for reply proof cards */
  prefix?: string;
};

export function ProofTimestamp({
  value,
  className,
  prefix,
}: ProofTimestampProps) {
  const label = formatProofTimestamp(value);

  return (
    <time className={className} dateTime={value}>
      {prefix ? `${prefix} ${label}` : label}
    </time>
  );
}
