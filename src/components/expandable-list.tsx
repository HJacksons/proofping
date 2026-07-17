"use client";

import { useState } from "react";

type ExpandableListProps = {
  children: React.ReactNode[];
  initialCount?: number;
  moreLabel?: string;
  lessLabel?: string;
};

export function ExpandableList({
  children,
  initialCount = 8,
  moreLabel = "View more",
  lessLabel = "Show less",
}: ExpandableListProps) {
  const [expanded, setExpanded] = useState(false);
  const items = children.filter(Boolean);
  const needsToggle = items.length > initialCount;
  const visible = expanded || !needsToggle ? items : items.slice(0, initialCount);

  return (
    <div className="grid gap-2">
      <ul className="grid gap-2">{visible}</ul>
      {needsToggle ? (
        <button
          className="justify-self-start text-sm font-semibold text-accent-strong hover:underline"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded
            ? lessLabel
            : `${moreLabel} (${items.length - initialCount} more)`}
        </button>
      ) : null}
    </div>
  );
}
