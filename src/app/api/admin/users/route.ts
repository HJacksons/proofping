import { AdminRequiredError } from "@/lib/server/admin-errors";
import { requireAdminUser } from "@/lib/server/admin";
import { getAdminUserPlaceOverview } from "@/lib/server/admin-users";
import { AuthRequiredError } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminUser();
    const overview = await getAdminUserPlaceOverview();
    return Response.json({ overview });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AdminRequiredError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json(
      { error: "Unable to load users and places." },
      { status: 500 },
    );
  }
}
