import { ZodError, z } from "zod";

import { AdminRequiredError } from "@/lib/server/admin-errors";
import { requireAdminUser } from "@/lib/server/admin";
import { AuthRequiredError } from "@/lib/server/auth";
import { seedSampleActivity } from "@/lib/server/sample-activity";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  confirm: z.literal(true),
});

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const json = await request.json().catch(() => ({}));
    bodySchema.parse(json);

    const result = await seedSampleActivity();

    return Response.json({
      ok: true,
      message: "Sample Help nearby activity loaded.",
      ...result,
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AdminRequiredError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof ZodError) {
      return Response.json(
        { error: "Send { \"confirm\": true } to load sample activity." },
        { status: 400 },
      );
    }

    console.error("[admin/samples/seed]", error);
    return Response.json(
      { error: "Unable to load sample activity." },
      { status: 500 },
    );
  }
}
