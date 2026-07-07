"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { AttachmentPicker } from "@/components/attachment-picker";
import { ShareProofButton } from "@/components/share-proof-button";
import { MAX_EVIDENCE_FILES_PER_REQUEST } from "@/lib/evidence/validation";
import { proofRequestCategories } from "@/lib/proof-requests/categories";

type SubmitState =
  | {
      status: "idle";
      message: null;
      requestId: null;
      replyShareUrl: null;
    }
  | {
      status: "submitting";
      message: null;
      requestId: null;
      replyShareUrl: null;
    }
  | {
      status: "success";
      message: string;
      requestId: string;
      replyShareUrl: string | null;
    }
  | {
      status: "error";
      message: string;
      requestId: null;
      replyShareUrl: null;
    };

const initialState: SubmitState = {
  status: "idle",
  message: null,
  requestId: null,
  replyShareUrl: null,
};

function buildRequestBody(input: {
  title: string;
  locationHint: string;
  details: string;
  listingUrl: string;
}) {
  const parts = [`I need help verifying: ${input.title.trim()}`];

  if (input.locationHint.trim()) {
    parts.push(`Location: ${input.locationHint.trim()}`);
  }

  if (input.listingUrl.trim()) {
    parts.push(`Link: ${input.listingUrl.trim()}`);
  }

  if (input.details.trim()) {
    parts.push(input.details.trim());
  } else {
    parts.push("Please check what you can and reply honestly.");
  }

  return parts.join("\n\n");
}

export function CreateRequestForm({
  aiImproveEnabled = false,
}: {
  aiImproveEnabled?: boolean;
}) {
  const [state, setState] = useState<SubmitState>(initialState);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ status: "submitting", message: null, requestId: null, replyShareUrl: null });

    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const locationHint = String(formData.get("locationHint") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim();
    const listingUrl = String(formData.get("listingUrl") ?? "").trim();
    const category = String(formData.get("category") ?? "OTHER");

    formData.set("body", buildRequestBody({ title, locationHint, details, listingUrl }));
    formData.set("category", category);
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await fetch("/api/requests", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ?? "Unable to create this request.",
        requestId: null,
        replyShareUrl: null,
      });
      return;
    }

    form.reset();
    setAttachments([]);
    setShowMore(false);
    setState({
      status: "success",
      message: "Ready to share.",
      requestId: payload.request.id,
      replyShareUrl: payload.request.replyShareUrl ?? null,
    });
  }

  async function handleImproveWording() {
    if (!aiImproveEnabled || improving) {
      return;
    }

    const title = titleRef.current?.value.trim() ?? "";

    if (title.length < 8) {
      setImproveError("Write your question first, then improve it.");
      return;
    }

    setImproving(true);
    setImproveError(null);

    try {
      const response = await fetch("/api/requests/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          locationHint: locationRef.current?.value.trim() || undefined,
          details: detailsRef.current?.value.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as {
        suggestion?: { title: string; details: string };
        error?: string;
      };

      if (!response.ok || !payload.suggestion) {
        setImproveError(payload.error ?? "Unable to improve wording right now.");
        return;
      }

      if (titleRef.current) {
        titleRef.current.value = payload.suggestion.title;
      }

      if (detailsRef.current) {
        detailsRef.current.value = payload.suggestion.details;
      }
    } catch {
      setImproveError("Unable to improve wording right now.");
    } finally {
      setImproving(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">Your question</span>
        <input
          className="min-h-12 rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent"
          maxLength={120}
          minLength={8}
          name="title"
          placeholder="Is this apartment listing real?"
          ref={titleRef}
          required
        />
      </label>

      {aiImproveEnabled ? (
        <div className="grid gap-1">
          <button
            className="inline-flex w-fit text-sm font-semibold text-accent-strong hover:underline disabled:opacity-60"
            disabled={improving || state.status === "submitting"}
            onClick={() => {
              void handleImproveWording();
            }}
            type="button"
          >
            {improving ? "Improving..." : "Improve wording"}
          </button>
          {improveError ? (
            <p className="text-sm text-amber-800" role="alert">
              {improveError}
            </p>
          ) : null}
        </div>
      ) : null}

      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">Where?</span>
        <input
          className="min-h-11 rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent"
          maxLength={160}
          name="locationHint"
          placeholder="City or neighborhood (optional)"
          ref={locationRef}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">Anything else?</span>
        <textarea
          className="min-h-24 rounded-md border border-line bg-background px-4 py-3 text-base leading-6 outline-none focus:border-accent"
          maxLength={2000}
          name="details"
          placeholder="Optional — address, price, or what would count as proof."
          ref={detailsRef}
        />
      </label>

      <button
        className="inline-flex w-fit text-sm font-semibold text-muted hover:text-foreground"
        onClick={() => setShowMore((current) => !current)}
        type="button"
      >
        {showMore ? "Hide options" : "Add link, photos, or category"}
      </button>

      {showMore ? (
        <div className="grid gap-4 border-t border-line pt-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Category</span>
            <select
              className="min-h-11 rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent"
              defaultValue="OTHER"
              name="category"
            >
              {proofRequestCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Link</span>
            <input
              className="min-h-11 rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent"
              maxLength={2048}
              name="listingUrl"
              placeholder="Listing or shop URL (optional)"
              type="url"
            />
          </label>

          <AttachmentPicker
            helpText="Up to 2 photos, 8 MB each."
            inputId="proof-request-attachments"
            label="Photos"
            maxFiles={MAX_EVIDENCE_FILES_PER_REQUEST}
            onChange={setAttachments}
          />
        </div>
      ) : (
        <input name="category" type="hidden" value="OTHER" />
      )}

      <button
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
        disabled={state.status === "submitting"}
        type="submit"
      >
        {state.status === "submitting" ? "Creating..." : "Create & share"}
      </button>

      {state.message ? (
        <div
          className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-background px-4 py-3 text-sm"
          role={state.status === "error" ? "alert" : "status"}
        >
          <p className="flex-1 font-medium">{state.message}</p>
          {state.requestId && state.replyShareUrl ? (
            <ShareProofButton
              layout="inline"
              shareUrl={state.replyShareUrl}
              title="Your proof request"
            />
          ) : null}
          {state.requestId ? (
            <Link
              className="text-sm font-semibold text-accent-strong hover:underline"
              href={`/requests/${state.requestId}`}
            >
              Open
            </Link>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
