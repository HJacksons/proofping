import { ZodError } from "zod";

import { recordSiteVisitSchema } from "@/lib/analytics/validation";
import { resolveRequestCountryCode } from "@/lib/server/request-country";
import { recordSiteVisit } from "@/lib/server/site-visits";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = recordSiteVisitSchema.parse(json);
    const countryCode = await resolveRequestCountryCode(request.headers);

    await recordSiteVisit({
      path: input.path,
      referrer: input.referrer,
      userAgent: request.headers.get("user-agent"),
      countryCode,
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
