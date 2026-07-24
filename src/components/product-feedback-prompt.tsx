"use client";

import { useId, useState } from "react";

import {
  getProductFeedbackCategoryLabel,
  productFeedbackCategoryValues,
  type ProductFeedbackCategory,
} from "@/lib/feedback/categories";

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
  if (!open) {
    return null;
  }

  return (
    <ProductFeedbackDialog
      key={requestId ?? "feedback"}
      onClose={onClose}
      path={path}
      requestId={requestId}
    />
  );
}

function ProductFeedbackDialog({
  requestId,
  path,
  onClose,
}: {
  requestId: string | null;
  path: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const [category, setCategory] = useState<ProductFeedbackCategory | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!category || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          path,
          requestId,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        issues?: Array<{ message: string }>;
      };

      if (!response.ok) {
        setError(
          payload.issues?.[0]?.message ??
            payload.error ??
            "Unable to send feedback.",
        );
        return;
      }

      setDone(true);
      window.setTimeout(() => {
        onClose();
      }, 900);
    } catch {
      setError("Unable to send feedback.");
    } finally {
      setSaving(false);
    }
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
            {done ? "Thanks — that helps." : "Anything rough about that?"}
          </h2>
          {!done ? (
            <p className="mt-1 text-sm text-muted">
              10 seconds. Bugs, confusion, or a sharp idea — we read these.
            </p>
          ) : null}
        </div>

        {done ? (
          <div className="px-5 py-6 text-sm text-muted">
            Feedback saved. Back to your ask.
          </div>
        ) : (
          <div className="grid gap-4 px-5 py-5">
            <div className="grid grid-cols-2 gap-2">
              {productFeedbackCategoryValues.map((value) => {
                const active = category === value;
                return (
                  <button
                    className={[
                      "rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ring-1",
                      active
                        ? "bg-accent text-white ring-accent"
                        : "bg-background text-foreground ring-line hover:ring-accent/40",
                    ].join(" ")}
                    key={value}
                    onClick={() => setCategory(value)}
                    type="button"
                  >
                    {getProductFeedbackCategoryLabel(value)}
                  </button>
                );
              })}
            </div>

            {category && category !== "all_good" ? (
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">What should we fix or improve?</span>
                <textarea
                  className="min-h-24 w-full resize-y rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
                  maxLength={1000}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Be specific — page, button, or what you expected…"
                  value={message}
                />
              </label>
            ) : null}

            {error ? (
              <p className="text-sm text-amber-800" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                className="text-sm font-semibold text-muted hover:text-foreground"
                onClick={onClose}
                type="button"
              >
                Skip
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
                disabled={!category || saving}
                onClick={() => {
                  void submit();
                }}
                type="button"
              >
                {saving ? "Sending…" : "Send feedback"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
