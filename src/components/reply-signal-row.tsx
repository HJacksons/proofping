type ReplySignalRowProps = {
  replyCount: number;
};

export function ReplySignalRow({ replyCount }: ReplySignalRowProps) {
  const filledBars = Math.min(replyCount, 3);

  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        Reply momentum
      </p>
      <div className="flex items-center gap-2">
        <div aria-hidden="true" className="flex items-end gap-0.5">
          {[1, 2, 3].map((level) => (
            <span
              className={`w-1.5 rounded-sm ${
                level <= filledBars ? "bg-accent" : "bg-foreground/15"
              } ${level === 1 ? "h-2" : level === 2 ? "h-3" : "h-4"}`}
              key={level}
            />
          ))}
        </div>
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{replyCount}</span>{" "}
          {replyCount === 1 ? "reply" : "replies"}
        </p>
      </div>
    </div>
  );
}
