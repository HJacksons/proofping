import type { ReactNode } from "react";

type SiteShellProps = {
  children: ReactNode;
  width?: "narrow" | "wide";
  className?: string;
};

const widthClasses = {
  narrow: "max-w-3xl",
  wide: "max-w-6xl",
} as const;

export function SiteShell({
  children,
  width = "narrow",
  className = "",
}: SiteShellProps) {
  return (
    <div
      className={[
        "mx-auto grid w-full gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10",
        widthClasses[width],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
