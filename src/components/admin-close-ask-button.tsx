"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminCloseAskButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function closeAsk() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/requests/${requestId}/close`, {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to close ask.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to close ask.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-1">
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-line px-3 text-sm font-semibold text-muted hover:text-foreground disabled:opacity-60"
        disabled={loading}
        onClick={() => {
          void closeAsk();
        }}
        type="button"
      >
        {loading ? "Closing..." : "Close ask"}
      </button>
      {error ? (
        <p className="text-xs text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
