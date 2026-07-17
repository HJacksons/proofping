import { ZodError } from "zod";

import { recordSiteVisitSchema } from "@/lib/analytics/validation";
import { recordSiteVisit } from "@/lib/server/site-visits";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = recordSiteVisitSchema.parse(json);
    await recordSiteVisit({
      path: input.path,
      referrer: input.referrer,
      userAgent: request.headers.get("user-agent"),
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid visit payload.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    console.error("[analytics/visit]", error);
    return Response.json(
      {
        error: "Unable to record visit.",
        detail:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
