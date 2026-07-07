function PersonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path d="M4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
    </svg>
  );
}

type AnonymousDisplayNameProps = {
  name: string;
};

export function AnonymousDisplayName({ name }: AnonymousDisplayNameProps) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-foreground/[0.035] py-0.5 pl-0.5 pr-2.5 ring-1 ring-foreground/4">
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-background/90 text-muted/55">
        <PersonIcon />
      </span>
      <span className="truncate text-sm font-medium tracking-tight text-foreground/85">
        {name}
      </span>
    </span>
  );
}
