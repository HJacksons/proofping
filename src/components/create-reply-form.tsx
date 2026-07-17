"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  composeProofReplyBody,
  getProofEvidenceOption,
  proofEvidenceOptions,
  type ProofEvidenceOptionId,
} from "@/lib/proof-replies/evidence-options";
import { proofReplyVerdicts } from "@/lib/proof-replies/verdicts";
import { AttachmentPicker } from "@/components/attachment-picker";
import { MAX_EVIDENCE_FILES_PER_REPLY } from "@/lib/evidence/validation";

type ReplySubmitState =
  | {
      status: "idle";
      message: null;
    }
  | {
      status: "submitting";
      message: null;
    }
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

const initialState: ReplySubmitState = {
  status: "idle",
  message: null,
};

const quickPickClass = (isSelected: boolean, verdict: string) => {
  if (!isSelected) {
    return "grid gap-2 rounded-md border border-line bg-background px-3 py-3 text-left text-sm font-semibold text-muted transition hover:border-accent/30 hover:bg-accent-soft hover:text-foreground";
  }

  if (verdict === "CONFIRMED") {
    return "grid gap-2 rounded-md border border-accent/30 bg-accent-soft px-3 py-3 text-left text-sm font-semibold text-accent-strong";
  }

  if (verdict === "SUSPICIOUS") {
    return "grid gap-2 rounded-md border border-amber-200 bg-warn-soft px-3 py-3 text-left text-sm font-semibold text-amber-900";
  }

  return "grid gap-2 rounded-md border border-line bg-foreground/5 px-3 py-3 text-left text-sm font-semibold text-foreground";
};

export function CreateReplyForm({
  requestId,
  replyToken,
  hasRequestEvidence = true,
}: {
  requestId: string;
  replyToken?: string;
  hasRequestEvidence?: boolean;
}) {
  const [state, setState] = useState<ReplySubmitState>(initialState);
  const [selectedEvidenceId, setSelectedEvidenceId] =
    useState<ProofEvidenceOptionId | null>(null);
  const [note, setNote] = useState("");
  const [showCustomReply, setShowCustomReply] = useState(false);
  const [customVerdict, setCustomVerdict] = useState<
    "CONFIRMED" | "SUSPICIOUS" | "UNSURE"
  >("UNSURE");
  const [customBody, setCustomBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const router = useRouter();

  const selectedEvidence = selectedEvidenceId
    ? getProofEvidenceOption(selectedEvidenceId)
    : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting", message: null });

    const payload = showCustomReply
      ? {
          verdict: customVerdict,
          body: customBody.trim(),
        }
      : selectedEvidence
        ? {
            verdict: selectedEvidence.verdict,
            body: composeProofReplyBody(selectedEvidence.body, note),
          }
        : null;

    if (!payload) {
      setState({
        status: "error",
        message: "Pick the closest match, or write your own short reply.",
      });
      return;
    }

    const formData = new FormData();
    formData.set("verdict", payload.verdict);
    formData.set("body", payload.body);
    if (replyToken) {
      formData.set("replyToken", replyToken);
    }
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await fetch(`/api/requests/${requestId}/replies`, {
      method: "POST",
      body: formData,
    });
    const responsePayload = await response.json();

    if (!response.ok) {
      const issueMessage = Array.isArray(responsePayload.issues)
        ? responsePayload.issues[0]?.message
        : null;

      setState({
        status: "error",
        message:
          issueMessage ??
          responsePayload.error ??
          "Unable to submit this reply.",
      });
      return;
    }

    setSelectedEvidenceId(null);
    setNote("");
    setCustomBody("");
    setAttachments([]);
    setShowCustomReply(false);
    router.refresh();
    setState({
      status: "success",
      message: "Proof added — the result card just got stronger.",
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {!showCustomReply ? (
        <>
          <div className="grid gap-2">
            <span className="text-sm font-semibold">Your answer</span>
            <span className="text-sm text-muted">
              Takes about 20 seconds. Pick the closest signal, add a note only if
              it helps.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {proofEvidenceOptions.map((option) => {
              const isSelected = selectedEvidenceId === option.id;

              return (
                <button
                  className={quickPickClass(isSelected, option.verdict)}
                  key={option.id}
                  onClick={() => setSelectedEvidenceId(option.id)}
                  type="button"
                >
                  <span className={verdictPillClass(option.verdict)}>
                    {verdictShortLabels[option.verdict]}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {selectedEvidence ? (
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">Note</span>
              <span className="text-sm text-muted">Optional extra detail.</span>
              <input
                className="min-h-10 w-full rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-accent"
                maxLength={200}
                onChange={(event) => setNote(event.target.value)}
                placeholder={
                  hasRequestEvidence
                    ? "e.g. Same sign as the photos"
                    : "e.g. I know Denver, but need photos or an address to check this listing"
                }
                value={note}
              />
            </label>
          ) : null}
        </>
      ) : (
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-sm font-semibold">Custom reply</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {proofReplyVerdicts.map((verdict) => (
              <button
                className={quickPickClass(
                  customVerdict === verdict.value,
                  verdict.value,
                )}
                key={verdict.value}
                onClick={() => setCustomVerdict(verdict.value)}
                type="button"
              >
                {verdict.label}
              </button>
            ))}
          </div>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Reply</span>
            <textarea
              className="min-h-24 w-full rounded-md border border-line bg-background px-3 py-2 text-sm leading-6 outline-none focus:border-accent"
              maxLength={500}
              minLength={8}
              onChange={(event) => setCustomBody(event.target.value)}
              placeholder="What do you know or what did you check?"
              required
              value={customBody}
            />
          </label>
        </div>
      )}

      <AttachmentPicker
        helpText="Optional proof photos. Up to 2 photos, 8 MB each."
        inputId="proof-reply-attachments"
        label="Photos"
        maxFiles={MAX_EVIDENCE_FILES_PER_REPLY}
        onChange={setAttachments}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          disabled={
            state.status === "submitting" ||
            (!showCustomReply && !selectedEvidence) ||
            (showCustomReply && customBody.trim().length < 8)
          }
          type="submit"
        >
          {state.status === "submitting" ? "Sending..." : "Send quick proof"}
        </button>

        <button
          className="text-sm font-semibold text-accent-strong underline underline-offset-4"
          onClick={() => {
            setShowCustomReply((current) => !current);
            setSelectedEvidenceId(null);
            setNote("");
          }}
          type="button"
        >
          {showCustomReply ? "Use quick picks" : "Write your own"}
        </button>
      </div>

      {state.message ? (
        <p className="text-sm font-medium text-muted" role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

const verdictShortLabels = {
  CONFIRMED: "Confirm",
  SUSPICIOUS: "Flag",
  UNSURE: "Unsure",
} as const;

function verdictPillClass(verdict: string) {
  if (verdict === "CONFIRMED") {
    return "w-fit rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-accent-strong";
  }

  if (verdict === "SUSPICIOUS") {
    return "w-fit rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-amber-900";
  }

  return "w-fit rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted";
}
