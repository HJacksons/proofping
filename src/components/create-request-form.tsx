"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";

import { AttachmentPicker } from "@/components/attachment-picker";
import { PlaceAutocomplete } from "@/components/place-autocomplete";
import { ProductFeedbackPrompt } from "@/components/product-feedback-prompt";
import { ShareProofButton } from "@/components/share-proof-button";
import { MAX_EVIDENCE_FILES_PER_REQUEST } from "@/lib/evidence/validation";
import {
  proofRequestCategories,
  proofRequestExampleAsks,
} from "@/lib/proof-requests/categories";

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
  details: string;
  listingUrl: string;
}) {
  const parts: string[] = [];

  if (input.details.trim()) {
    parts.push(input.details.trim());
  }

  if (input.listingUrl.trim()) {
    parts.push(input.listingUrl.trim());
  }

  if (parts.length === 0) {
    return "Please check what you can and reply honestly.";
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
  const [showAiConfirm, setShowAiConfirm] = useState(false);
  const [locationHint, setLocationHint] = useState("");
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const titleFieldId = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ status: "submitting", message: null, requestId: null, replyShareUrl: null });

    const formData = new FormData(form);
    const details = String(formData.get("details") ?? "").trim();
    const listingUrl = String(formData.get("listingUrl") ?? "").trim();
    const category = String(formData.get("category") ?? "OTHER");
    const visibility = String(formData.get("visibility") ?? "PRIVATE_LINK");

    formData.set("body", buildRequestBody({ details, listingUrl }));
    formData.set("category", category);
    formData.set("visibility", visibility);
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
    setLocationHint("");
    setState({
      status: "success",
      message: "Share link ready — send it to someone who’s there or who knows the place.",
      requestId: payload.request.id,
      replyShareUrl: payload.request.replyShareUrl ?? null,
    });

    window.setTimeout(() => {
      setShowFeedbackPrompt(true);
    }, 1200);
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
          locationHint: locationHint.trim() || undefined,
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

  function handleAiAssistClick() {
    if (improving || state.status === "submitting") {
      return;
    }

    if (!aiImproveEnabled) {
      setImproveError("AI wording help is not available in this environment right now.");
      return;
    }

    const title = titleRef.current?.value.trim() ?? "";

    if (title.length < 8) {
      setImproveError("Write your question first, then tap AI.");
      return;
    }

    setShowAiConfirm(true);
  }

  function confirmAiImprove() {
    setShowAiConfirm(false);
    void handleImproveWording();
  }

  return (
    <>
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 rounded-md border border-line bg-background px-4 py-3 text-sm">
        <p className="font-semibold">How ProofPing works</p>
        <div className="grid gap-2 text-muted sm:grid-cols-3">
          <p>
            <span className="font-semibold text-foreground">1. Ask</span> before
            you pay, go, or miss a better option.
          </p>
          <p>
            <span className="font-semibold text-foreground">2. Share</span> a
            private link, or open it to nearby helpers.
          </p>
          <p>
            <span className="font-semibold text-foreground">3. Decide</span> from
            a timestamped proof card.
          </p>
        </div>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-semibold" htmlFor={titleFieldId}>
            Your question
          </label>
          <button
            aria-disabled={improving || state.status === "submitting"}
            aria-label="Improve wording with AI"
            className="inline-flex size-11 items-center justify-center rounded-md border border-line bg-background text-accent-strong transition hover:border-accent/40 hover:bg-accent-soft disabled:opacity-60 aria-disabled:opacity-60"
            onClick={handleAiAssistClick}
            title="Improve wording with AI"
            type="button"
          >
            {improving ? <LoadingIcon /> : <AiIcon />}
          </button>
        </div>
        <input
          className="min-h-12 rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent"
          id={titleFieldId}
          maxLength={120}
          minLength={8}
          name="title"
          placeholder="Is the library printer working?"
          ref={titleRef}
          required
        />
        <div className="chip-scroll pt-1">
          {proofRequestExampleAsks.map((example) => (
            <button
              className="shrink-0 snap-start rounded-md border border-line bg-surface px-3 py-2.5 text-left text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground active:scale-[0.99]"
              key={example}
              onClick={() => {
                if (titleRef.current) {
                  titleRef.current.value = example;
                  titleRef.current.focus();
                }
                setImproveError(null);
              }}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
        {improveError ? (
          <p className="text-xs font-medium text-amber-800" role="alert">
            {improveError}
          </p>
        ) : null}
      </div>

      {showAiConfirm ? (
        <div
          aria-labelledby="ai-assist-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 px-4"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-md border border-line bg-surface p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
                <AiIcon />
              </span>
              <div>
                <h2 className="text-base font-semibold" id="ai-assist-title">
                  Improve wording with AI?
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  AI will only polish your question. You review the wording
                  before posting, and replies still come from real people.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="min-h-12 rounded-md px-3 text-sm font-semibold text-muted hover:bg-foreground/5 hover:text-foreground"
                onClick={() => setShowAiConfirm(false)}
                type="button"
              >
                Keep as is
              </button>
              <button
                className="min-h-12 rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong"
                onClick={confirmAiImprove}
                type="button"
              >
                Improve wording
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PlaceAutocomplete
        helpText="Pick a known place so helpers nearby can find your ask."
        label="Where?"
        name="locationHint"
        onChange={setLocationHint}
        placeholder="Campus library, downtown cafe, neighborhood..."
        value={locationHint}
      />

      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">Who can help?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid min-h-14 cursor-pointer gap-1 rounded-md border border-line bg-background px-4 py-3.5 text-sm has-checked:border-accent/40 has-checked:bg-accent-soft">
            <span className="flex items-center gap-2 font-semibold">
              <input
                className="size-5 accent-accent"
                defaultChecked
                name="visibility"
                type="radio"
                value="PRIVATE_LINK"
              />
              Private link
            </span>
            <span className="leading-5 text-muted">
              Only people with your helper link can reply.
            </span>
          </label>

          <label className="grid min-h-14 cursor-pointer gap-1 rounded-md border border-line bg-background px-4 py-3.5 text-sm has-checked:border-accent/40 has-checked:bg-accent-soft">
            <span className="flex items-center gap-2 font-semibold">
              <input
                className="size-5 accent-accent"
                name="visibility"
                type="radio"
                value="LOCAL_DISCOVERY"
              />
              Help nearby
            </span>
            <span className="leading-5 text-muted">
              People already there can help — and learn from your ask too.
            </span>
          </label>
        </div>
      </fieldset>

      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">Anything else?</span>
        <textarea
          className="min-h-24 rounded-md border border-line bg-background px-4 py-3 text-base leading-6 outline-none focus:border-accent"
          maxLength={2000}
          name="details"
          placeholder="Optional — which printer, which door, listing link, or what counts as proof."
          ref={detailsRef}
        />
      </label>

      <button
        className="inline-flex min-h-11 w-fit items-center text-sm font-semibold text-muted hover:text-foreground"
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
              className="min-h-12 rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent"
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
              className="min-h-12 rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent"
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

      <div className="sticky-above-nav sticky z-10 -mx-1 border-t border-line bg-surface/95 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent text-base font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
          disabled={state.status === "submitting"}
          type="submit"
        >
          {state.status === "submitting" ? "Creating..." : "Create helper link"}
        </button>
      </div>

      <p className="text-xs leading-5 text-muted">
        Safety rule: ask for public, lawful checks only. Do not request stalking,
        private identity data, harassment, or anything involving children.
      </p>

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
    <ProductFeedbackPrompt
      open={showFeedbackPrompt}
      path="/requests/new"
      requestId={state.requestId}
      onClose={() => setShowFeedbackPrompt(false)}
    />
    </>
  );
}

function AiIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 3 13.4 8.1 18 10l-4.6 1.9L12 17l-1.4-5.1L6 10l4.6-1.9L12 3Z" />
      <path d="M19 15.5 19.7 18l2.3 1-2.3 1-.7 2.5-.7-2.5-2.3-1 2.3-1 .7-2.5Z" />
      <path d="M4.5 14 5 15.7 6.5 16.4 5 17.1 4.5 18.8 4 17.1 2.5 16.4 4 15.7 4.5 14Z" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}
