import { ZodError } from "zod";

import { createProductFeedbackSchema } from "@/lib/feedback/validation";
import { createProductFeedback } from "@/lib/server/product-feedback";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = createProductFeedbackSchema.parse(json);
    const feedback = await createProductFeedback(input);

    return Response.json({ ok: true, feedback });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid feedback.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    console.error("[feedback]", error);
    return Response.json({ error: "Unable to save feedback." }, { status: 500 });
  }
}
