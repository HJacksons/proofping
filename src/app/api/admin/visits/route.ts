import { ZodError } from "zod";

import { adminVisitsQuerySchema } from "@/lib/analytics/validation";
import { AdminRequiredError } from "@/lib/server/admin-errors";
import { requireAdminUser } from "@/lib/server/admin";
import { AuthRequiredError } from "@/lib/server/auth";
import { getSiteVisitStats } from "@/lib/server/site-visits";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const { searchParams } = new URL(request.url);
    const query = adminVisitsQuerySchema.parse({
      days: searchParams.get("days") ?? undefined,
    });
    const stats = await getSiteVisitStats(query.days);

    return Response.json({ stats });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid query.",
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

    if (error instanceof AdminRequiredError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json({ error: "Unable to load visit stats." }, { status: 500 });
  }
}
