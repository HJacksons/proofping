import { ZodError } from "zod";

import { nearbyAlertsPrefsSchema } from "@/lib/nearby-alerts/validation";
import {
  AdultVerificationRequiredError,
  AuthRequiredError,
} from "@/lib/server/auth";
import {
  getNearbyAlertsPrefs,
  updateNearbyAlertsPrefs,
} from "@/lib/server/nearby-alert-prefs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prefs = await getNearbyAlertsPrefs();

    if (!prefs) {
      return Response.json({ prefs: null });
    }

    return Response.json({ prefs });
  } catch (error) {
    return prefsErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const input = nearbyAlertsPrefsSchema.parse(json);
    const prefs = await updateNearbyAlertsPrefs(input);

    return Response.json({ prefs });
  } catch (error) {
    return prefsErrorResponse(error);
  }
}

function prefsErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Invalid nearby alert settings.",
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

  return Response.json(
    { error: "Unable to update nearby alerts." },
    { status: 500 },
  );
}
