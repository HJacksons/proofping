import type { ReactNode } from "react";

type FeedCardProps = {
  children: ReactNode;
  className?: string;
};

export function FeedCard({ children, className = "" }: FeedCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-lg border border-line bg-surface ${className}`.trim()}
    >
      {children}
    </article>
  );
}

export function FeedCardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-4 py-3 sm:px-5 sm:py-4 ${className}`.trim()}>{children}</div>;
}
