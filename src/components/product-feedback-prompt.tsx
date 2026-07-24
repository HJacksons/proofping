"use client";

import { useId } from "react";

import { ProductFeedbackForm } from "@/components/product-feedback-form";

type ProductFeedbackPromptProps = {
  open: boolean;
  requestId?: string | null;
  path?: string;
  onClose: () => void;
};

export function ProductFeedbackPrompt({
  open,
  requestId = null,
  path = "/requests/new",
  onClose,
}: ProductFeedbackPromptProps) {
  const titleId = useId();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        aria-label="Dismiss feedback"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[1px]"
        onClick={onClose}
        type="button"
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-[0_20px_60px_rgba(17,17,17,0.18)] ring-1 ring-line"
        role="dialog"
      >
        <div className="border-b border-line bg-accent-soft/50 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-strong">
            Quick pulse
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight" id={titleId}>
            Anything rough about that?
          </h2>
          <p className="mt-1 text-sm text-muted">
            10 seconds. Bugs, confusion, or a sharp idea — we read these.
          </p>
        </div>
        <div className="px-5 py-5">
          <ProductFeedbackForm
            key={requestId ?? "feedback"}
            onSkip={onClose}
            onSubmitted={() => {
              window.setTimeout(() => onClose(), 900);
            }}
            path={path}
            requestId={requestId}
            variant="dialog"
          />
        </div>
      </div>
    </div>
  );
}
