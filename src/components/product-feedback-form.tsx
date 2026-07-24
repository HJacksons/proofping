"use client";

import { useState } from "react";

import {
  getProductFeedbackCategoryLabel,
  productFeedbackCategoryValues,
  type ProductFeedbackCategory,
} from "@/lib/feedback/categories";

type ProductFeedbackFormProps = {
  path: string;
  requestId?: string | null;
  variant?: "page" | "dialog";
  onSkip?: () => void;
  onSubmitted?: () => void;
};

export function ProductFeedbackForm({
  path,
  requestId = null,
  variant = "page",
  onSkip,
  onSubmitted,
}: ProductFeedbackFormProps) {
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
      onSubmitted?.();
    } catch {
      setError("Unable to send feedback.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm leading-6 text-muted" role="status">
        Thanks — feedback saved. We read these.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
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
        {onSkip ? (
          <button
            className="text-sm font-semibold text-muted hover:text-foreground"
            onClick={onSkip}
            type="button"
          >
            Skip
          </button>
        ) : (
          <span />
        )}
        <button
          className={
            variant === "dialog"
              ? "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
              : "inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-base font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50 sm:w-auto"
          }
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
  );
}
