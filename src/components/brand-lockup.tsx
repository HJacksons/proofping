type BrandLockupProps = {
  compact?: boolean;
};

export function BrandLockup({ compact = false }: BrandLockupProps) {
  return (
    <span
      className={`inline-flex items-center text-left ${
        compact ? "gap-2" : "gap-3"
      }`}
    >
      <BrandMark compact={compact} />
      <span className={compact ? "grid gap-1 pt-0.5" : "grid gap-1"}>
        <span
          className={
            compact
              ? "text-[1.22rem] font-extrabold leading-none tracking-tight"
              : "text-[1.45rem] font-extrabold leading-none tracking-tight"
          }
        >
          ProofPing
        </span>
        <span
          className={
            compact
              ? "text-[9.5px] font-medium lowercase leading-none tracking-[0.07em] text-muted [font-variant-caps:all-small-caps] sm:text-[10px]"
              : "text-[11px] font-medium lowercase leading-none tracking-[0.1em] text-muted [font-variant-caps:all-small-caps]"
          }
        >
          Proof before you decide
        </span>
      </span>
    </span>
  );
}

function BrandMark({ compact }: { compact: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center rounded-[7px] bg-accent text-white shadow-sm ${
        compact ? "size-10" : "size-12"
      }`}
    >
      <svg className={compact ? "size-6" : "size-7"} fill="none" viewBox="0 0 24 24">
        <path
          d="M12 3.5 6.5 6.4v5.1c0 4 2.5 7.4 5.5 8.5 3-1.1 5.5-4.5 5.5-8.5V6.4L12 3.5Z"
          fill="currentColor"
          opacity="0.22"
        />
        <path
          d="M8.5 12.1 10.8 14.4 15.8 9.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M12 3.5 6.5 6.4v5.1c0 4 2.5 7.4 5.5 8.5 3-1.1 5.5-4.5 5.5-8.5V6.4L12 3.5Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
      <span
        className={`absolute rounded-full border-2 border-surface bg-warn-soft ${
          compact ? "-right-1 -top-1 size-3" : "-right-1.5 -top-1.5 size-3.5"
        }`}
      />
    </span>
  );
}
