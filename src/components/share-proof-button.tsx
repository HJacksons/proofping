"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ActionRow, IconAction } from "@/components/ui/icon-action";
import { buildSharePayload } from "@/lib/proof-requests/share-message";

type ShareProofButtonProps = {
  shareUrl: string;
  title: string;
  disabled?: boolean;
  layout?: "inline" | "bar";
  urgent?: boolean;
};

type ToastState = "idle" | "copied" | "shared" | "error";

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M13 4.5 18 9l-5 4.5V11a6 6 0 0 0-6 6v2a8 8 0 0 1 8-8V4.5Z" />
      <path d="M6 7a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-1h2v1a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5h1v2H6Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M9.5 8.5a3.5 3.5 0 0 1 4.95 0l1.3 1.3a3.5 3.5 0 0 1-4.95 4.95l-.75-.75 1.4-1.4.75.75a1.5 1.5 0 1 0-2.12-2.12l-1.3-1.3a1.5 1.5 0 0 0-2.12 0 1.5 1.5 0 0 0 0 2.12l.75.75-1.4 1.4-.75-.75a3.5 3.5 0 1 1 4.95-4.95l1.3 1.3a3.5 3.5 0 0 1 0 4.95 3.5 3.5 0 0 1-4.95 0l-.75-.75 1.4-1.4.75.75Z" />
    </svg>
  );
}

export function ShareProofButton({
  shareUrl,
  title,
  disabled = false,
  layout = "bar",
  urgent = false,
}: ShareProofButtonProps) {
  const dialogTitleId = useId();
  const noteFieldId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<ToastState>("idle");

  useEffect(() => {
    if (toast === "idle") {
      return;
    }

    const timer = window.setTimeout(() => setToast("idle"), 2200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  function openDialog() {
    if (!disabled) {
      dialogRef.current?.showModal();
    }
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function copyLink() {
    if (disabled) {
      return;
    }

    try {
      await navigator.clipboard.writeText(buildSharePayload(title, shareUrl, undefined, urgent));
      setToast("copied");
    } catch {
      setToast("error");
    }
  }

  async function shareWithNote() {
    const payload = buildSharePayload(title, shareUrl, note, urgent);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          text: payload,
        });
        setToast("shared");
        closeDialog();
        setNote("");
        return;
      } catch {
        // User cancelled or share failed.
      }
    }

    try {
      await navigator.clipboard.writeText(payload);
      setToast("copied");
      closeDialog();
      setNote("");
    } catch {
      setToast("error");
    }
  }

  const actions = (
    <>
      <IconAction disabled={disabled} label="Share" onClick={openDialog}>
        <ShareIcon />
      </IconAction>
      <IconAction disabled={disabled} label="Copy link" onClick={copyLink}>
        <LinkIcon />
      </IconAction>
    </>
  );

  return (
    <>
      {layout === "bar" ? <ActionRow>{actions}</ActionRow> : (
        <div className="inline-flex items-center">{actions}</div>
      )}

      {toast !== "idle" ? (
        <p className="px-4 py-2 text-xs font-medium text-muted" role="status">
          {toast === "copied"
            ? "Link copied"
            : toast === "shared"
              ? "Shared"
              : "Could not share"}
        </p>
      ) : null}

      <dialog
        className="fixed left-1/2 top-1/2 w-[min(100vw-2rem,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-0 shadow-lg backdrop:bg-foreground/25"
        onClose={() => setNote("")}
        ref={dialogRef}
      >
        {/* Use a div, not a form — this dialog is often rendered inside CreateRequestForm. */}
        <div className="grid gap-4 p-4">
          <div className="grid gap-1">
            <h2 className="text-base font-semibold" id={dialogTitleId}>
              Share request
            </h2>
            <p className="text-sm leading-6 text-muted">
              Add a note, then pick any app on your phone or computer.
            </p>
          </div>

          <label className="grid gap-1" htmlFor={noteFieldId}>
            <span className="text-sm font-medium text-muted">Note</span>
            <textarea
              className="min-h-24 rounded-md border border-line bg-background px-4 py-3 text-base leading-6 outline-none focus:border-accent"
              id={noteFieldId}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              value={note}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              className="min-h-12 rounded-md px-3 text-sm font-semibold text-muted hover:bg-foreground/5 hover:text-foreground"
              onClick={closeDialog}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-12 rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong"
              onClick={() => {
                void shareWithNote();
              }}
              type="button"
            >
              Share
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
