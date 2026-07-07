import { ZodError } from "zod";

import { createProofRequestSchema } from "@/lib/proof-requests/validation";
import {
  createProofRequest,
  listOwnProofRequests,
} from "@/lib/server/proof-requests";
import {
  AdultVerificationRequiredError,
  AuthRequiredError,
} from "@/lib/server/auth";
import {
  EvidenceValidationError,
  extractAttachmentFiles,
} from "@/lib/server/request-evidence";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const page = await listOwnProofRequests({
      cursor,
    });

    return Response.json({
      requests: page.items,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    });
  } catch (error) {
    return requestErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const input = createProofRequestSchema.parse({
        title: formData.get("title"),
        body: formData.get("body"),
        category: formData.get("category"),
        locationHint: formData.get("locationHint"),
        listingUrl: formData.get("listingUrl"),
      });
      const proofRequest = await createProofRequest(
        input,
        extractAttachmentFiles(formData),
      );

      return Response.json({ request: proofRequest }, { status: 201 });
    }

    const json = await request.json();
    const input = createProofRequestSchema.parse(json);
    const proofRequest = await createProofRequest(input);

    return Response.json({ request: proofRequest }, { status: 201 });
  } catch (error) {
    return requestErrorResponse(error);
  }
}

function requestErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Invalid proof request.",
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

  if (error instanceof AuthRequiredError) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof AdultVerificationRequiredError) {
    return Response.json({ error: error.message }, { status: 403 });
  }

  return Response.json({ error: "Unable to process request." }, { status: 500 });
}
