import { ZodError } from "zod";

import { improveProofRequestSchema } from "@/lib/ai/improve-request";
import { AiHelperNotConfiguredError, AiImproveError } from "@/lib/ai/errors";
import {
  AdultVerificationRequiredError,
  AuthRequiredError,
} from "@/lib/server/auth";
import { improveProofRequestWording } from "@/lib/server/openai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { requireCurrentUser } = await import("@/lib/server/auth");
    await requireCurrentUser();

    const json = await request.json();
    const input = improveProofRequestSchema.parse(json);
    const suggestion = await improveProofRequestWording(input);

    return Response.json({ suggestion });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid improve request.",
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

    if (error instanceof AiHelperNotConfiguredError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof AiImproveError) {
      return Response.json({ error: error.message }, { status: 502 });
    }

    return Response.json({ error: "Unable to improve this request." }, { status: 500 });
  }
}
