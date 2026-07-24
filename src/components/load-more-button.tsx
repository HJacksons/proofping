"use client";

type LoadMoreButtonProps = {
  hasMore: boolean;
  loading: boolean;
  onClick: () => void;
  label?: string;
};

export function LoadMoreButton({
  hasMore,
  loading,
  onClick,
  label = "Load more",
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <button
      className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-line bg-surface text-base font-semibold text-muted transition hover:bg-foreground/5 hover:text-foreground disabled:opacity-60"
      disabled={loading}
      onClick={onClick}
      type="button"
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
