import type { ReactNode } from "react";

type IconActionProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  children: ReactNode;
};

export function IconAction({
  label,
  onClick,
  disabled = false,
  type = "button",
  children,
}: IconActionProps) {
  return (
    <button
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      <span className="text-foreground/70">{children}</span>
      <span>{label}</span>
    </button>
  );
}

export function ActionRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-stretch border-t border-line">{children}</div>
  );
}
