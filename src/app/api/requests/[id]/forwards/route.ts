import { ZodError } from "zod";

import {
  ProofForwardForbiddenError,
  ProofForwardLimitError,
  ProofForwardNotAllowedError,
  ProofForwardSelfEmailError,
} from "@/lib/proof-forwards/errors";
import { createProofForwardSchema } from "@/lib/proof-forwards/validation";
import {
  AdultVerificationRequiredError,
  AuthRequiredError,
} from "@/lib/server/auth";
import {
  createProofForward,
  listProofForwards,
} from "@/lib/server/proof-forwards";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const forwards = await listProofForwards(id);

    if (!forwards) {
      return Response.json({ error: "Proof request not found." }, { status: 404 });
    }

    return Response.json({ forwards });
  } catch (error) {
    return forwardErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const json = await request.json();
    const input = createProofForwardSchema.parse(json);
    const result = await createProofForward(id, input);

    if (!result) {
      return Response.json({ error: "Proof request not found." }, { status: 404 });
    }

    return Response.json(
      {
        forward: result.forward,
        message: `Forward sent to ${result.forward.recipientEmail}.`,
      },
      { status: 201 },
    );
  } catch (error) {
    return forwardErrorResponse(error);
  }
}

function forwardErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Invalid forward request.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof AuthRequiredError) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof AdultVerificationRequiredError) {
    return Response.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof ProofForwardForbiddenError) {
    return Response.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof ProofForwardSelfEmailError) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof ProofForwardNotAllowedError) {
    return Response.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof ProofForwardLimitError) {
    return Response.json({ error: error.message }, { status: 429 });
  }

  return Response.json({ error: "Unable to forward this proof request." }, { status: 500 });
}
