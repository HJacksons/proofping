"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminSeedSamplesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSamples() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/samples/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const payload = (await response.json()) as {
        error?: string;
        asks?: number;
        proofs?: number;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to load sample activity.");
        return;
      }

      setMessage(
        `Loaded ${payload.asks ?? 0} asks · ${payload.proofs ?? 0} proofs. Check Help nearby.`,
      );
      router.refresh();
    } catch {
      setError("Unable to load sample activity.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        className="inline-flex w-fit rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-60"
        disabled={loading}
        onClick={() => {
          void loadSamples();
        }}
        type="button"
      >
        {loading ? "Loading…" : "Load sample Help nearby activity"}
      </button>
      {message ? (
        <p className="text-sm text-accent-strong" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
