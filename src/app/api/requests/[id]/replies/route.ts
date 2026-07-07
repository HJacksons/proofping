import { ZodError } from "zod";

import { createProofReplySchema } from "@/lib/proof-replies/validation";
import { RequesterSelfReplyError } from "@/lib/proof-replies/errors";
import {
  InvalidReplyCapabilityTokenError,
  ProofRequestNotOpenForRepliesError,
} from "@/lib/proof-requests/errors";
import { createProofReply, listProofReplies } from "@/lib/server/proof-replies";
import {
  EvidenceValidationError,
  extractAttachmentFiles,
} from "@/lib/server/request-evidence";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const page = await listProofReplies(id, { cursor });

  return Response.json({
    replies: page.items,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const input = createProofReplySchema.parse({
        helperName: formData.get("helperName"),
        verdict: formData.get("verdict"),
        body: formData.get("body"),
      });
      const reply = await createProofReply(
        id,
        input,
        extractAttachmentFiles(formData),
        formData.get("replyToken")?.toString(),
      );

      if (!reply) {
        return Response.json({ error: "Proof request not found." }, { status: 404 });
      }

      return Response.json({ reply }, { status: 201 });
    }

    const json = await request.json();
    const input = createProofReplySchema.parse(json);
    const reply = await createProofReply(
      id,
      input,
      [],
      typeof json.replyToken === "string" ? json.replyToken : undefined,
    );

    if (!reply) {
      return Response.json({ error: "Proof request not found." }, { status: 404 });
    }

    return Response.json({ reply }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid proof reply.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    if (error instanceof EvidenceValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof RequesterSelfReplyError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof ProofRequestNotOpenForRepliesError) {
      return Response.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof InvalidReplyCapabilityTokenError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json({ error: "Unable to submit reply." }, { status: 500 });
  }
}
