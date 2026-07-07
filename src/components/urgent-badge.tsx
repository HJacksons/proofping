type UrgentBadgeProps = {
  className?: string;
};

export function UrgentBadge({ className = "" }: UrgentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-warn-soft px-2 py-0.5 text-xs font-semibold text-amber-950 ${className}`.trim()}
    >
      <BoltIcon />
      Urgent
    </span>
  );
}

function BoltIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}
