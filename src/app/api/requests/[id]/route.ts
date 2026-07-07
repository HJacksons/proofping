import { ZodError } from "zod";

import { ProofRequestForbiddenError } from "@/lib/proof-requests/errors";
import { updateProofRequestStatusSchema } from "@/lib/proof-requests/validation";
import {
  AdultVerificationRequiredError,
  AuthRequiredError,
} from "@/lib/server/auth";
import {
  getPublicProofRequest,
  updateProofRequestStatus,
} from "@/lib/server/proof-requests";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const proofRequest = await getPublicProofRequest(id);

  if (!proofRequest) {
    return Response.json({ error: "Proof request not found." }, { status: 404 });
  }

  return Response.json({ request: proofRequest });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const json = await request.json();
    const input = updateProofRequestStatusSchema.parse(json);
    const proofRequest = await updateProofRequestStatus(id, input);

    if (!proofRequest) {
      return Response.json({ error: "Proof request not found." }, { status: 404 });
    }

    return Response.json({ request: proofRequest });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid proof request update.",
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

    if (error instanceof ProofRequestForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json(
      { error: "Unable to update this proof request." },
      { status: 500 },
    );
  }
}
