import "server-only";

import type { NearbyAlertsPrefsInput } from "@/lib/nearby-alerts/validation";
import { requireCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { ensureUserForAuth } from "@/lib/server/users";

export type NearbyAlertsPrefsDTO = {
  enabled: boolean;
  location: string | null;
};

export async function getNearbyAlertsPrefs(): Promise<NearbyAlertsPrefsDTO | null> {
  const authUser = await requireCurrentUser().catch(() => null);

  if (!authUser) {
    return null;
  }

  const user = await ensureUserForAuth(authUser);
  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      nearbyAlertsEnabled: true,
      nearbyAlertsLocation: true,
    },
  });

  if (!row) {
    return null;
  }

  return {
    enabled: row.nearbyAlertsEnabled,
    location: row.nearbyAlertsLocation,
  };
}

export async function updateNearbyAlertsPrefs(
  input: NearbyAlertsPrefsInput,
): Promise<NearbyAlertsPrefsDTO> {
  const authUser = await requireCurrentUser();
  const user = await ensureUserForAuth(authUser);

  const row = await prisma.user.update({
    where: { id: user.id },
    data: {
      nearbyAlertsEnabled: input.enabled,
      nearbyAlertsLocation: input.enabled ? input.location : null,
    },
    select: {
      nearbyAlertsEnabled: true,
      nearbyAlertsLocation: true,
    },
  });

  return {
    enabled: row.nearbyAlertsEnabled,
    location: row.nearbyAlertsLocation,
  };
}
