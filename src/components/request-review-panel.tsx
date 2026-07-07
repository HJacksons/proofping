"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  getProofRequestStatusLabel,
  isProofRequestStatus,
  type ProofRequestStatus,
} from "@/lib/proof-requests/status";

type RequestReviewPanelProps = {
  requestId: string;
  status: string;
};

const reviewActions: Array<{
  status: ProofRequestStatus;
  label: string;
}> = [
  { status: "SOLVED", label: "Solved" },
  { status: "SUSPICIOUS", label: "Suspicious" },
  { status: "UNRESOLVED", label: "Unresolved" },
  { status: "CLOSED", label: "Closed" },
];

const terminalStatuses = new Set<ProofRequestStatus>(["SOLVED", "CLOSED"]);

export function RequestReviewPanel({
  requestId,
  status,
}: RequestReviewPanelProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function updateStatus(nextStatus: ProofRequestStatus) {
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    const payload = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to update this request.");
      return;
    }

    setCurrentStatus(payload.request.status);
    setMessage(`Marked ${getProofRequestStatusLabel(payload.request.status).toLowerCase()}.`);
    router.refresh();
  }

  const isTerminal =
    isProofRequestStatus(currentStatus) && terminalStatuses.has(currentStatus);

  return (
    <section className="border-t border-line px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Status:{" "}
          <span className="font-semibold text-foreground">
            {getProofRequestStatusLabel(currentStatus)}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-1">
          {!isTerminal
            ? reviewActions.map((action) => {
                const isActive = currentStatus === action.status;

                return (
                  <button
                    className={`rounded-md px-2.5 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
                      isActive
                        ? "text-accent-strong"
                        : "text-muted hover:bg-foreground/5 hover:text-foreground"
                    }`}
                    disabled={isSubmitting || isActive}
                    key={action.status}
                    onClick={() => updateStatus(action.status)}
                    type="button"
                  >
                    {action.label}
                  </button>
                );
              })
            : null}
          {currentStatus !== "OPEN" ? (
            <button
              className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-muted transition hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
              disabled={isSubmitting}
              onClick={() => updateStatus("OPEN")}
              type="button"
            >
              Reopen
            </button>
          ) : null}
        </div>
      </div>

      {message ? (
        <p className="mt-2 text-xs text-muted" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
