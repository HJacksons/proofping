import { AdminRequiredError } from "@/lib/server/admin-errors";
import { requireAdminUser } from "@/lib/server/admin";
import { closeAdminProofRequest } from "@/lib/server/admin-asks";
import { AuthRequiredError } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const result = await closeAdminProofRequest(id);

    if (!result.closed) {
      return Response.json(
        { error: "Ask not found or already closed." },
        { status: 404 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AdminRequiredError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json({ error: "Unable to close ask." }, { status: 500 });
  }
}
