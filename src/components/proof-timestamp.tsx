import { formatProofTimestamp } from "@/lib/datetime/format";

type ProofTimestampProps = {
  value: string;
  className?: string;
};

export function ProofTimestamp({ value, className }: ProofTimestampProps) {
  return (
    <time className={className} dateTime={value}>
      {formatProofTimestamp(value)}
    </time>
  );
}
